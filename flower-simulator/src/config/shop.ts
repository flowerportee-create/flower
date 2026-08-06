/**
 * =============================================================================
 * 店舗設定ファイル
 * =============================================================================
 * このファイルを編集するだけで、アプリを自分のお店仕様に変更できます。
 * プログラミングの知識がなくても、「'」で囲まれた文字や、数字を
 * 書き換えるだけで反映されます。
 *
 * ◆ 編集するときの注意
 *   1. 文字は必ず ' （シングルクォート）で囲んでください。
 *   2. 各行の最後の , （カンマ）は消さないでください。
 *   3. 日本語の「」や、'（アポストロフィ）を文字の中で使いたいときは
 *      「\'」のように \ を前に付けてください。
 *   4. 保存したらブラウザを再読み込みすると反映されます。
 *
 * ◆ 目次
 *   1. 基本情報（アプリ名・店名・ロゴ・キャッチコピー）
 *   2. ブランドカラー・フォント
 *   3. 店舗の連絡先
 *   4. 問い合わせ（相談ボタン）の設定
 *   5. シーン一覧
 *   6. 印象タグ一覧
 *   7. テイスト一覧
 *   8. 色一覧
 *   9. 花の一覧 ＋ 月ごとのおすすめ花
 *  10. 装花場所一覧
 *  11. 予算帯・予算配分ルール
 *  12. 注意事項
 *  13. プライバシーポリシー・利用規約・フッター
 * =============================================================================
 */

import type { ShopConfig } from '@/types';

export const shopConfig: ShopConfig = {
  /* ==========================================================================
   * 1. 基本情報
   * ======================================================================== */

  /** アプリ名（ブラウザのタブや画面上部に表示されます） */
  appName: '装花プランシミュレーター',

  /** 店名（フッターや相談メールの文中に表示されます） */
  shopName: 'Atelier Fleur',

  /**
   * ロゴ画像のパス。
   * public/images/logo.svg のように画像を置き、'/images/logo.svg' と書きます。
   * 画像を使わず店名の文字だけを表示したい場合は '' （空）にしてください。
   */
  logo: '/images/logo.svg',

  /** トップページのキャッチコピー */
  catchCopy: 'まだ言葉になっていない理想の景色を、\n花屋との打ち合わせ前に整理する。',

  /** トップページの説明文 */
  description:
    '開催シーンやご予算、好きな色、雰囲気、季節の花を選ぶだけで、装花相談用のプランシートを作成できます。',

  /* ==========================================================================
   * 2. ブランドカラー・フォント
   * --------------------------------------------------------------------------
   * 色は「#」で始まる6桁のカラーコードで指定します。
   * カラーコードは「カラーピッカー」などで検索すると簡単に調べられます。
   * ======================================================================== */

  brand: {
    /** メインカラー（ボタンや見出しの色） */
    primary: '#6B7F63',
    /** メインカラーの上に乗せる文字色（白 or 黒がおすすめ） */
    primaryForeground: '#FFFFFF',
    /** アクセントカラー（選択中のカードの枠線など） */
    accent: '#B08A64',
    /** 背景の淡いカラー（セクションの背景） */
    surface: '#FAF8F5',
    /** 本文の文字色 */
    text: '#2E2A26',
    /** 補足テキストの文字色 */
    muted: '#7A736C',
    /** 罫線の色 */
    border: '#E5DFD7',
  },

  /**
   * フォント。パソコンに入っているフォントの名前を並べて指定します。
   * 先頭に書いたフォントが優先して使われます。
   */
  fontFamily: {
    /** 本文用 */
    base: '"Hiragino Sans", "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif',
    /** 見出し用（明朝体にすると上品な印象になります） */
    heading: '"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", serif',
  },

  /* ==========================================================================
   * 3. 店舗の連絡先
   * --------------------------------------------------------------------------
   * 使わない項目は '' （空）にすると、画面に表示されなくなります。
   * ======================================================================== */

  contact: {
    address: '東京都世田谷区0-0-0',
    tel: '03-0000-0000',
    email: 'contact@example.com',
    lineUrl: 'https://line.me/R/ti/p/@example',
    instagramUrl: 'https://www.instagram.com/example/',
    businessHours: '10:00 - 18:00（水曜定休）',
  },

  /* ==========================================================================
   * 4. 問い合わせ（相談ボタン）の設定
   * --------------------------------------------------------------------------
   * 結果画面の「この内容で花屋に相談する」ボタンの動作を決めます。
   * type に次のいずれかを書いてください。
   *
   *   'mailto'       … メールソフトが開き、件名と本文が自動入力されます（初期設定）
   *   'googleForm'   … Googleフォームを開きます
   *   'externalForm' … 外部フォームサービス（formrun / Tally など）を開きます
   *   'line'         … LINE公式アカウントを開きます
   *
   * 'mailto' 以外を選んだ場合は url に遷移先のURLを書いてください。
   * ======================================================================== */

  contactChannel: {
    type: 'mailto',

    /** type が 'mailto' のときの宛先メールアドレス */
    mailTo: 'contact@example.com',

    /** type が 'googleForm' / 'externalForm' / 'line' のときの遷移先URL */
    url: '',

    /**
     * Googleフォームに氏名などを自動入力したい場合のみ設定します（任意）。
     * Googleフォームの［︙］→［事前入力したURLを取得］で表示されるURLに含まれる
     * entry.1234567890 の部分をコピーして貼り付けてください。
     * 使わない場合はそのまま '' にしておいて構いません。
     */
    googleFormEntryIds: {
      name: '',
      email: '',
      phone: '',
      summary: '',
    },

    /** ボタンに表示する文言 */
    buttonLabel: 'この内容で花屋に相談する',

    /** ボタンの下に表示する補足文 */
    note: 'ボタンを押すと、入力内容の要約が入った状態でご相談いただけます。',
  },

  /* ==========================================================================
   * 5. シーン一覧（STEP 1）
   * --------------------------------------------------------------------------
   * ・不要なシーンは、{ から } までを丸ごと削除してください。
   * ・image は public フォルダに画像を置いて '/images/scenes/○○.jpg' と指定します。
   *   画像がない場合は自動で背景が表示されるので、そのままでも崩れません。
   * ・titleWord は、自動生成されるプランタイトルに使われる言葉です。
   * ・extraAreaIds は、そのシーンでだけ追加表示する装花場所です（10番の一覧のid）。
   * ======================================================================== */

  scenes: [
    {
      id: 'bridal',
      name: 'ブライダル',
      description: '挙式・披露宴・二次会などの結婚式まわりの装花',
      image: '/images/scenes/bridal.svg',
      titleWord: 'ウェディング',
      extraAreaIds: [
        'takasago',
        'guestTable',
        'welcomeSpace',
        'ceremonySpace',
        'bouquet',
        'cakeFlower',
        'giftFlower',
        'chapel',
      ],
    },
    {
      id: 'party',
      name: 'パーティー',
      description: '記念パーティー、周年、懇親会などの会場装花',
      image: '/images/scenes/party.svg',
      titleWord: 'パーティー',
    },
    {
      id: 'exhibition',
      name: '展示会・イベント',
      description: '展示会、発表会、カンファレンスのブース・ステージ装花',
      image: '/images/scenes/exhibition.svg',
      titleWord: '展示会',
      extraAreaIds: [
        'booth',
        'receptionCounter',
        'speakerStage',
        'productSpace',
        'visitorFlow',
        'vipRoom',
      ],
    },
    {
      id: 'popup',
      name: 'ポップアップ',
      description: '期間限定ショップ、催事スペースの装花',
      image: '/images/scenes/popup.svg',
      titleWord: 'ポップアップ',
    },
    {
      id: 'corporate',
      name: '法人イベント',
      description: '株主総会、式典、社内表彰などのフォーマルな装花',
      image: '/images/scenes/corporate.svg',
      titleWord: '法人イベント',
    },
    {
      id: 'shop',
      name: '店舗装花',
      description: '店頭・店内のディスプレイ装花、定期装花',
      image: '/images/scenes/shop.svg',
      titleWord: '店舗',
    },
    {
      id: 'photo',
      name: '撮影・スタイリング',
      description: '商品撮影、広告撮影、スタイリング用の装花',
      image: '/images/scenes/photo.svg',
      titleWord: '撮影',
    },
    {
      id: 'other',
      name: 'その他',
      description: '上記に当てはまらない装花のご相談',
      image: '/images/scenes/other.svg',
      titleWord: '装花',
    },
  ],

  /* ==========================================================================
   * 6. 印象タグ一覧（STEP 4）
   * --------------------------------------------------------------------------
   * 「来場者に感じてほしい印象」で選べるタグです。自由に追加・削除できます。
   * ======================================================================== */

  impressionTags: [
    { id: 'refined', label: '上質' },
    { id: 'gorgeous', label: '華やか' },
    { id: 'friendly', label: '親しみやすい' },
    { id: 'extraordinary', label: '非日常' },
    { id: 'sophisticated', label: '洗練' },
    { id: 'warm', label: '温かい' },
    { id: 'dignified', label: '凛とした' },
    { id: 'open', label: '開放的' },
    { id: 'dreamy', label: '幻想的' },
    { id: 'powerful', label: '力強い' },
    { id: 'gentle', label: '優しい' },
    { id: 'unique', label: '個性的' },
  ],

  /* ==========================================================================
   * 7. テイスト一覧（STEP 5）
   * --------------------------------------------------------------------------
   * ・description はカードに表示される短い説明文です。
   * ・image を差し替えると、お店の施工写真をそのまま使えます。
   *   例: public/images/styles/natural.jpg に写真を置き
   *       image: '/images/styles/natural.jpg' と書き換えます。
   * ・titleWord … プランタイトルに使う言葉（例:「洗練された」）
   * ・conceptPhrase … コンセプト文に差し込む言葉（文の途中に入ります）
   * ======================================================================== */

  styles: [
    {
      id: 'natural',
      name: 'ナチュラル',
      description: 'グリーンや枝ものを生かし、作り込みすぎない自然な雰囲気',
      image: '/images/styles/natural.svg',
      titleWord: '自然体な',
      conceptPhrase: '作り込みすぎない自然な質感を大切にしながら',
    },
    {
      id: 'classic',
      name: 'クラシック',
      description: '品格のある花材と整った構成で、時代に左右されにくい端正な雰囲気',
      image: '/images/styles/classic.svg',
      titleWord: 'クラシカルな',
      conceptPhrase: '端正で品格のある構成を意識しながら',
    },
    {
      id: 'modern',
      name: 'モダン',
      description: '余白やフォルムを生かした、都会的で洗練された雰囲気',
      image: '/images/styles/modern.svg',
      titleWord: '洗練された',
      conceptPhrase: '余白とフォルムを生かした構成を意識しながら',
    },
    {
      id: 'romantic',
      name: 'ロマンティック',
      description: '柔らかな花材と流れるような動きで、甘さのある雰囲気',
      image: '/images/styles/romantic.svg',
      titleWord: 'ロマンティックな',
      conceptPhrase: '柔らかな花材の動きで甘さのある表情をつくりながら',
    },
    {
      id: 'minimal',
      name: 'ミニマル',
      description: '花材を絞り込み、静けさと緊張感のある雰囲気',
      image: '/images/styles/minimal.svg',
      titleWord: '静謐な',
      conceptPhrase: '花材を絞り込み、静けさのある佇まいを意識しながら',
    },
    {
      id: 'luxury',
      name: 'ラグジュアリー',
      description: 'ボリュームと質感で、特別感のある華やかな雰囲気',
      image: '/images/styles/luxury.svg',
      titleWord: '華やかな',
      conceptPhrase: 'ボリュームと花材の質感で特別感を出しながら',
    },
    {
      id: 'botanical',
      name: 'ボタニカル',
      description: '葉もの・実もの・枝ものを主役にした、植物感のある雰囲気',
      image: '/images/styles/botanical.svg',
      titleWord: '植物感のある',
      conceptPhrase: '葉ものや枝ものの表情を主役にしながら',
    },
    {
      id: 'artistic',
      name: 'アーティスティック',
      description: '構成や配色に意図を持たせた、作品性のある雰囲気',
      image: '/images/styles/artistic.svg',
      titleWord: '作品性のある',
      conceptPhrase: '構成と配色に明確な意図を持たせながら',
    },
    {
      id: 'japandi',
      name: '和モダン',
      description: '和の花材と余白を生かした、静かで凛とした雰囲気',
      image: '/images/styles/japandi.svg',
      titleWord: '凛とした',
      conceptPhrase: '和の花材と余白を生かした静かな構成を意識しながら',
    },
    {
      id: 'korean',
      name: '韓国風',
      description: '淡いトーンとくすみ配色でまとめた、繊細で今っぽい雰囲気',
      image: '/images/styles/korean.svg',
      titleWord: '繊細な',
      conceptPhrase: '淡いトーンとくすみ配色で繊細にまとめながら',
    },
    {
      id: 'colorful',
      name: 'カラフル',
      description: '複数の色を組み合わせた、明るく楽しい雰囲気',
      image: '/images/styles/colorful.svg',
      titleWord: '明るく楽しい',
      conceptPhrase: '複数の色を心地よく響かせる配色を意識しながら',
    },
    {
      id: 'airy',
      name: '今っぽい抜け感',
      description: '花を詰め込みすぎず、軽やかさと余白を感じる現代的な雰囲気',
      image: '/images/styles/airy.svg',
      titleWord: '軽やかな',
      conceptPhrase: '花を詰め込みすぎず、軽やかな余白を残しながら',
    },
  ],

  /* ==========================================================================
   * 8. 色一覧（STEP 6）
   * --------------------------------------------------------------------------
   * hex はカラーパレット表示に使う色です。
   * ニュアンスカラーやカラフルのように複数色で表したい場合は
   * gradient に色を並べてください。
   * isLight: true にすると、白っぽい色でも枠線が付いて見やすくなります。
   * ======================================================================== */

  colors: [
    { id: 'white', name: 'ホワイト', hex: '#FFFFFF', isLight: true },
    { id: 'ivory', name: 'アイボリー', hex: '#F5EFE2', isLight: true },
    { id: 'beige', name: 'ベージュ', hex: '#E2D3C0', isLight: true },
    { id: 'pink', name: 'ピンク', hex: '#F0B4C2' },
    { id: 'coral', name: 'コーラル', hex: '#F0876F' },
    { id: 'red', name: 'レッド', hex: '#C22E33' },
    { id: 'bordeaux', name: 'ボルドー', hex: '#6C1F2B' },
    { id: 'orange', name: 'オレンジ', hex: '#E5822E' },
    { id: 'yellow', name: 'イエロー', hex: '#EFC13F' },
    { id: 'green', name: 'グリーン', hex: '#6C8A58' },
    { id: 'blue', name: 'ブルー', hex: '#6C8FC4' },
    { id: 'navy', name: 'ネイビー', hex: '#22335C' },
    { id: 'purple', name: 'パープル', hex: '#8A6BA8' },
    { id: 'brown', name: 'ブラウン', hex: '#7A5A45' },
    { id: 'black', name: 'ブラック', hex: '#1F1D1B' },
    { id: 'silver', name: 'シルバー', hex: '#C8CBD0', isLight: true },
    { id: 'gold', name: 'ゴールド', hex: '#C6A45C' },
    {
      id: 'nuance',
      name: 'ニュアンスカラー',
      hex: '#C4B8AC',
      gradient: ['#DAD0C4', '#BFAFA4', '#A8A093'],
    },
    {
      id: 'multi',
      name: 'カラフル',
      hex: '#E0A0A8',
      gradient: ['#F0B4C2', '#EFC13F', '#6C8A58', '#6C8FC4', '#8A6BA8'],
    },
  ],

  /* ==========================================================================
   * 9-1. 花の一覧（マスター）
   * --------------------------------------------------------------------------
   * まずここに花を登録し、次の「9-2. 月ごとのおすすめ花」で
   * どの月に表示するかを指定します。
   *
   * priceLevel（価格帯の目安）は次の3つから選びます。
   *   'affordable' … 比較的取り入れやすい
   *   'standard'   … 標準的
   *   'premium'    … 高価になりやすい
   *
   * availability（流通の安定性）は次の3つから選びます。
   *   'stable'  … 比較的安定
   *   'varies'  … 時期により変動
   *   'limited' … 入荷が限られる場合がある
   * ======================================================================== */

  flowers: [
    {
      id: 'tulip',
      name: 'チューリップ',
      image: '/images/flowers/tulip.svg',
      feature: '柔らかな曲線と豊富な品種。会場に軽やかな春の印象を添えます。',
      mainColors: '白／ピンク／赤／黄／紫',
      priceLevel: 'affordable',
      availability: 'stable',
    },
    {
      id: 'sweetpea',
      name: 'スイートピー',
      image: '/images/flowers/sweetpea.svg',
      feature: '透け感のある花びらと甘い香り。動きのある表情をつくれます。',
      mainColors: '白／ピンク／紫／ニュアンス',
      priceLevel: 'affordable',
      availability: 'stable',
    },
    {
      id: 'ranunculus',
      name: 'ラナンキュラス',
      image: '/images/flowers/ranunculus.svg',
      feature: '幾重にも重なる花びらが上品。主役にもまとめ役にもなります。',
      mainColors: '白／ピンク／オレンジ／くすみ系',
      priceLevel: 'standard',
      availability: 'stable',
    },
    {
      id: 'anemone',
      name: 'アネモネ',
      image: '/images/flowers/anemone.svg',
      feature: '中心の黒とのコントラストが印象的。装花を引き締めます。',
      mainColors: '白／赤／紫／青',
      priceLevel: 'standard',
      availability: 'varies',
    },
    {
      id: 'cymbidium',
      name: 'シンビジウム',
      image: '/images/flowers/cymbidium.svg',
      feature: '一本で存在感があり、長く楽しめる蘭。フォーマルな場に。',
      mainColors: '白／緑／ピンク／黄',
      priceLevel: 'premium',
      availability: 'stable',
    },
    {
      id: 'mimosa',
      name: 'ミモザ',
      image: '/images/flowers/mimosa.svg',
      feature: '粒状の黄色い花が春らしく、明るい空気をつくります。',
      mainColors: '黄',
      priceLevel: 'standard',
      availability: 'limited',
    },
    {
      id: 'sakura',
      name: '桜',
      image: '/images/flowers/sakura.svg',
      feature: '枝ものならではのスケール感。空間を一気に季節感で満たします。',
      mainColors: '淡いピンク／白',
      priceLevel: 'premium',
      availability: 'limited',
    },
    {
      id: 'lilac',
      name: 'ライラック',
      image: '/images/flowers/lilac.svg',
      feature: '小花の集まりが軽やか。香りも楽しめる春から初夏の花。',
      mainColors: '白／紫／ピンク',
      priceLevel: 'premium',
      availability: 'limited',
    },
    {
      id: 'viburnum',
      name: 'ビバーナム',
      image: '/images/flowers/viburnum.svg',
      feature: 'ライムグリーンの丸い花房。グリーンのつなぎ役として万能です。',
      mainColors: '白／ライムグリーン',
      priceLevel: 'standard',
      availability: 'varies',
    },
    {
      id: 'peony',
      name: 'シャクヤク',
      image: '/images/flowers/peony.svg',
      feature: '開くと大輪になる主役級の花。華やかさが必要な場面に。',
      mainColors: '白／ピンク／赤',
      priceLevel: 'premium',
      availability: 'limited',
    },
    {
      id: 'rose',
      name: 'バラ',
      image: '/images/flowers/rose.svg',
      feature: '色・サイズの選択肢が非常に広く、ほぼ通年で使える定番花材。',
      mainColors: 'ほぼ全色',
      priceLevel: 'standard',
      availability: 'stable',
    },
    {
      id: 'delphinium',
      name: 'デルフィニウム',
      image: '/images/flowers/delphinium.svg',
      feature: '青系の代表的な花材。縦のラインと抜け感をつくります。',
      mainColors: '青／白／紫',
      priceLevel: 'standard',
      availability: 'stable',
    },
    {
      id: 'clematis',
      name: 'クレマチス',
      image: '/images/flowers/clematis.svg',
      feature: 'つるの動きが美しく、装花に自然な流れを生みます。',
      mainColors: '白／紫／ピンク',
      priceLevel: 'premium',
      availability: 'limited',
    },
    {
      id: 'hydrangea',
      name: 'アジサイ',
      image: '/images/flowers/hydrangea.svg',
      feature: 'ボリュームが出しやすく、空間を埋める役割に向きます。',
      mainColors: '白／青／紫／くすみ系',
      priceLevel: 'standard',
      availability: 'stable',
    },
    {
      id: 'smoketree',
      name: 'スモークツリー',
      image: '/images/flowers/smoketree.svg',
      feature: '煙のようなふわりとした質感。初夏の装花に軽さを加えます。',
      mainColors: 'ピンク／グリーン／スモーク',
      priceLevel: 'standard',
      availability: 'varies',
    },
    {
      id: 'sunflower',
      name: 'ヒマワリ',
      image: '/images/flowers/sunflower.svg',
      feature: '夏を象徴する花。カジュアルで明るい場面に向きます。',
      mainColors: '黄／オレンジ／ブラウン',
      priceLevel: 'affordable',
      availability: 'stable',
    },
    {
      id: 'anthurium',
      name: 'アンスリウム',
      image: '/images/flowers/anthurium.svg',
      feature: '光沢のあるフォルムでモダンな印象。日持ちにも優れます。',
      mainColors: '赤／白／緑／ピンク',
      priceLevel: 'standard',
      availability: 'stable',
    },
    {
      id: 'curcuma',
      name: 'クルクマ',
      image: '/images/flowers/curcuma.svg',
      feature: '暑さに強く、夏の装花で扱いやすい花材です。',
      mainColors: 'ピンク／白／グリーン',
      priceLevel: 'standard',
      availability: 'varies',
    },
    {
      id: 'lisianthus',
      name: 'トルコキキョウ',
      image: '/images/flowers/lisianthus.svg',
      feature: '上品な花姿で日持ちが良く、幅広いテイストに合わせられます。',
      mainColors: '白／ピンク／紫／グリーン',
      priceLevel: 'standard',
      availability: 'stable',
    },
    {
      id: 'celosia',
      name: 'ケイトウ',
      image: '/images/flowers/celosia.svg',
      feature: 'ベルベットのような質感。秋の装花に深みを与えます。',
      mainColors: '赤／オレンジ／ピンク／ブラウン',
      priceLevel: 'affordable',
      availability: 'stable',
    },
    {
      id: 'dahlia',
      name: 'ダリア',
      image: '/images/flowers/dahlia.svg',
      feature: '大輪から小輪まで幅広く、秋の主役になる花材です。',
      mainColors: '白／赤／ボルドー／オレンジ／くすみ系',
      priceLevel: 'premium',
      availability: 'varies',
    },
    {
      id: 'cosmos',
      name: 'コスモス',
      image: '/images/flowers/cosmos.svg',
      feature: '繊細な茎の動きで、秋らしい軽やかさをつくります。',
      mainColors: 'ピンク／白／赤',
      priceLevel: 'affordable',
      availability: 'varies',
    },
    {
      id: 'pampas',
      name: 'パンパスグラス',
      image: '/images/flowers/pampas.svg',
      feature: '大きな穂で空間にボリュームを出せる、ドライでも使える素材。',
      mainColors: 'ベージュ／ホワイト',
      priceLevel: 'standard',
      availability: 'varies',
    },
    {
      id: 'berries',
      name: '実もの',
      image: '/images/flowers/berries.svg',
      feature: 'サンキライや野バラの実など。装花に季節感と表情を加えます。',
      mainColors: '赤／グリーン／ブラウン',
      priceLevel: 'standard',
      availability: 'varies',
    },
    {
      id: 'autumnBranch',
      name: '紅葉枝',
      image: '/images/flowers/autumn-branch.svg',
      feature: '色づいた枝もので、大きなスケールの装花をつくれます。',
      mainColors: '赤／オレンジ／ブラウン',
      priceLevel: 'standard',
      availability: 'limited',
    },
    {
      id: 'amaryllis',
      name: 'アマリリス',
      image: '/images/flowers/amaryllis.svg',
      feature: '大輪で存在感があり、冬の装花に華やかさを添えます。',
      mainColors: '赤／白／ピンク',
      priceLevel: 'premium',
      availability: 'varies',
    },
    {
      id: 'cotton',
      name: 'コットン',
      image: '/images/flowers/cotton.svg',
      feature: 'ふんわりとした綿毛が冬らしく、温かみのある印象に。',
      mainColors: '白／ベージュ',
      priceLevel: 'affordable',
      availability: 'varies',
    },
    {
      id: 'conifer',
      name: '針葉樹',
      image: '/images/flowers/conifer.svg',
      feature: 'ヒムロスギやモミなど。冬の装花のベースとして使えます。',
      mainColors: 'グリーン／シルバーグリーン',
      priceLevel: 'affordable',
      availability: 'stable',
    },
  ],

  /* ==========================================================================
   * 9-2. 月ごとのおすすめ花
   * --------------------------------------------------------------------------
   * 開催日の「月」から、この一覧を使っておすすめの花を表示します。
   * 左の数字が月、右の [ ] の中が花のid（9-1で登録したid）です。
   * 花を入れ替えたいときは、id を書き換えてください。
   * ======================================================================== */

  monthlyFlowers: {
    1: ['tulip', 'sweetpea', 'ranunculus', 'anemone', 'cymbidium'],
    2: ['tulip', 'sweetpea', 'ranunculus', 'mimosa', 'anemone'],
    3: ['sakura', 'tulip', 'ranunculus', 'sweetpea', 'mimosa'],
    4: ['lilac', 'tulip', 'viburnum', 'sweetpea', 'peony'],
    5: ['peony', 'rose', 'lilac', 'delphinium', 'clematis'],
    6: ['hydrangea', 'rose', 'clematis', 'smoketree', 'delphinium'],
    7: ['sunflower', 'anthurium', 'curcuma', 'hydrangea', 'lisianthus'],
    8: ['sunflower', 'anthurium', 'curcuma', 'celosia', 'lisianthus'],
    9: ['dahlia', 'cosmos', 'celosia', 'pampas', 'berries'],
    10: ['dahlia', 'cosmos', 'celosia', 'autumnBranch', 'rose'],
    11: ['dahlia', 'rose', 'berries', 'autumnBranch', 'amaryllis'],
    12: ['amaryllis', 'cotton', 'conifer', 'cymbidium', 'rose'],
  },

  /* ==========================================================================
   * 10. 装花場所一覧（STEP 8）
   * --------------------------------------------------------------------------
   * weight は「予算配分の重み」です。数字が大きいほど多く配分されます。
   *   目安: 大きな装花 = 4〜5 ／ 中くらい = 2〜3 ／ 小さな装花 = 1
   * ======================================================================== */

  decorationAreas: [
    // ---- 共通 ----
    { id: 'entrance', name: 'エントランス', description: '会場の第一印象をつくる入口の装花', weight: 4 },
    { id: 'reception', name: '受付', description: '受付まわりのテーブル・カウンター装花', weight: 2 },
    { id: 'mainStage', name: 'メインステージ', description: '登壇・演出の背景となるステージ装花', weight: 5 },
    { id: 'signboard', name: 'サインボード', description: '看板・案内表示まわりの装花', weight: 1 },
    { id: 'photoSpot', name: 'フォトスポット', description: '写真撮影のための装花・背景', weight: 4 },
    { id: 'tableFlower', name: 'テーブル装花', description: '各テーブルに置く装花（テーブル数で変動）', weight: 4 },
    { id: 'counter', name: 'カウンター', description: 'バー・ドリンクカウンターの装花', weight: 2 },
    { id: 'floorFlower', name: '床置き装花', description: '床に置くスタンド・大型アレンジ', weight: 3 },
    { id: 'wallFlower', name: '壁面装花', description: '壁面を使った装飾', weight: 4 },
    { id: 'hangingFlower', name: '吊り装花', description: '天井から吊るす装花（施工条件の確認が必要）', weight: 5 },
    { id: 'displayStand', name: '商品展示台', description: '商品まわりを引き立てる小さめの装花', weight: 2 },
    { id: 'greenRoom', name: '控室', description: '控室・楽屋まわりの装花', weight: 1 },
    { id: 'restroom', name: 'お手洗い', description: 'パウダールームの小さな装花', weight: 1 },
    { id: 'otherArea', name: 'その他', description: '上記以外にご希望の場所', weight: 2 },

    // ---- ブライダル専用 ----
    { id: 'takasago', name: '高砂', description: '新郎新婦席まわりのメイン装花', weight: 5 },
    { id: 'guestTable', name: 'ゲストテーブル', description: 'ゲスト卓の装花（卓数で変動）', weight: 4 },
    { id: 'welcomeSpace', name: 'ウェルカムスペース', description: 'ウェルカムボードまわりの装花', weight: 3 },
    { id: 'ceremonySpace', name: '挙式スペース', description: 'バージンロード・祭壇まわりの装花', weight: 4 },
    { id: 'bouquet', name: 'ブーケ', description: 'ブーケ・ブートニア', weight: 3 },
    { id: 'cakeFlower', name: 'ケーキ装花', description: 'ウェディングケーキまわりの装花', weight: 1 },
    { id: 'giftFlower', name: '贈呈花', description: 'ご両親への贈呈用の花束', weight: 2 },
    { id: 'chapel', name: 'チャペル装花', description: 'チャペル内の装花一式', weight: 4 },

    // ---- 展示会・イベント専用 ----
    { id: 'booth', name: '展示ブース', description: 'ブース全体のグリーン・花装飾', weight: 4 },
    { id: 'receptionCounter', name: '受付カウンター', description: '受付カウンター上の装花', weight: 2 },
    { id: 'speakerStage', name: '登壇ステージ', description: '登壇者まわり・演台の装花', weight: 4 },
    { id: 'productSpace', name: '商品展示スペース', description: '商品を引き立てる展示まわりの装花', weight: 3 },
    { id: 'visitorFlow', name: '来場者導線', description: '通路・導線上のポイント装花', weight: 3 },
    { id: 'vipRoom', name: 'VIPルーム', description: 'VIP・商談スペースの装花', weight: 2 },
  ],

  /**
   * すべてのシーンで表示する装花場所のid。
   * ここに載せていない装花場所は、シーンの extraAreaIds に書いたときだけ表示されます。
   */
  commonDecorationAreaIds: [
    'entrance',
    'reception',
    'mainStage',
    'signboard',
    'photoSpot',
    'tableFlower',
    'counter',
    'floorFlower',
    'wallFlower',
    'hangingFlower',
    'displayStand',
    'greenRoom',
    'restroom',
    'otherArea',
  ],

  /* ==========================================================================
   * 11-1. 予算帯の選択肢（STEP 3）
   * --------------------------------------------------------------------------
   * representativeAmount は、その予算帯を選んだときに配分計算で使う金額です。
   * 「まだ決めていない」は null にしてください（金額を計算せず割合だけ表示します）。
   * ======================================================================== */

  budgetRanges: [
    { id: 'under50k', label: '5万円未満', representativeAmount: 40000 },
    { id: '50kTo100k', label: '5万円〜10万円', representativeAmount: 75000 },
    { id: '100kTo300k', label: '10万円〜30万円', representativeAmount: 200000 },
    { id: '300kTo500k', label: '30万円〜50万円', representativeAmount: 400000 },
    { id: '500kTo1m', label: '50万円〜100万円', representativeAmount: 750000 },
    { id: 'over1m', label: '100万円以上', representativeAmount: 1200000 },
    { id: 'undecided', label: 'まだ決めていない', representativeAmount: null },
  ],

  /* ==========================================================================
   * 11-2. 予算配分ルール
   * --------------------------------------------------------------------------
   * 装花場所の weight（10番）× 優先度の係数 で、予算を配分します。
   * ======================================================================== */

  budgetRules: {
    /** 優先度ごとの係数。数字を変えると配分の偏り方が変わります。 */
    priorityCoefficients: {
      high: 1.5, // 優先したい
      medium: 1.0, // できれば入れたい
      low: 0.5, // 予算があれば
    },

    /** 搬入設営費として確保する割合（0.15 = 15%）。目安は 0.10〜0.20 */
    setupFeeRatio: 0.15,

    /** 撤去費として確保する割合（0.08 = 8%）。目安は 0.05〜0.10 */
    removalFeeRatio: 0.08,

    /** 金額の丸め単位（円）。1000 にすると千円単位で表示されます。 */
    roundUnit: 1000,
  },

  /* ==========================================================================
   * 12. 注意事項
   * --------------------------------------------------------------------------
   * 配列の中に文章を追加すると、その分だけ行が増えます。
   * ======================================================================== */

  disclaimers: {
    /** トップページに表示 */
    top: [
      '表示される内容や金額は、装花の方向性を整理するための参考情報です。実際の花材、価格、施工内容は、会場条件、市場価格、季節、仕入れ状況、設営条件などによって変動します。',
      'このアプリは正確な見積もりや完成イメージを保証するものではありません。打ち合わせ前のご要望整理としてご利用ください。',
    ],

    /** 季節の花のステップ（STEP 7）に表示 */
    flower: [
      '花の流通時期は地域、天候、市場状況、品種によって異なります。選択した花の使用を保証するものではありません。実際の花材は花屋との打ち合わせ後に決定します。',
    ],

    /** 結果画面に表示 */
    result: [
      'このプランは、装花の方向性を整理するための参考資料です。実際の見積金額、使用花材、施工内容、搬入設営費、撤去費、配送費は、会場条件や市場価格、開催時期によって変動します。',
      '花材は自然物のため、色、形、大きさ、開花状態に個体差があります。',
      '選択した花材の入荷や使用を保証するものではありません。',
    ],
  },

  /* ==========================================================================
   * 13. プライバシーポリシー・利用規約・フッター
   * --------------------------------------------------------------------------
   * ※ 以下はテンプレートです。公開前に必ず内容を自店の運用に合わせて修正し、
   *   専門家（弁護士・行政書士など）にご確認ください。
   * ======================================================================== */

  privacyPolicy: [
    {
      heading: '1. 基本方針',
      paragraphs: [
        '当店は、装花プランシミュレーター（以下「本サービス」）の提供にあたり、お客様の個人情報の重要性を認識し、関係法令およびこのプライバシーポリシーに従って適切に取り扱います。',
      ],
    },
    {
      heading: '2. 取得する情報',
      paragraphs: [
        '本サービスでは、お客様が入力された氏名、会社名、メールアドレス、電話番号、ご相談内容などの情報を取得する場合があります。',
        '本サービスに入力された内容は、お客様のブラウザ内（localStorage）に保存されます。当店のサーバーに自動送信されることはありません。',
        'アップロードされた画像はブラウザ内で表示するためだけに使用され、当店のサーバーには保存されません。',
      ],
    },
    {
      heading: '3. 利用目的',
      paragraphs: [
        '取得した個人情報は、装花に関するご相談への対応、お見積りのご案内、打ち合わせの日程調整、その他お客様からのお問い合わせへの回答のために利用します。',
      ],
    },
    {
      heading: '4. 第三者提供',
      paragraphs: [
        '法令に基づく場合を除き、あらかじめお客様の同意を得ることなく、個人情報を第三者に提供することはありません。',
      ],
    },
    {
      heading: '5. 情報の管理',
      paragraphs: [
        '当店は、お預かりした個人情報の漏えい、滅失またはき損の防止その他の安全管理のために、必要かつ適切な措置を講じます。',
      ],
    },
    {
      heading: '6. 開示・訂正・削除のご請求',
      paragraphs: [
        'お客様ご本人からの個人情報の開示、訂正、利用停止、削除のご請求については、下記のお問い合わせ先までご連絡ください。ご本人であることを確認のうえ、速やかに対応いたします。',
        'なお、ブラウザに保存された入力内容は、本サービスの「最初からやり直す」ボタン、またはブラウザの閲覧データ削除機能でお客様ご自身で削除できます。',
      ],
    },
    {
      heading: '7. お問い合わせ先',
      paragraphs: [
        '本ポリシーに関するお問い合わせは、本サイトに記載の連絡先までお願いいたします。',
      ],
    },
  ],

  termsOfService: [
    {
      heading: '第1条（適用）',
      paragraphs: [
        '本規約は、当店が提供する装花プランシミュレーター（以下「本サービス」）の利用条件を定めるものです。お客様は、本サービスを利用することにより本規約に同意したものとみなされます。',
      ],
    },
    {
      heading: '第2条（本サービスの目的）',
      paragraphs: [
        '本サービスは、装花のご相談前にお客様のご要望を整理することを目的とした簡易ツールです。正式なお見積り、受注、契約の成立を意味するものではありません。',
      ],
    },
    {
      heading: '第3条（表示内容について）',
      paragraphs: [
        '本サービスで表示される金額、花材、装花場所、配分比率などはすべて目安であり、実際の内容を保証するものではありません。',
        '花材は自然物であり、色・形・大きさ・開花状態に個体差があります。また、天候・市場状況・仕入れ状況により、ご希望の花材をご用意できない場合があります。',
        '実際の内容および金額は、打ち合わせのうえ、別途お見積りにてご案内いたします。',
      ],
    },
    {
      heading: '第4条（禁止事項）',
      paragraphs: [
        'お客様は、本サービスの利用にあたり、法令または公序良俗に違反する行為、当店または第三者の権利を侵害する行為、本サービスの運営を妨害する行為を行ってはなりません。',
      ],
    },
    {
      heading: '第5条（免責事項）',
      paragraphs: [
        '当店は、本サービスの利用によりお客様に生じた損害について、当店に故意または重大な過失がある場合を除き、責任を負わないものとします。',
        'ブラウザに保存された入力内容は、ブラウザの設定や操作により消失する場合があります。当店はその復旧について責任を負いません。',
      ],
    },
    {
      heading: '第6条（規約の変更）',
      paragraphs: [
        '当店は、必要と判断した場合には、お客様に通知することなく本規約を変更することができるものとします。',
      ],
    },
  ],

  /** フッターに表示する著作権表記など */
  footerText: '© Atelier Fleur',
};

export default shopConfig;
