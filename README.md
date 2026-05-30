# Discord 招待 Bot

新メンバーがサーバーに参加したとき「いつ・誰が・誰を招待したか」と「累計招待数」を指定チャンネルへ自動投稿する Discord Bot。

- パネル設置型: `/panel` で招待リンク発行パネルを設置 → メンバーはボタンを押して自分専用リンクを取得
- Discord 標準の「招待を作成」で作られたリンクも、作成者を自動判別
- 累計招待数は MySQL に永続化

## セットアップ

### 1. Discord Developer Portal

1. [Discord Developer Portal](https://discord.com/developers/applications) でアプリ作成 → Bot トークン取得
2. Bot タブで **Server Members Intent** を ON にする（Privileged Intent）
3. OAuth2 URL Generator で以下を選択し、生成された URL でサーバーに招待:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `View Channels`, `Send Messages`, `Embed Links`, `Create Invite`, `Manage Server`

### 2. チャンネル ID の設定

`src/constants.js` を編集し、以下を埋める:

```js
LOG_CHANNEL_ID: '...',          // 参加ログを投稿するチャンネル
INVITE_PANEL_CHANNEL_ID: '...', // パネルを設置するチャンネル（招待リンクの発行先も兼ねる）
```

ログ用とパネル用は **別チャンネル** にする。

### 3. ローカル起動

```bash
cp .env.example .env
# .env を編集して DISCORD_TOKEN / DISCORD_CLIENT_ID / DATABASE_URL を埋める
npm install
npm run deploy-commands   # スラッシュコマンドを Discord に登録（初回 / コマンド変更時）
npm start
```

### 4. Railway へデプロイ

1. Railway で新規プロジェクトを作成
2. MySQL プラグインを追加（`DATABASE_URL` が自動で注入される）
3. このリポを GitHub 経由でデプロイするか `railway up` で直接デプロイ
4. Variables に `DISCORD_TOKEN` と `DISCORD_CLIENT_ID` を追加
5. 初回のみ Railway の shell で `npm run deploy-commands` を実行

## 使い方

1. 管理者がサーバーで `/panel` を実行 → パネルが設置される
2. メンバーがパネルのボタンを押す → エフェメラルで自分専用の招待リンクが返る
3. 別のユーザーがそのリンクで参加 → `LOG_CHANNEL_ID` に「参加者 / 招待者 / 累計招待数」が投稿される
4. `/invites @user` で累計招待数を確認できる

## 仕組み

Discord API は `guildMemberAdd` で招待者を直接通知しない。Bot は起動時に各サーバーの全招待リンクの `uses` 数をキャッシュし、参加イベント発火時に再 fetch して `uses` が +1 されたコードを特定し、その作成者を招待者として判定する。

Bot 自身が発行したリンクは `invite.inviter` が Bot になるため、`invite_owners` テーブルに `code → owner_id` を保存しておき、こちらを優先して参照する。

## スキーマ

`db.js` 起動時に自動で作成:

- `invite_counts` — 招待者ごとの累計
- `invite_logs` — 個別の参加ログ
- `invite_owners` — Bot 発行リンクの所有者対応表
