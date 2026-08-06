import type { Participant, ProductionStatus } from '@/lib/types';

export function formatYen(value: number): string {
  return `¥${Math.round(value).toLocaleString('ja-JP')}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00+09:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'Asia/Tokyo'
  }).format(date);
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo'
  }).format(date);
}

export function displayName(participant: Pick<Participant, 'name' | 'is_anonymous'>): string {
  return participant.is_anonymous ? '匿名希望' : participant.name;
}

export function sumAmount(participants: Pick<Participant, 'amount'>[]): number {
  return participants.reduce((total, p) => total + p.amount, 0);
}

/** 日本時間の「今日」を YYYY-MM-DD で返す。 */
export function todayInJst(): string {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function isDeadlinePassed(deadline: string): boolean {
  return deadline < todayInJst();
}

export const PRODUCTION_STATUS_LABEL: Record<ProductionStatus, string> = {
  pending: '未対応',
  accepted: '受注済み',
  in_progress: '制作中',
  completed: '完成',
  delivered: 'お届け済み'
};

export const PRODUCTION_STATUS_ORDER: ProductionStatus[] = [
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'delivered'
];

export function productionStatusClass(status: ProductionStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-ivory text-muted';
    case 'accepted':
      return 'bg-sakura/60 text-ink';
    case 'in_progress':
      return 'bg-amber-50 text-amber-800';
    case 'completed':
      return 'bg-moss/20 text-moss';
    case 'delivered':
      return 'bg-moss text-white';
  }
}

/** CSV セルのエスケープ。数式インジェクションも無効化する。 */
export function csvCell(value: string | number | boolean | null | undefined): string {
  let text = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildCsv(rows: (string | number | boolean | null | undefined)[][]): string {
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
}

/** ファイル名に使えない文字を除去する。 */
export function safeFileName(value: string, fallback = 'export'): string {
  const cleaned = value.replace(/[^\p{L}\p{N}ー－_-]/gu, '_').slice(0, 40);
  return cleaned.length > 0 ? cleaned : fallback;
}

export function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? '';
}

/** リクエストのホストから共有用の絶対URLを組み立てる。 */
export function absoluteUrl(host: string | null, forwardedProto: string | null, path: string) {
  const configured = appUrl();
  if (configured) return `${configured}${path}`;
  if (!host) return path;
  const protocol = forwardedProto === 'http' ? 'http' : 'https';
  return `${protocol}://${host}${path}`;
}
