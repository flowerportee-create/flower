import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Square 連携。
 *
 * 決済リンク（Square Checkout）方式を使うため、カード番号は自社サーバーを一切通りません。
 * 参加者は Square がホストする決済ページへ遷移し、支払い後に戻ってきます。
 *
 * REST API を直接呼びます（SDK を入れないのは、必要なのが3エンドポイントだけで、
 * BigInt を含む SDK の型変換を挟むより素直なため）。
 */

/** Square API のバージョン。上げるときは変更履歴を確認すること。 */
const SQUARE_VERSION = '2026-07-15';

function apiBase(): string {
  return process.env.SQUARE_ENVIRONMENT === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
}

export function squareConfigured(): boolean {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

function accessToken(): string {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  if (!token) throw new Error('SQUARE_ACCESS_TOKEN が設定されていません。');
  return token;
}

async function squareFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken()}`,
      'Square-Version': SQUARE_VERSION,
      'Content-Type': 'application/json',
      ...init.headers
    }
  });

  const text = await response.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const detail = extractSquareError(body);
    throw new SquareApiError(
      `Square API ${response.status}: ${detail ?? 'エラーの詳細を取得できませんでした'}`,
      response.status
    );
  }

  return body;
}

export class SquareApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'SquareApiError';
    this.status = status;
  }
}

function extractSquareError(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;
  const errors = (body as { errors?: unknown }).errors;
  if (!Array.isArray(errors) || errors.length === 0) return null;
  return errors
    .map((e) => {
      if (!e || typeof e !== 'object') return '';
      const { code, detail } = e as { code?: string; detail?: string };
      return detail ?? code ?? '';
    })
    .filter(Boolean)
    .join(' / ');
}

export type PaymentLinkResult = {
  paymentLinkId: string;
  orderId: string;
  url: string;
};

/**
 * 単発の商品（お花への参加金額）に対する決済リンクを作る。
 *
 * @param amountYen 円単位。JPY は最小単位が1円なのでそのまま渡す。
 */
export async function createPaymentLink(params: {
  name: string;
  amountYen: number;
  redirectUrl: string;
  idempotencyKey: string;
  note?: string;
  buyerEmail?: string;
}): Promise<PaymentLinkResult> {
  const locationId = process.env.SQUARE_LOCATION_ID;
  if (!locationId) throw new Error('SQUARE_LOCATION_ID が設定されていません。');

  const amount = Math.floor(params.amountYen);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('決済金額が不正です。');
  }

  const body = {
    idempotency_key: params.idempotencyKey,
    quick_pay: {
      name: params.name.slice(0, 255),
      price_money: { amount, currency: 'JPY' },
      location_id: locationId
    },
    checkout_options: {
      redirect_url: params.redirectUrl,
      ask_for_shipping_address: false,
      allow_tipping: false
    },
    ...(params.note ? { payment_note: params.note.slice(0, 500) } : {}),
    ...(params.buyerEmail ? { pre_populated_data: { buyer_email: params.buyerEmail } } : {})
  };

  const result = (await squareFetch('/v2/online-checkout/payment-links', {
    method: 'POST',
    body: JSON.stringify(body)
  })) as { payment_link?: { id?: string; order_id?: string; url?: string; long_url?: string } };

  const link = result?.payment_link;
  if (!link?.url || !link.order_id || !link.id) {
    throw new Error('Square から決済リンクを取得できませんでした。');
  }

  return { paymentLinkId: link.id, orderId: link.order_id, url: link.url };
}

export type OrderPaymentState = {
  paid: boolean;
  state: string | null;
  paymentId: string | null;
  amountYen: number | null;
};

/**
 * 注文の支払い状況を Square に問い合わせる。
 *
 * 戻り先URLのクエリパラメータは環境によって付き方が変わる報告があるため、
 * 支払い確定の判定は必ずこの API の結果を使う。
 */
export async function getOrderPaymentState(orderId: string): Promise<OrderPaymentState> {
  const result = (await squareFetch(`/v2/orders/${encodeURIComponent(orderId)}`)) as {
    order?: {
      state?: string;
      total_money?: { amount?: number };
      tenders?: { id?: string; payment_id?: string }[];
      net_amount_due_money?: { amount?: number };
    };
  };

  const order = result?.order;
  if (!order) return { paid: false, state: null, paymentId: null, amountYen: null };

  const tender = order.tenders?.[0];
  // 未払い残高が 0、かつ注文が COMPLETED なら支払い済みとみなす。
  const due = order.net_amount_due_money?.amount;
  const paid = order.state === 'COMPLETED' && (due === undefined || due === 0);

  return {
    paid,
    state: order.state ?? null,
    paymentId: tender?.payment_id ?? tender?.id ?? null,
    amountYen: typeof order.total_money?.amount === 'number' ? order.total_money.amount : null
  };
}

/**
 * Webhook の署名を検証する。
 *
 * Square は「通知URL + リクエストボディ生文字列」を署名キーで HMAC-SHA256 し、
 * base64 にしたものを x-square-hmacsha256-signature ヘッダーで送ってくる。
 */
export function verifyWebhookSignature(params: {
  rawBody: string;
  signatureHeader: string | null;
  notificationUrl: string;
}): boolean {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key || !params.signatureHeader) return false;

  const expected = createHmac('sha256', key)
    .update(params.notificationUrl + params.rawBody)
    .digest('base64');

  const a = Buffer.from(expected);
  const b = Buffer.from(params.signatureHeader);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
