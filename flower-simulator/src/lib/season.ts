/**
 * 開催日から「月」と「季節」を判定し、その時期の花を取り出します。
 * 月ごとの花は src/config/shop.ts の monthlyFlowers で管理しています。
 */

import { shopConfig } from '@/config/shop';
import type { SeasonalFlower } from '@/types';

/** 'YYYY-MM-DD' から月（1〜12）を取り出します。取得できない場合は null。 */
export function getMonthFromDate(dateString: string): number | null {
  if (!dateString) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return null;
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return month;
}

/** 月から季節の言葉を返します（プランタイトル・コンセプト文で使用）。 */
export function getSeasonWord(month: number | null): string {
  if (month === null) return '';
  if (month === 3 || month === 4) return '春';
  if (month === 5) return '初夏';
  if (month === 6 || month === 7 || month === 8) return '夏';
  if (month === 9 || month === 10) return '秋';
  if (month === 11) return '晩秋';
  return '冬';
}

/** 月から、コンセプト文に差し込む季節の表現を返します。 */
export function getSeasonPhrase(month: number | null): string {
  if (month === null) return '';
  if (month === 3 || month === 4) return '春らしい柔らかな';
  if (month === 5) return '初夏らしい軽やかな';
  if (month >= 6 && month <= 8) return '夏らしい生命感のある';
  if (month === 9 || month === 10) return '秋らしい深みのある';
  if (month === 11) return '晩秋らしい落ち着いた';
  return '冬らしい凛とした';
}

/** その月におすすめの花を返します。日付が未入力の場合は空配列。 */
export function getFlowersForMonth(month: number | null): SeasonalFlower[] {
  if (month === null) return [];
  const ids = shopConfig.monthlyFlowers[month] ?? [];
  return ids
    .map((id) => shopConfig.flowers.find((flower) => flower.id === id))
    .filter((flower): flower is SeasonalFlower => Boolean(flower));
}

/** idの配列から花のデータを取り出します（結果画面で使用）。 */
export function getFlowersByIds(ids: string[]): SeasonalFlower[] {
  return ids
    .map((id) => shopConfig.flowers.find((flower) => flower.id === id))
    .filter((flower): flower is SeasonalFlower => Boolean(flower));
}
