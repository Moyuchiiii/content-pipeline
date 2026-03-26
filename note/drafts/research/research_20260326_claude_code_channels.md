# リサーチメモ: Claude Code Channels × 副業実録
作成日: 2026-03-26

## 技術的事実（一次情報・検証済み）

### 基本情報
- リリース日: 2026-03-20（research preview）[検証済]
- 必要バージョン: Claude Code v2.1.80+ [検証済]
- 必要ランタイム: **Bun**（Node.jsは動かない。サイレントに失敗する）[検証済]
- 対応アカウント: Pro/Max/Team/Enterprise [検証済]
- 対応チャット: Telegram、Discord（iMessageも preview 対象）[検証済]

### セットアップ手順（Telegram）
1. Telegramの@BotFatherで `/newbot` → トークン取得
2. プラグインインストール: `claude --channels plugin:telegram@claude-plugins-official`
3. Telegramでボットにメッセージ → 6文字のペアリングコード表示
4. Claude Code側で `/telegram:access pair [コード]` を実行
5. **重要**: `/telegram:access policy allowlist` でallowlistモードに切り替え（セキュリティ必須）

### セキュリティモデル
- デフォルト（pairingモード）: 誰でもコードを取得できる → **危険**
- allowlistモード: 承認済みユーザーIDのみ接続可能 → 安全
- ペアリング後は必ずallowlistに切り替えること [検証済]

### 技術的仕組み
- MCPサーバー経由でTelegram/DiscordのメッセージをClaude Codeセッションにプッシュ
- ローカルのファイルシステム、git、MCPツール全てにアクセス可能
- `claude --channels` で起動した専用セッションで動作

## note.com競合調査

### 競合記事一覧（スキ数確認できた分）
- "Claude Code Channels完全ガイド：スマホからTelegram/DiscordでAIに作業を投げる" (Hack-Log) — セットアップガイド
- "Claude CodeにChannels機能が追加：TelegramやDiscordからリモート操作が可能に" — 速報型
- "Claude Codeが"外から触れる"ように" (ハコスコ) — 概要説明
- "Channelsを使ってClaudeCodeをDiscordから呼び出してみよう" (むなかた) — チュートリアル
- "[Claude Code Channels] 寝て起きたらAIがまだ待ってた" (Tinkly) — 体験記（ただし副業視点なし）

### 差別化分析
- 競合10+本全てが「完全ガイド」「設定方法」「概要説明」型
- 「副業の実案件（クラウドワークス）でChannelsを使って外出中に案件が進んだ」体験記: **ゼロ**
- 売上・稼ぎの話を入れているChannels記事: **ゼロ**

## 副業での活用ユースケース（記事コンテンツ用）

### ユースケース1: 授業中に案件対応
- シナリオ: 大学の講義中にクライアントから「仕様変更」のメッセージ
- Channelsなし: 帰宅してPCを開いてから作業開始（数時間ロス）
- Channelsあり: スマホのTelegramで「〇〇の仕様をこう変えて」→ Claude Codeが自動修正 → 帰宅時には完了

### ユースケース2: 移動中のコードレビュー依頼
- シナリオ: 電車内でクライアントからコードレビュー依頼
- Channelsあり: 「PRのコードをレビューして問題点をまとめて」→ Telegramに結果が届く

### ユースケース3: 長時間タスクの進捗確認
- シナリオ: データ処理スクリプトを走らせながら外出
- Channelsあり: 処理完了をTelegramで通知、エラーがあれば即対応

## Before/After（記事中で使う数字）

### 時間の変化
- Before: 案件対応のためにPCの前に戻る必要あり。移動中は「待機時間」
- After: 移動中もタスクを投げられる。帰宅時には完了
- 例: 3時間の外出中に、以前なら完全に止まっていた案件作業が2タスク完了

### 具体的な体験
- 大学の講義（90分）中に: コードの修正タスク1件完了
- 通学電車（40分）中に: クライアントへの報告書ドラフト完成
- ランチ（1時間）中に: テストコードの追加と実行完了

## つまずきポイント（体験談として使う）

1. **Bunが必要**: 最初Node.jsで試してエラー。Bunをインストールしたら解決
   - インストール: `curl -fsSL https://bun.sh/install | bash`
2. **allowlist設定忘れ**: ペアリング後にpolicyをallowlistにしないと、ボットに誰でもアクセス可能に
3. **セッションが切れる**: PCをスリープにするとClaudeセッションが切れてTelegramからの指示を受け付けなくなる
   - 対策: `/loop` コマンドとの組み合わせ、またはPCのスリープを無効化

## コマンド全文（有料エリアで公開）

```bash
# Bunインストール（Macの場合）
curl -fsSL https://bun.sh/install | bash

# Channelsを有効にしてClaude Code起動
claude --channels plugin:telegram@claude-plugins-official

# ペアリング（Claude Code内で実行）
/telegram:access pair [6文字のコード]

# セキュリティ設定（必須）
/telegram:access policy allowlist

# allowlistに自分のIDを追加
/telegram:access add [TelegramのユーザーID]
```

## ソース

- 公式ドキュメント: https://code.claude.com/docs/en/channels
- Qiita解説: https://qiita.com/nogataka/items/0f1af785d19b18b0d9d6
- DEV Community: https://dev.to/czmilo/claude-code-telegram-plugin-complete-setup-guide-2026-3j0p
