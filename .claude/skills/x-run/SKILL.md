---
name: x-run
description: moyuchi の X（Twitter）投稿を自動生成するスキル。Notionの note記事DB を監視して「Xステータス:未投稿」の記事からツイートを生成する。note記事 → X変換（from-article）、単独ツイート生成（standalone）、トレンドスキャン（trend）の3モード。
allowed-tools: WebSearch, WebFetch, Write, Read, Glob, Grep, mcp__notion__notion-search, mcp__notion__notion-fetch, mcp__notion__notion-update-page, mcp__notion__notion-create-pages
---

# /x-run

moyuchi の X 投稿を生成する全自動パイプライン。

## 使い方

```
/x-run                              # Notionの未投稿記事一覧を表示して選択
/x-run from-article {ドラフトパス}   # note記事ドラフトを直接指定して変換
/x-run standalone                   # 単独ツイート / スレッド生成
/x-run trend                        # トレンドスキャン → ツイートアイデア + note記事依頼
```

---

## Phase 0: コンテキスト読み込み

必ず最初に以下を読み込む:

- `context/x-profile.md` — X アカウント設計・ポジショニング
- `context/x-strategy.md` — ツイートタイプ・運用戦略
- `context/voice-samples.md` — X 用文体サンプル・NG パターン
- `context/x-performance.md` — 過去の成功パターン（あれば）
- `context/x-hook-formulas.md` — フック型 10 種の定義（YOU MUST: ツイート生成前に必ず参照すること）
- `context/writing-rules.md` — 禁止フレーズ・AI定型表現リスト（ツイート生成前に確認）
- `context/article-frameworks.md` — AIDA・Star Story Solution（ツイート構成参照）
- `context/content-memory.md` — 過去の成功ツイートパターン（あれば参照）

### Notion から「未投稿」記事を取得

Notion「note記事管理」DB（data_source: `collection://812aa728-8d3e-42e4-a9cd-6a91c303b2c2`）を参照し、`Xステータス: 未投稿` のレコードを取得する。

引数なしで `/x-run` を実行した場合は、未投稿記事の一覧を提示してユーザーに選ばせる:

```
📋 X未投稿の note 記事:
1. [記事タイトル] - 公開日: YYYY-MM-DD（速報/実録/ノウハウ）
2. [記事タイトル] - 公開日: YYYY-MM-DD
...

どの記事のツイートを生成しますか？（番号 or "all" で全件）
```

---

## モード A: `from-article` — note記事 → X投稿変換

### Step 1: 記事読み込み + アトミックアイデア抽出

引数がファイルパスなら直接読み込む。
引数なし（Phase 0 でユーザーが選択した場合）は Notion レコードから `note URL` と `草稿パス` を取得してファイルを読む。

読み取る情報:
- 記事タイプ（速報/実録/ノウハウ）
- 記事の核心（一番伝えたいこと）
- Before/After や数字（あれば）
- note URL（frontmatter or Notion レコードから取得）

**アトミックアイデア抽出（X変換前に必須）:**

記事全体を読んだ後、「Xで独立して成立するアトミックアイデア」を 3〜7 個抽出する。

条件:
- 各アイデアは記事全体を読まなくても理解できる、独立した主張または体験
- Before/After・数字・発見・驚きのいずれかを含む
- 同じ内容を言い換えただけのアイデアはカウントしない（重複NG）

抽出できたアイデアの中から、最もXで伸びそうな1〜3個を選んでツイート化する。
全アイデアをツイートにする必要はない。「これは絶対伸びる」と思えるものだけ使う。

### Step 2: ツイートパターン判定

| 記事タイプ | X 出力パターン |
|---|---|
| 速報（sokuho） | 単発ツイート 1〜2 本（速報 + note 誘導） |
| 実録（jituroku） | note 誘導ツイート + ノウハウスレッド（任意） |
| ノウハウ（knowhow） | ノウハウスレッド（5〜8 ツイート） + note 誘導 |

### Step 3: ツイート生成

**単発ツイート（速報・note誘導）:**

```
[フック1行 — 事実ファースト or 一番驚いた点]
[自分の視点・感想（1〜2行）]
[詳しくは note に書いた → {URL}]
```

**ノウハウスレッド（5〜8 ツイート）:**

```
ツイート1（フック）:
  [「これ知らない人多すぎる」「〇〇したら〇〇になった」系のフック]

ツイート2〜6（中身）:
  [1ツイート1アイデア。箇条書き禁止。文章で書く]

ツイート7（まとめ + 誘導）:
  [まとめ1行 + 「詳しくは note に書いた」 + URL]
```

**文体ルール:**
- `context/voice-samples.md` のサンプルに合わせる
- 一人称: 「自分」「僕」
- 1ツイートは最大 280 字（改行込み）
- ハッシュタグ: スレッドの最後のツイートのみ 0〜2 個
- AI 感のある言い回し禁止

### Step 4: Notion ステータス更新

草稿保存後、Notion の note記事 DB レコードを更新:
- `Xステータス`: 未投稿 → **草稿完成**
- `X草稿パス`: 保存したドラフトファイルのパス

---

## モード B: `standalone` — 単独ツイート / スレッド生成

### Step 1: トピック確認

ユーザーが指定したトピックを受け取る。指定がなければ聞く:
- 実況ツイート（今やってること）
- Tips・ノウハウ（1つの技術・工夫）
- 実績報告（スキ数・案件・PV）

### Step 2: フック型選択 → ツイート生成

**YOU MUST: ツイートを書く前に `context/x-hook-formulas.md` からフック型を 1 つ選び、宣言してから書くこと。**

```
フック型選択フロー:
1. ネタの性質を確認（実績/ノウハウ/速報/実況/問いかけ）
2. x-hook-formulas.md の 10 型から最も合うものを選ぶ
3. 「使用フック型: ○○型」と宣言する
4. 型のテンプレートに沿って 1 行目を書く
5. 必要なら 2〜3 バリエーションを生成して最良を選ぶ
```

**声スタイルクローン（langgptai パターン）:**
`context/voice-samples.md` と `context/x-performance.md`（エンゲージメント高ツイート）から以下を抽出してツイートに反映:
- 語尾パターン（「〜した」「〜だった」「〜かも」等、どれが多いか）
- 感情表現の強さ（控えめ/適度/強め）
- 専門用語の説明レベル（どこまで省略しているか）
- 改行の使い方（1文1行か、まとめて書くか）

`context/voice-samples.md` のサンプルと照らし合わせてトーンを整え、単発 or スレッドを判断して出力する。

---

## モード C: `trend` — トレンドスキャン → ツイート + note依頼

### Step 1: トレンドスキャン

WebSearch で以下を検索（過去 24〜48 時間）:

```
# 公式・リリース情報
"Claude Code" OR "Anthropic" OR "Claude" new release announcement
"Claude" site:anthropic.com announcement OR update

# コミュニティ動向（日本語）
"Claude Code" 使い方 OR 活用 site:note.com OR site:zenn.dev
"Claude Code" tips OR ノウハウ lang:ja

# GitHub リポジトリ動向（注目度急上昇を検知）
"obra/superpowers" OR "claude-code-hooks" trending
"claude-code" site:github.com new release OR update

# X トレンド
"Claude Code" OR "Anthropic" site:x.com lang:ja

# YouTube動画リサーチ（YouTube Transcript MCP が利用可能な場合）
"Claude Code" 解説 OR レビュー site:youtube.com （最新1週間）
→ ヒットした動画があれば字幕テキストを取得してコミュニティの反応・話題を把握
```

### Step 2: ツイートアイデア生成

スキャン結果から 3〜5 件のツイートアイデアを生成して提示。各アイデアに:
- ツイートタイプ（速報/実況/ノウハウ/引用 RT）
- ドラフト文（完成形）
- 推奨投稿時間

### Step 3: note 記事依頼（→ Notion ネタ帳）

ツイートアイデアのうち「深掘りすれば note 記事になる」ものを選別し、ユーザーに確認する:

```
📝 note 記事にできそうなネタ:
- [トピック名]: [一言説明]（推定スコア: ○点）

Notionのネタ帳に追加しますか？
```

承認されたら Notion「ネタ帳」DB（data_source: `collection://1a603b4f-d1e4-4ed7-8c75-c7c0a5b7e595`）に追加:
- タイトル: ネタの仮タイトル
- ソース: **X発案**
- ステータス: 未使用
- メモ: X でのトレンド情報、スキャン日時

---

## ビジュアルカード生成（任意・推奨）

X はテキストのみより画像付きの方がリーチが高い。ノウハウ系スレッドと速報ツイートでは積極的に使う。

### カード仕様

- サイズ: **1200×675px（16:9・X 最適）**
- テキスト: **入れる**（note サムネとは逆。X カードは文字で情報を先出し）
- ツールオプション: Gemini ImageFX、Canva MCP（`mcp__claude_ai_Canva__generate-design`）

### タイプ別プロンプト構造

**ノウハウ系（疑似 UI / 図解カード）:**
```
[テーマ: {ツイートのキーワード}]
Style: clean flat illustration, dark navy background, electric cyan accent
Content: minimal text overlay showing "{フックの核心 15文字以内}", subtitle "{サブテキスト}"
Layout: centered, large text dominant, small icon or diagram, no photography
Spec: 1200x675px, no real people, no complex illustrations
Negative: busy, cluttered, stock-photo-look, gradient mess
```

**速報系（ダーク + ネオン）:**
```
[テーマ: {新機能名 or サービス名}]
Style: futuristic UI screenshot, dark mode, neon glow cyan and orange
Content: bold headline "{機能名}" with glowing effect, minimal background interface
Layout: centered composition, dramatic lighting, rim light effect
Spec: 1200x675px, no real people
Negative: light background, cartoon, stock photo
```

**実況系（使わない）:**
実況ツイートはテキストのみで十分。カード生成はスキップしてよい。

### 生成フロー

```
1. ツイートのタイプを確認（ノウハウ/速報/実況）
2. 実況ならスキップ
3. 上記のプロンプト構造を使って Gemini または Canva でカードを生成
4. カードのパスをドラフトファイルのメモ欄に記載
5. 投稿メモに「画像: 添付済み」と記載する
```

---

## Phase 出力: 保存

### 保存先

- スレッド: `drafts/threads/draft_{日付}_{トピック要約}.md`
- 単発: `drafts/singles/draft_{日付}_{トピック要約}.md`

### ファイルフォーマット

```markdown
---
type: thread | single
source_article: {note記事パス or "standalone"}
source_notion_id: {Notion レコード ID or ""}
created: YYYY-MM-DD
status: draft
note_url: {URL or TBD}
---

# ツイート草稿

## ツイート1
{本文}

## ツイート2
{本文}
...

## 投稿メモ
- 推奨投稿時間: {時間帯}
- ハッシュタグ案: {0〜2個}
- note URL: {URL or TBD}
```

### コンソール出力

- 生成したツイート数
- ファイルパス
- 推奨投稿時間
- Notion 更新状況

---

## 投稿完了後の処理

ユーザーが X に投稿したら、Notion レコードを最終更新:
- `Xステータス`: 草稿完成 → **投稿済み**
- `XURL`: 投稿した X のポスト URL

実行コマンド例:
```
/x-run done {notion_record_id} {x_post_url}
```

---

## 品質ゲート

- [ ] 1ツイート 280 字以内（改行込み）
- [ ] フックが1行目にある
- [ ] AI 感のある言い回しがない
- [ ] ハッシュタグ 2 個以内
- [ ] 宣伝感がない（体験・実況ベース）
- [ ] note リンクが入るべき場所に入っている

---

## 投稿ルール（絶対厳守）

**YOU MUST NOT: ツイートを即時投稿すること。いかなる場合も禁止。**

### ブラウザで X を操作する前に必ず実行すること

X のブラウザ操作を開始する前に、**ログイン中のアカウントが `@moyuchi_cc` であることを必ず確認する**。

```
確認手順:
1. x.com を開く
2. 右上のアイコン or プロフィールページでアカウント名を確認
3. @moyuchi_cc であることを目視確認してから作業を開始する
```

**アカウントが違った場合は即停止。** 絶対に操作せず、ユーザーにアカウントの切り替えを依頼する:
```
⚠️ ログイン中のアカウントが @moyuchi_cc ではありません（現在: @{確認したアカウント名}）
   アカウントを @moyuchi_cc に切り替えてから、もう一度実行してください。
```

### 投稿方法（X 予約投稿機能を使う・固定）

ドラフト保存後、**必ず**ブラウザで以下まで操作する。即時投稿・手動コピペ案内は禁止。

#### Phase B-1: アカウント確認

```
1. mcp__claude-in-chrome__tabs_context_mcp でタブ状況を確認
2. 新しいタブを開いて x.com にアクセス
3. ログインユーザーを確認（プロフィールアイコン or x.com/settings/account）
4. @moyuchi_cc でなければ即停止してユーザーに切り替えを依頼
```

#### Phase B-2: 予約投稿セット（1ツイートずつ）

スレッドの場合はツイート1を入力後、リプライとして続きを繋げる。

```
1. x.com/compose/post を開く
2. 草稿テキストを textarea に入力（mcp__claude-in-chrome__form_input）
3. 📅（スケジュール）アイコンをクリック
4. 推奨日時（月/日/年 時:分）を日付・時刻フィールドに入力
5. 「確認」ボタンをクリック（スケジュール確定ダイアログがある場合）
6. ← ここで停止。スクリーンショットを撮ってユーザーに確認を求める →
```

#### Phase B-3: ユーザーへの確認メッセージ（固定フォーマット）

```
📅 予約投稿の準備ができました

記事: {記事タイトル}
投稿日時: {YYYY-MM-DD HH:MM}
プレビュー: {ツイート1の冒頭30字}...

「スケジュール」ボタンを押してください。
押したら完了を教えてもらえると Notion ステータスを「投稿済み」に更新します。
```

送信・スケジュール確定ボタンは必ずユーザーが押す。Claude は押さない。

---

## 関連スキル

- `content-engine` — 素材からプラットフォーム別コンテンツを生成
- `crosspost` — X + LinkedIn + Threads + Bluesky への同時展開
