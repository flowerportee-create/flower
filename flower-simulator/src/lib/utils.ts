/** 汎用のヘルパー関数 */

/** クラス名を結合します（false / undefined は無視されます） */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** 数値を「12,000円」の形式にします */
export function formatYen(amount: number): string {
  return `${Math.round(amount).toLocaleString('ja-JP')}円`;
}

/** 'YYYY-MM-DD' を「2026年10月15日（木）」の形式にします */
export function formatJapaneseDate(dateString: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return dateString;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  if (Number.isNaN(date.getTime())) return dateString;
  return `${Number(year)}年${Number(month)}月${Number(day)}日（${weekdays[date.getDay()]}）`;
}

/** 空でない値だけを「、」でつなぎます */
export function joinNonEmpty(values: (string | undefined | null)[], separator = '、'): string {
  return values.filter((value): value is string => Boolean(value && value.trim())).join(separator);
}

/** 配列に値があれば取り除き、なければ追加します（複数選択の切り替えに使用） */
export function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** ランダムなIDを生成します（画像の識別用） */
export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
