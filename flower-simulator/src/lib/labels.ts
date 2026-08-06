/**
 * 選択肢の値（内部の英語キー）を、画面に表示する日本語に変換する対応表です。
 * 表示文言を変えたいときは、ここの日本語部分を書き換えてください。
 */

import type {
  AreaPriority,
  BudgetFlexibility,
  BrightnessLevel,
  ContactMethod,
  FlowerAvailability,
  FlowerPriceLevel,
  RemovalType,
  SaturationLevel,
  TaxType,
  TriState,
  VenueLocationType,
  VenueSize,
} from '@/types';

export const locationTypeLabels: Record<VenueLocationType, string> = {
  indoor: '屋内',
  outdoor: '屋外',
  both: '屋内・屋外の両方',
  unknown: '未定・分からない',
};

export const venueSizeLabels: Record<VenueSize, string> = {
  small: '小規模',
  medium: '中規模',
  large: '大規模',
  unknown: '分からない',
};

export const removalLabels: Record<RemovalType, string> = {
  required: '撤去あり',
  notRequired: '撤去なし',
  undecided: '未定',
};

export const taxTypeLabels: Record<TaxType, string> = {
  included: '税込',
  excluded: '税別',
  unknown: '分からない',
};

export const triStateLabels: Record<TriState, string> = {
  yes: '含む',
  no: '含まない',
  unknown: '分からない',
};

export const flexibilityLabels: Record<Exclude<BudgetFlexibility, ''>, string> = {
  strict: '予算内を厳守したい',
  negotiable: '内容次第で多少相談可能',
  idealFirst: '理想を優先して提案してほしい',
};

export const saturationLabels: Record<Exclude<SaturationLevel, ''>, string> = {
  pale: '淡い',
  muted: 'くすみ',
  vivid: '鮮やか',
  deep: '深み',
  any: 'おまかせ',
};

export const brightnessLabels: Record<Exclude<BrightnessLevel, ''>, string> = {
  bright: '明るい',
  calm: '落ち着いた',
  dark: 'ダーク',
  any: 'おまかせ',
};

export const priceLevelLabels: Record<FlowerPriceLevel, string> = {
  affordable: '比較的取り入れやすい',
  standard: '標準的',
  premium: '高価になりやすい',
};

export const availabilityLabels: Record<FlowerAvailability, string> = {
  stable: '比較的安定',
  varies: '時期により変動',
  limited: '入荷が限られる場合がある',
};

export const priorityLabels: Record<AreaPriority, string> = {
  high: '優先したい',
  medium: 'できれば入れたい',
  low: '予算があれば',
};

export const contactMethodLabels: Record<Exclude<ContactMethod, ''>, string> = {
  email: 'メール',
  phone: '電話',
  line: 'LINE',
  any: 'どれでもよい',
};

/** 選択肢を「値 + 表示名」の配列に変換します（ラジオボタンの描画用） */
export function toOptions<T extends string>(labels: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
