# AI Email Client

Gmail ライクな Web メールクライアント。受信トレイの表示・閲覧・送信に加え、Claude（`claude-opus-4-7`）が **過去の返信パターンを学習** してあなたの口調・長さ・サインオフを真似た返信下書きを作ります。

## 特長

- 📨 Gmail API 連携（受信トレイ・送信済み・スター付き・下書き・ゴミ箱の閲覧、検索、送信）
- 🔁 **複数 Gmail アカウントの追加・切り替え**（ヘッダー右上のセレクトボックス）
- 🪄 **AIで返信** — 開いているメールに対して、過去の返信例をFew-shotとして渡しClaudeが下書きを生成
- 🎓 **学習** — あなたが実際に送った返信が `(受信メール, 返信)` ペアとして蓄積され、次回以降の似たメールの下書きに使われる
- 💾 ローカル JSON ファイルに保存（外部 DB 不要）

## アーキテクチャ

```
┌──────────────┐   OAuth2    ┌──────────────┐
│  Browser UI  │ ───────────▶│   Gmail API  │
│ (vanilla JS) │             └──────────────┘
│              │
│              │   /api/ai   ┌──────────────┐
│              │ ───────────▶│  Claude API  │
└──────┬───────┘             │  opus-4-7    │
       │                     └──────────────┘
       │
       ▼
┌────────────────────────┐
│  Express server (Node) │
│  ├ store.js  (JSON持続) │
│  ├ gmail-client.js     │
│  └ claude.js (Few-shot)│
└────────────────────────┘
```

## セットアップ

### 1. 依存をインストール

```bash
cd ai-email-client
npm install
```

### 2. Google Cloud で OAuth クライアント ID を作成

1. https://console.cloud.google.com/apis/credentials へ
2. プロジェクトを作成（既存のものでも可）
3. **APIライブラリ** から **Gmail API** を有効化
4. **OAuth 同意画面** を構成（外部 / テスト ユーザーに自分のメールを追加）
5. **認証情報を作成 → OAuth クライアント ID → ウェブアプリケーション**
6. **承認済みのリダイレクト URI** に以下を追加:
   ```
   http://localhost:3000/auth/google/callback
   ```
7. 発行された **クライアント ID / シークレット** を控える

### 3. 環境変数を設定

```bash
cp .env.example .env
```

`.env` を編集して以下を埋める:

```
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
PORT=3000
```

### 4. サーバ起動

```bash
npm start
```

ブラウザで http://localhost:3000 を開く。
最初は **「Google でログイン」** ボタンが出るので、Gmail アカウントを連携。連携後、受信トレイが表示される。

### 5. 複数アカウントを追加する

ヘッダー右上の **「＋ アカウント追加」** ボタンで別の Gmail アカウントを連携できる。セレクトボックスから即座に切り替え可能。

## 使い方

### 普通のメール操作

- 左カラム: ラベル（受信トレイ／スター付き／送信済み／下書き／ゴミ箱）
- 中央カラム: メール一覧、クリックで右に内容表示
- 右カラム: メール本文
- 上部の検索ボックスは Gmail と同じ検索構文が使える（例: `from:taro@example.com is:unread`）

### AI で返信する

メールを開いて **🪄 AIで返信** ボタン、または **↩ 返信** → 作成画面で **🪄 AIで下書き** ボタンを押すと:

1. サーバが今のアカウントの過去 `(受信メール, 返信)` ペアの中から、新着メールに**最も似ている上位 5 件**を選ぶ（送信者一致 + 件名・本文の語彙類似度）
2. それらを Few-shot 例として Claude に渡し、口調・長さ・サインオフを真似た下書きを生成
3. 本文欄に挿入される（自由に編集可能）

**AIへの指示** 欄に「もう少しフォーマルに」「箇条書きにして」などの追加指示を書ける。

### 学習の仕組み

- あなたが **「送信」** ボタンを押した瞬間、`(返信した元のメール, あなたの最終本文)` が学習例として保存される
- AIが出した下書きをあなたが編集してから送信した場合、**編集後の最終版**が学習されるので、AIの精度は使うほど上がる
- 学習例は `server/data/examples.json` に保存（アカウントごと最大 500 件）
- ヘッダー左下に **学習件数** が表示される

## ファイル構成

```
ai-email-client/
├── package.json
├── .env.example
├── README.md
├── server/
│   ├── server.js             # Express エントリ
│   ├── routes/
│   │   ├── auth.js           # /auth/* — Google OAuth & アカウント管理
│   │   ├── gmail.js          # /api/gmail/* — メール一覧/取得/送信
│   │   └── ai.js             # /api/ai/* — Claude 下書き・統計
│   ├── lib/
│   │   ├── store.js          # JSONファイル永続化
│   │   ├── gmail-client.js   # googleapis ラッパ
│   │   └── claude.js         # Few-shot 選択 + Anthropic SDK 呼び出し
│   └── data/                 # accounts.json / examples.json (gitignore)
└── public/
    ├── index.html
    ├── styles.css
    └── app.js
```

## セキュリティ上の注意

- これは **ローカル開発用** のサンプル実装です。OAuth リフレッシュトークンや学習例はローカルの平文 JSON に保存されます。共有マシンで使う場合は適切な暗号化／OS レベルのアクセス制御を入れてください。
- 本番運用する場合は、Express セッション + 認証、HTTPS、データベース（Postgres など）への移行を推奨します。
- Gmail API のスコープは送受信・ラベル変更を含むため、初回連携時の同意画面で要求権限を確認してください。

## トラブルシューティング

- **`redirect_uri_mismatch` エラー**: Google Cloud Console の承認済みリダイレクト URI に `http://localhost:3000/auth/google/callback` を入れたか確認
- **下書きが空 / 失敗**: `ANTHROPIC_API_KEY` が正しいか、Claude API のクオータが残っているかを確認。サーバログにエラー詳細が出る
- **受信トレイが空**: Gmail API が有効化されているか、OAuth 同意画面のテストユーザーに連携した Gmail アドレスを追加したか確認

## 拡張のアイデア

- スレッド表示（現在は単一メッセージのみ）
- 添付ファイル対応
- ベクトル検索（embeddings）による Few-shot 選択
- 編集差分から「スタイルガイド」を抽出してシステムプロンプトに固定化
- 下書きストリーミング表示（Claude SDK の `messages.stream()` を使う）
