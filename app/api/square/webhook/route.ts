import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyWebhookSignature } from '@/lib/square';
import { settleParticipantPayment } from '@/lib/payments';
import type { Participant } from '@/lib/types';
import { absoluteUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

/**
 * Square からの決済通知。
 *
 * 参加者がブラウザを閉じてしまい戻り先ページを開かなかった場合でも、
 * ここで支払いを確定させる。
 *
 * Square 開発者ダッシュボードで、通知URLを
 *   https://<本番ドメイン>/api/square/webhook
 * に設定し、payment.updated / order.updated を購読してください。
 * 署名検証は「通知URL + ボディ生文字列」で行うため、設定したURLと
 * NEXT_PUBLIC_APP_URL の組み合わせが一致している必要があります。
 */
export async function POST(request: Request) {
  const rawBody = await request.text();

  const notificationUrl = absoluteUrl(
    request.headers.get('host'),
    request.headers.get('x-forwarded-proto'),
    '/api/square/webhook'
  );

  const valid = verifyWebhookSignature({
    rawBody,
    signatureHeader: request.headers.get('x-square-hmacsha256-signature'),
    notificationUrl
  });

  if (!valid) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const orderId = extractOrderId(event);
  if (!orderId) {
    // 対象外のイベントは正常終了で受け流す（Square の再送を止めるため）
    return NextResponse.json({ ok: true });
  }

  const supabase = createAdminClient();
  const { data: participantRow } = await supabase
    .from('participants')
    .select('id, amount, payment_status, square_order_id')
    .eq('square_order_id', orderId)
    .maybeSingle();

  if (!participantRow) {
    return NextResponse.json({ ok: true });
  }

  await settleParticipantPayment(
    participantRow as Pick<Participant, 'id' | 'amount' | 'payment_status' | 'square_order_id'>
  );

  return NextResponse.json({ ok: true });
}

/** payment.updated / order.updated のどちらからでも order_id を取り出す。 */
function extractOrderId(event: unknown): string | null {
  if (!event || typeof event !== 'object') return null;
  const data = (event as { data?: { object?: Record<string, unknown> } }).data;
  const object = data?.object;
  if (!object) return null;

  const payment = object.payment as { order_id?: string } | undefined;
  if (payment?.order_id) return payment.order_id;

  const order = object.order as { id?: string } | undefined;
  if (order?.id) return order.id;

  const orderUpdated = object.order_updated as { order_id?: string } | undefined;
  if (orderUpdated?.order_id) return orderUpdated.order_id;

  return null;
}
