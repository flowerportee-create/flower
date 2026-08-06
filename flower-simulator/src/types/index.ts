/**
 * =============================================================================
 * 型定義（データ構造）
 * =============================================================================
 * このファイルはアプリ全体で使う「データの形」を定義しています。
 * 通常のカスタマイズ（店名・色・花の変更など）では触る必要はありません。
 * 設定変更は src/config/shop.ts を編集してください。
 * =============================================================================
 */

/* -------------------------------------------------------------------------- */
/* STEP 1: シーン                                                              */
/* -------------------------------------------------------------------------- */

/** シーンのID。設定ファイルの scenes[].id と対応します。 */
export type SceneId = string;

/** 開催シーン（ブライダル・パーティーなど） */
export interface Scene {
  id: SceneId;
  /** 画面に表示する名前 */
  name: string;
  /** カードに表示する短い説明 */
  description: string;
  /** 画像パス（例: /images/scenes/bridal.svg）。省略時は自動生成のグラデーションを表示 */
  image?: string;
  /** プランタイトル生成に使う言葉（例: 「ウェディング」） */
  titleWord: string;
  /**
   * このシーンでのみ追加表示する装花場所のID一覧。
   * 共通の装花場所（commonDecorationAreaIds）に追加されます。
   */
  extraAreaIds?: string[];
}

/* -------------------------------------------------------------------------- */
/* STEP 2: 会場情報                                                            */
/* -------------------------------------------------------------------------- */

/** 屋内／屋外 */
export type VenueLocationType = 'indoor' | 'outdoor' | 'both' | 'unknown';

/** 会場の広さ */
export type VenueSize = 'small' | 'medium' | 'large' | 'unknown';

/** 撤去の有無 */
export type RemovalType = 'required' | 'notRequired' | 'undecided';

export interface VenueInfo {
  /** 開催日（YYYY-MM-DD）※必須 */
  eventDate: string;
  /** 会場名 */
  venueName: string;
  /** 開催地域（例: 東京都世田谷区） */
  area: string;
  /** 屋内／屋外 ※必須 */
  locationType: VenueLocationType | '';
  /** 参加人数 ※必須 */
  guestCount: number | '';
  /** 会場の広さ */
  venueSize: VenueSize | '';
  /** テーブル数 */
  tableCount: number | '';
  /** 開催時間（例: 13:00〜16:00） */
  eventTime: string;
  /** 搬入希望時間（例: 10:00頃） */
  loadInTime: string;
  /** 撤去の有無 */
  removal: RemovalType | '';
  /** その他の会場情報（自由入力） */
  venueNotes: string;
}

/* -------------------------------------------------------------------------- */
/* STEP 3: 予算                                                                */
/* -------------------------------------------------------------------------- */

/** 予算帯のID */
export type BudgetRangeId = string;

/** 予算帯（5万円未満、5〜10万円 など） */
export interface BudgetRange {
  id: BudgetRangeId;
  /** 画面に表示するラベル */
  label: string;
  /**
   * 予算配分の計算に使う代表金額（円）。
   * null の場合は「まだ決めていない」として金額計算を行わず、割合のみ表示します。
   */
  representativeAmount: number | null;
}

/** 税込／税別 */
export type TaxType = 'included' | 'excluded' | 'unknown';

/** 予算の柔軟性 */
export type BudgetFlexibility = 'strict' | 'negotiable' | 'idealFirst' | '';

/** はい／いいえ／わからない */
export type TriState = 'yes' | 'no' | 'unknown';

export interface BudgetInfo {
  /** 入力方法（金額の直接入力 or 予算帯の選択） */
  inputMode: 'amount' | 'range';
  /** 装花全体の予算（円）。inputMode === 'amount' のときに使用 */
  amount: number | '';
  /** 予算帯のID。inputMode === 'range' のときに使用 */
  rangeId: BudgetRangeId | '';
  /** 税込／税別 */
  taxType: TaxType | '';
  /** 搬入設営費を予算に含むか */
  includesSetupFee: TriState | '';
  /** 撤去費を予算に含むか */
  includesRemovalFee: TriState | '';
  /** 予算の柔軟性 */
  flexibility: BudgetFlexibility;
}

/* -------------------------------------------------------------------------- */
/* STEP 4: テーマ                                                              */
/* -------------------------------------------------------------------------- */

export interface ThemeInfo {
  /** イベントや装花のテーマ */
  theme: string;
  /** コンセプト */
  concept: string;
  /** 来場者に感じてほしい印象（タグID一覧・複数選択可） */
  impressionTags: string[];
  /** 使用したい言葉 */
  keywords: string;
  /** 避けたい印象 */
  avoidImpression: string;
}

/** 印象タグ（上質・華やか など） */
export interface ImpressionTag {
  id: string;
  label: string;
}

/* -------------------------------------------------------------------------- */
/* STEP 5: テイスト                                                            */
/* -------------------------------------------------------------------------- */

export interface StyleOption {
  id: string;
  /** テイスト名（例: ナチュラル） */
  name: string;
  /** 短い説明（カードに表示） */
  description: string;
  /** 画像パス（例: /images/styles/natural.svg） */
  image?: string;
  /** プランタイトルに使う修飾語（例: 「洗練された」） */
  titleWord: string;
  /** コンセプト文に使う一文（例: 「作り込みすぎない自然な質感を大切にし」） */
  conceptPhrase: string;
}

/* -------------------------------------------------------------------------- */
/* STEP 6: カラー                                                              */
/* -------------------------------------------------------------------------- */

export interface ColorOption {
  id: string;
  /** 色名（例: ホワイト） */
  name: string;
  /** カラーパレット表示に使う色コード（例: #FFFFFF） */
  hex: string;
  /**
   * 複数色を表す選択肢（ニュアンスカラー・カラフルなど）の場合に指定。
   * 指定するとグラデーションのチップで表示されます。
   */
  gradient?: string[];
  /** 明るい色かどうか（枠線の描画に使用） */
  isLight?: boolean;
}

/** 彩度 */
export type SaturationLevel = 'pale' | 'muted' | 'vivid' | 'deep' | 'any' | '';

/** 明るさ */
export type BrightnessLevel = 'bright' | 'calm' | 'dark' | 'any' | '';

export interface ColorInfo {
  /** メインカラー（1つだけ選択） */
  mainColorId: string;
  /** サブカラー（複数選択可） */
  subColorIds: string[];
  /** アクセントカラー（複数選択可） */
  accentColorIds: string[];
  /** 避けたい色（複数選択可） */
  avoidColorIds: string[];
  /** 彩度 */
  saturation: SaturationLevel;
  /** 明るさ */
  brightness: BrightnessLevel;
}

/* -------------------------------------------------------------------------- */
/* STEP 7: 季節の花                                                            */
/* -------------------------------------------------------------------------- */

/** 価格帯の目安 */
export type FlowerPriceLevel = 'affordable' | 'standard' | 'premium';

/** 流通の安定性 */
export type FlowerAvailability = 'stable' | 'varies' | 'limited';

export interface SeasonalFlower {
  id: string;
  /** 花名（例: チューリップ） */
  name: string;
  /** 画像パス（例: /images/flowers/tulip.svg） */
  image?: string;
  /** 特徴（1〜2行の短い説明） */
  feature: string;
  /** 主な色（表示用の文字列。例: 「白／ピンク／赤／黄」） */
  mainColors: string;
  /** 価格帯の目安 */
  priceLevel: FlowerPriceLevel;
  /** 流通の安定性 */
  availability: FlowerAvailability;
}

/* -------------------------------------------------------------------------- */
/* STEP 8: 装花場所                                                            */
/* -------------------------------------------------------------------------- */

/** 装花場所の重要度 */
export type AreaPriority = 'high' | 'medium' | 'low';

export interface DecorationArea {
  id: string;
  /** 装花場所名（例: エントランス） */
  name: string;
  /** 短い説明 */
  description: string;
  /**
   * 予算配分の重み。数字が大きいほど多くの予算が配分されます。
   * 目安: 大きな装花 = 3〜5 / 中くらい = 2 / 小さな装花 = 1
   */
  weight: number;
}

/** ユーザーが選択した装花場所と、その優先度 */
export interface SelectedArea {
  areaId: string;
  priority: AreaPriority;
}

/* -------------------------------------------------------------------------- */
/* STEP 9: 参考イメージ                                                        */
/* -------------------------------------------------------------------------- */

/** アップロードされた参考画像（ブラウザ内でのみ保持します） */
export interface ReferenceImage {
  id: string;
  /** ファイル名 */
  name: string;
  /** 圧縮後のデータURL（data:image/jpeg;base64,...） */
  dataUrl: string;
  /** 種別（参考イメージ／会場写真） */
  kind: 'reference' | 'venue';
}

export interface ReferenceInfo {
  /** アップロードした参考画像・会場写真 */
  images: ReferenceImage[];
  /** 参考画像のURL、Instagram / Pinterest のURLなど（改行区切り） */
  referenceUrls: string;
  /** 画像のどこが好きか */
  likedPoints: string;
  /** 避けたいデザイン */
  avoidDesign: string;
}

/* -------------------------------------------------------------------------- */
/* STEP 10: 連絡先                                                             */
/* -------------------------------------------------------------------------- */

/** 希望する連絡方法 */
export type ContactMethod = 'email' | 'phone' | 'line' | 'any' | '';

export interface ContactInfo {
  /** 氏名 ※必須 */
  name: string;
  /** 会社名・団体名 */
  company: string;
  /** メールアドレス ※必須 */
  email: string;
  /** 電話番号 */
  phone: string;
  /** 希望する連絡方法 */
  preferredMethod: ContactMethod;
  /** 相談したい内容 */
  message: string;
  /** 打ち合わせ希望日 */
  preferredMeetingDate: string;
  /** 個人情報の取り扱いへの同意 ※必須 */
  privacyAgreed: boolean;
}

/* -------------------------------------------------------------------------- */
/* 全体のフォームデータ / 結果                                                  */
/* -------------------------------------------------------------------------- */

/** シミュレーションフォームの全入力値 */
export interface SimulationFormValues {
  sceneId: SceneId;
  venue: VenueInfo;
  budget: BudgetInfo;
  theme: ThemeInfo;
  /** 選択したテイストのID一覧（複数選択可） */
  styleIds: string[];
  color: ColorInfo;
  /** 選択した花のID一覧（複数選択可） */
  flowerIds: string[];
  /** 「花屋におまかせ」を選んだか */
  flowersOmakase: boolean;
  /** 選択した装花場所と優先度 */
  areas: SelectedArea[];
  reference: ReferenceInfo;
  contact: ContactInfo;
}

/** localStorage に保存するデータ */
export interface StoredState {
  /** 保存フォーマットのバージョン（構造変更時に古いデータを破棄するため） */
  version: number;
  /** 最後に表示していたステップ番号（1〜10） */
  currentStep: number;
  /** 入力値 */
  values: SimulationFormValues;
  /** 最終更新日時（ISO文字列） */
  updatedAt: string;
  /** 全ステップを完了したか */
  completed: boolean;
}

/** 予算配分の1項目 */
export interface BudgetAllocationItem {
  areaId: string;
  /** 項目名 */
  name: string;
  /** 配分金額（円）。予算未定の場合は null */
  amount: number | null;
  /** 全体に占める割合（%、小数第1位まで） */
  ratio: number;
  /** 優先度 */
  priority: AreaPriority | null;
  /** 短い説明 */
  description: string;
  /** 装花費用ではなく諸経費（搬入設営費・撤去費）かどうか */
  isExpense?: boolean;
}

/** 予算配分の計算結果 */
export interface BudgetAllocationResult {
  /** 予算総額（円）。未定の場合は null */
  totalAmount: number | null;
  /** 金額表示ができるか（false の場合は割合のみ表示） */
  hasAmount: boolean;
  /** 配分項目の一覧 */
  items: BudgetAllocationItem[];
  /** 税込／税別の表示ラベル */
  taxLabel: string;
}

/** 結果画面に表示するプラン全体 */
export interface SimulationResult {
  /** 自動生成したプランタイトル */
  title: string;
  /** 自動生成したコンセプト文 */
  concept: string;
  /** 入力値 */
  values: SimulationFormValues;
  /** 予算配分 */
  allocation: BudgetAllocationResult;
  /** 作成日時（ISO文字列） */
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* 店舗設定                                                                    */
/* -------------------------------------------------------------------------- */

/** 問い合わせ方法 */
export type ContactChannelType = 'mailto' | 'googleForm' | 'externalForm' | 'line';

export interface ContactChannelConfig {
  /**
   * 問い合わせ方法を選びます。
   * 'mailto'       … メールソフトが開き、件名と本文が自動入力されます
   * 'googleForm'   … Googleフォームを開きます
   * 'externalForm' … 外部フォームサービス（formrun, Tally など）を開きます
   * 'line'         … LINE公式アカウントを開きます
   */
  type: ContactChannelType;
  /** type が 'mailto' のときの宛先メールアドレス */
  mailTo?: string;
  /** type が 'googleForm' / 'externalForm' / 'line' のときのURL */
  url?: string;
  /**
   * Googleフォームに内容を自動入力したい場合のみ設定します（任意）。
   * Googleフォームの「事前入力したURLを取得」で得られる entry.XXXXX を指定してください。
   */
  googleFormEntryIds?: {
    /** 氏名を入れる項目 */
    name?: string;
    /** メールアドレスを入れる項目 */
    email?: string;
    /** 電話番号を入れる項目 */
    phone?: string;
    /** 相談内容（プラン要約）を入れる項目 */
    summary?: string;
  };
  /** ボタンに表示する文言 */
  buttonLabel: string;
  /** ボタンの下に表示する補足文 */
  note: string;
}

/** 予算配分ルール */
export interface BudgetRuleConfig {
  /** 優先度ごとの係数（大きいほど多く配分されます） */
  priorityCoefficients: Record<AreaPriority, number>;
  /** 搬入設営費として確保する割合（0.15 = 15%）。目安 0.10〜0.20 */
  setupFeeRatio: number;
  /** 撤去費として確保する割合（0.08 = 8%）。目安 0.05〜0.10 */
  removalFeeRatio: number;
  /** 1項目あたりの最低配分金額（円）。端数が出ないよう丸める単位にも使います */
  roundUnit: number;
}

/** 店舗設定ファイル（src/config/shop.ts）の型 */
export interface ShopConfig {
  /** アプリ名 */
  appName: string;
  /** 店名 */
  shopName: string;
  /** ロゴ画像のパス（public フォルダからの相対パス）。空文字にすると店名テキストを表示 */
  logo: string;
  /** キャッチコピー */
  catchCopy: string;
  /** トップページの説明文 */
  description: string;
  /** ブランドカラー */
  brand: {
    /** メインカラー（ボタン・見出しなど） */
    primary: string;
    /** メインカラーの上に乗せる文字色 */
    primaryForeground: string;
    /** アクセントカラー（選択中の枠線など） */
    accent: string;
    /** 背景の淡いカラー */
    surface: string;
    /** 本文の文字色 */
    text: string;
    /** 補足テキストの文字色 */
    muted: string;
    /** 罫線の色 */
    border: string;
  };
  /** フォント（CSSのfont-family指定をそのまま書きます） */
  fontFamily: {
    /** 本文用フォント */
    base: string;
    /** 見出し用フォント */
    heading: string;
  };
  /** 店舗情報 */
  contact: {
    address: string;
    tel: string;
    email: string;
    lineUrl: string;
    instagramUrl: string;
    /** 営業時間など（任意。空文字で非表示） */
    businessHours: string;
  };
  /** 問い合わせ（相談ボタン）の設定 */
  contactChannel: ContactChannelConfig;
  /** シーン一覧 */
  scenes: Scene[];
  /** 印象タグ一覧 */
  impressionTags: ImpressionTag[];
  /** テイスト一覧 */
  styles: StyleOption[];
  /** 色一覧 */
  colors: ColorOption[];
  /** 花の一覧（マスター） */
  flowers: SeasonalFlower[];
  /** 月ごとのおすすめ花（キー: 1〜12、値: flowers の id） */
  monthlyFlowers: Record<number, string[]>;
  /** 装花場所の一覧（マスター） */
  decorationAreas: DecorationArea[];
  /** すべてのシーンで表示する装花場所のID一覧 */
  commonDecorationAreaIds: string[];
  /** 予算帯の選択肢 */
  budgetRanges: BudgetRange[];
  /** 予算配分ルール */
  budgetRules: BudgetRuleConfig;
  /** 注意事項 */
  disclaimers: {
    /** トップページに表示 */
    top: string[];
    /** 季節の花のステップに表示 */
    flower: string[];
    /** 結果画面に表示 */
    result: string[];
  };
  /** プライバシーポリシー本文 */
  privacyPolicy: LegalSection[];
  /** 利用規約本文 */
  termsOfService: LegalSection[];
  /** フッター表記 */
  footerText: string;
}

/** 法的ページの1セクション */
export interface LegalSection {
  /** 見出し */
  heading: string;
  /** 本文（段落ごとに配列で記述します） */
  paragraphs: string[];
}
