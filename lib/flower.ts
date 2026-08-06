/**
 * 金額・立て札・お花の見た目にまつわる決めごと。
 * 参加ページ・幹事画面・花屋画面で同じ判定を使うため、ここに集約する。
 */

/** 参加金額のプルダウンに並べる一口金額。 */
export const UNIT_AMOUNT_OPTIONS = [5000, 10000, 20000, 30000, 50000, 100000] as const;

/** 「それ以上」を選んだときに自由入力できる下限。 */
export const CUSTOM_AMOUNT_MIN = 100000;

/** 1件あたりの上限（入力ミスによる高額決済を防ぐ）。 */
export const AMOUNT_MAX = 1_000_000;

export type TagSizeKey = 'small' | 'medium' | 'large' | 'xlarge';

export type TagSize = {
  key: TagSizeKey;
  /** 立て札での名前の大きさの呼び名。 */
  label: string;
  /** 立札プレビューでの相対的な文字サイズ（倍率）。 */
  scale: number;
  /** この段階になる金額の下限。 */
  from: number;
  description: string;
};

/**
 * 金額の段階。連名の立て札は、多く出した方のお名前を大きく入れる慣習に合わせている。
 * 段階の境目を変えるときは、参加ページの案内文も合わせて確認すること。
 */
export const TAG_SIZES: TagSize[] = [
  {
    key: 'small',
    label: '標準',
    scale: 1,
    from: 0,
    description: '連名の中で同じ大きさで入ります。'
  },
  {
    key: 'medium',
    label: '中',
    scale: 1.28,
    from: 10000,
    description: '標準より一回り大きく入ります。'
  },
  {
    key: 'large',
    label: '大',
    scale: 1.62,
    from: 30000,
    description: '目立つ大きさで入ります。'
  },
  {
    key: 'xlarge',
    label: '特大',
    scale: 2.05,
    from: 100000,
    description: '筆頭として最も大きく入ります。'
  }
];

/** 立て札への載せ方の選択肢。 */
export const TAG_STYLES = [
  {
    key: 'title_name',
    label: '肩書きとお名前',
    example: '営業部長 山田 太郎'
  },
  {
    key: 'name',
    label: 'お名前のみ',
    example: '山田 太郎'
  },
  {
    key: 'none',
    label: '立て札に載せない',
    example: '—'
  }
] as const;

export type TagStyleKey = (typeof TAG_STYLES)[number]['key'];

export function isTagStyle(value: string): value is TagStyleKey {
  return TAG_STYLES.some((s) => s.key === value);
}

export function tagStyleLabel(key: string): string {
  return TAG_STYLES.find((s) => s.key === key)?.label ?? 'お名前のみ';
}

/**
 * 立て札に実際に入る文字列を組み立てる。
 * 肩書きが空のまま「肩書きとお名前」を選んだ場合は、お名前だけになる。
 */
export function tagLine(participant: {
  name: string;
  title: string;
  tag_style: string;
  is_anonymous: boolean;
}): string | null {
  if (participant.is_anonymous || participant.tag_style === 'none') return null;
  const title = participant.title.trim();
  if (participant.tag_style === 'title_name' && title) {
    return `${title} ${participant.name}`;
  }
  return participant.name;
}

export function tagSizeFor(amount: number): TagSize {
  let matched = TAG_SIZES[0];
  for (const size of TAG_SIZES) {
    if (amount >= size.from) matched = size;
  }
  return matched;
}

/** 用途。企画作成時に幹事が選ぶ。 */
export const PURPOSES = [
  { key: 'opening', label: '開店・開業祝い' },
  { key: 'promotion', label: '就任・昇進・栄転祝い' },
  { key: 'stage', label: '公演・発表会・個展' },
  { key: 'anniversary', label: '周年・記念日' },
  { key: 'newoffice', label: '新築・移転祝い' },
  { key: 'wedding', label: '結婚・出産祝い' },
  { key: 'other', label: 'その他のお祝い' }
] as const;

export type PurposeKey = (typeof PURPOSES)[number]['key'];

export function purposeLabel(key: string): string {
  return PURPOSES.find((p) => p.key === key)?.label ?? 'お祝い';
}

export function isPurposeKey(value: string): value is PurposeKey {
  return PURPOSES.some((p) => p.key === value);
}

/** 希望カラー。イラストの配色にそのまま使う。 */
export const COLOR_THEMES = [
  {
    key: 'white',
    label: '白・グリーン',
    petals: ['#FFFFFF', '#F7F4EC', '#FBFAF7'],
    centers: '#EFE4C8',
    leaves: '#8FA58A',
    background: '#F7F5F0'
  },
  {
    key: 'pink',
    label: 'ピンク',
    petals: ['#F6D8DE', '#EFC2CC', '#FBEAEE'],
    centers: '#E7A9B6',
    leaves: '#93A98D',
    background: '#FBF3F4'
  },
  {
    key: 'red',
    label: '赤・ビビッド',
    petals: ['#D4626A', '#C04A54', '#E58189'],
    centers: '#A83B44',
    leaves: '#7E9679',
    background: '#F9F0EF'
  },
  {
    key: 'yellow',
    label: '黄・オレンジ',
    petals: ['#F2C46B', '#E9A94F', '#F7DC9E'],
    centers: '#D8913A',
    leaves: '#8CA37F',
    background: '#FAF5EA'
  },
  {
    key: 'purple',
    label: '紫・青',
    petals: ['#B3A5CE', '#9A88BE', '#CFC5E1'],
    centers: '#7E6BA6',
    leaves: '#8598A0',
    background: '#F4F2F8'
  },
  {
    key: 'mixed',
    label: 'カラフルミックス',
    petals: ['#F0B9C4', '#F2C46B', '#B3A5CE'],
    centers: '#E08A6B',
    leaves: '#8FA58A',
    background: '#F8F4F1'
  }
] as const;

export type ColorKey = (typeof COLOR_THEMES)[number]['key'];
export type ColorTheme = (typeof COLOR_THEMES)[number];

export function colorTheme(key: string): ColorTheme {
  return COLOR_THEMES.find((c) => c.key === key) ?? COLOR_THEMES[0];
}

export function colorLabel(key: string): string {
  return COLOR_THEMES.find((c) => c.key === key)?.label ?? '';
}

export function isColorKey(value: string): value is ColorKey {
  return COLOR_THEMES.some((c) => c.key === value);
}

/** 花の形。用途に応じて既定の見せ方を変える。 */
export type ArrangementKind = 'stand' | 'orchid' | 'arrangement' | 'bouquet';

export const ARRANGEMENTS: { key: ArrangementKind; label: string }[] = [
  { key: 'stand', label: 'スタンド花' },
  { key: 'orchid', label: '胡蝶蘭' },
  { key: 'arrangement', label: 'アレンジメント' },
  { key: 'bouquet', label: '花束' }
];

export function arrangementLabel(key: string): string {
  return ARRANGEMENTS.find((a) => a.key === key)?.label ?? 'スタンド花';
}

export function isArrangementKind(value: string): value is ArrangementKind {
  return ARRANGEMENTS.some((a) => a.key === value);
}

/** 用途からおすすめの花の形を決める。 */
export function defaultArrangement(purpose: string): ArrangementKind {
  switch (purpose) {
    case 'opening':
    case 'stage':
      return 'stand';
    case 'promotion':
    case 'newoffice':
      return 'orchid';
    case 'wedding':
      return 'bouquet';
    default:
      return 'arrangement';
  }
}
