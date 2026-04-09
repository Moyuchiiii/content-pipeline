---
name: collect-stats
description: X Analytics と note ダッシュボードのデータを収集し、x-performance.md / note-performance.md / Notion を自動更新する。X データは xmcp API を優先し、未設定時はブラウザにフォールバック。
user-invocable: true
allowed-tools: mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__get_page_text, mcp__claude-in-chrome__javascript_tool, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__computer, Read, Write, Edit, mcp__notion__notion-fetch, mcp__notion__notion-update-page, mcp__xmcp__getUsersIdTweets, mcp__xmcp__findTweetById, mcp__xmcp__usersIdTweets
---

# /collect-stats

X Analytics と note ダッシュボードのデータを収集する。

## 使い方

```
/collect-stats        # X + note 両方収集
/collect-stats x      # X のみ
/collect-stats note   # note のみ
```

---

## 事前確認（必ず最初に実行）

```
1. mcp__claude-in-chrome__tabs_context_mcp でタブ状況を確認
2. 作業用の新規タブを開く（既存タブを汚さない）
3. 収集が終わるまで他のタブを操作しない
```

**YOU MUST NOT: データ収集中に投稿・フォロー・いいね等の書き込み操作をすること。読み取りのみ。**

---

## モード A: X Analytics 収集

### Step 0: xmcp API で取得を試みる（優先）

xmcp が MCP サーバーとして設定されている場合はこちらを使う。ブラウザより安定していて速い。

```
1. mcp__xmcp__getUsersIdTweets（または mcp__xmcp__usersIdTweets）を呼び出す
   - ユーザーID: @moyuchi_cc のID（初回は事前に調べておく）
   - パラメータ: tweet.fields=public_metrics,created_at,text&max_results=20
2. レスポンスの public_metrics から以下を取得:
   - impression_count（インプレッション）
   - like_count（いいね）
   - retweet_count（リポスト）
   - reply_count（リプライ）
   - bookmark_count（ブックマーク）
3. 成功したら Step 4 へ進む
```

**xmcp が使えない場合（ツールが存在しない・認証エラー等）:**
→ Step 1 のブラウザフォールバックへ進む

**xmcp のツール名確認方法:**
xmcp セットアップ直後は利用可能なツール名が変わる場合がある。
`mcp__xmcp__` でタブ補完し、`tweets`・`users` を含むツール名を探す。

---

### Step 1: ブラウザフォールバック（xmcp が使えない場合のみ）

#### アカウント確認

```
1. 新規タブで x.com を開く
2. mcp__claude-in-chrome__javascript_tool で以下を実行してログインユーザーを確認:
   document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]')?.textContent
3. @moyuchi_cc であることを確認。違う場合は即停止してユーザーに報告
```

#### Analytics ページへ移動

```
URL: https://analytics.twitter.com/user/moyuchi_cc/tweets
```

ページが読み込まれたら `mcp__claude-in-chrome__get_page_text` でテキスト全取得。

読み込みに失敗した場合（アクセス制限等）は以下を試す:
```
代替URL: https://x.com/moyuchi_cc/analytics
または: x.com のメニューから「アナリティクス」を探す
```

#### ツイートデータ抽出

`mcp__claude-in-chrome__javascript_tool` で数値を抽出する（DOM変更に強い方法）:

```javascript
// インプレッション・エンゲージメント等を取得
const text = document.body.innerText;
const lines = text.split('\n').filter(l => l.trim());
// 日付・ツイート内容・数値のパターンを検出
console.log(JSON.stringify(lines.slice(0, 100)));
```

**データが取れない場合（Analyticsページが変わっている等）:**
```
1. mcp__claude-in-chrome__computer でスクリーンショットを撮る
2. 画面に表示されているデータを目視で読み取る
3. 読み取れた分だけ記録してユーザーに「手動確認が必要な箇所あり」と報告
```

取得できるデータ:
- 投稿日時
- ツイート本文（先頭40字）
- インプレッション数
- エンゲージメント数（いいね + リポスト + リプライ）
- いいね数・リポスト数・URLクリック数（あれば）

### Step 4: x-performance.md 更新

`context/x-performance.md` を読み込んで、収集したデータで更新する。

**既存レコードの扱い:**
- 同じ日付・同じツイートが既にある → 数値を上書き（最新データで更新）
- 新しいツイート → 末尾に追加

**更新フォーマット:**
```markdown
| 日付 | タイプ | 内容（先頭40字） | インプレッション | いいね | リポスト | URLクリック | 学び |
|---|---|---|---|---|---|---|---|
| YYYY-MM-DD | thread/single | {内容} | {数値} | {数値} | {数値} | {数値 or -} | {後で追記} |
```

### Step 5: content-memory.md のフック型集計更新

収集データから「フック型別の成功率」テーブルを更新する。

フック型の判定:
- 「〜してみた結果」「〜したら〜になった」→ 体験型
- 「これ知らない人多すぎる」「〜だと気づいた」→ 発見型
- 数字から始まる → 数字型
- 問いかけ → 疑問型
- その他 → 汎用型

---

## モード B: note 収集

### Step 1: note ダッシュボードへ移動

```
URL: https://note.com/moyuchi_aistu/stats
```

ページ読み込み後、`mcp__claude-in-chrome__get_page_text` でテキスト全取得。

読み込み失敗時の代替:
```
URL: https://note.com/stats
または: note.com にログイン後、右上メニュー → 「ダッシュボード」
```

### Step 2: 記事データ抽出

```javascript
// 記事タイトル・PV・スキ数・売上を抽出
const text = document.body.innerText;
// タイトルと数値のペアを検出
console.log(text);
```

取得するデータ（全記事分）:
- 記事タイトル
- PV数
- スキ数
- コメント数
- 売上（有料記事のみ）
- 公開日

### Step 3: note-performance.md 更新

`context/note-performance.md` を読み込んで更新する。

**既存レコードの扱い:**
- 既存記事 → PV・スキ数を最新値で上書き
- 新規記事（note-performance.mdにない） → 新しいセクションを追加

**新規記事の追記フォーマット:**
```markdown
### 記事N: {タイトル}
- URL: https://note.com/moyuchi_aistu/n/{id}
- 公開日: YYYY-MM-DD
- 価格: 無料 or ¥{価格}
- PV: {数値}
- コメント: {数値}
- スキ数: {数値}
- テーマ: {タグや内容から1行}
- 学び: （後で追記）
```

### Step 4: Notion 記事管理DB 更新

`mcp__notion__notion-fetch` で `collection://812aa728-8d3e-42e4-a9cd-6a91c303b2c2` を取得し、
収集したデータと照合して各レコードを `mcp__notion__notion-update-page` で更新する。

更新するフィールド:
- PV
- スキ数
- 売上推計（スキ数 × 価格 × 1.5）

### Step 5: note-performance.md の PDCA分析を更新

```markdown
## PDCA分析（{今日の日付}更新）

### 成功パターン
- スキ数TOP: {タイトル}（{スキ数}スキ、スキ転換率{%}）
- PV TOP: {タイトル}（{PV}PV）

### 課題
- （データから読み取れる課題）

### 次回記事への示唆
- （データから導ける示唆）
```

---

## 両モード共通: 後処理

### 作業タブを閉じる

収集完了後、作業で開いた新規タブを閉じる。
ユーザーが作業前から開いていたタブは絶対に閉じない。

### コンソール出力

```
✅ collect-stats 完了（{モード}）

--- X Analytics ---
収集ツイート数: {N}件
期間: {開始日} 〜 {終了日}
更新ファイル: context/x-performance.md

--- note ---
収集記事数: {N}件
総PV: {数値} / 総スキ: {数値}
更新ファイル: context/note-performance.md
Notion更新: {N}件

取得できなかったデータ: {あれば記載、なければ「なし」}

⏭️ 次のステップ → /note-run
```

---

## エラーハンドリング

| 状況 | 対応 |
|---|---|
| ログインしていない | 停止してユーザーに「{サービス名}にログインしてください」と伝える |
| アカウントが違う | 即停止。「@moyuchi_cc でログインしてください」と伝える |
| Analyticsページにアクセスできない | スクリーンショットで確認、読み取れた分だけ記録 |
| データが0件 | 「データが見つかりませんでした。ページ構造が変わった可能性があります」と報告してスクリーンショットを撮る |
| JS実行エラー | `get_page_text` のテキストから手動パースに切り替え |
