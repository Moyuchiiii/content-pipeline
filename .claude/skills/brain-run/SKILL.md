---
name: brain-run
description: noteで作った記事を Brain（https://brain-market.com/）向けに拡張リライトして販売用ドラフトを自動生成するスキル。note/today/ の最新記事を読み、コード全文・プロンプト全文・テンプレ等の「買う価値」を追加して brain/today/ に出力する。投稿は手動。
allowed-tools: WebSearch, WebFetch, Write, Read, Glob, Grep, Bash, mcp__notion__notion-search, mcp__notion__notion-fetch, mcp__notion__notion-update-page, mcp__notion__notion-create-pages
---

# /brain-run

note で書いた記事を Brain 向けに拡張リライトし、販売ドラフトを自動生成するスキル。
note は「実体験の記録・入門・ダイジェスト（無料 or ¥500）」、Brain は「実践ノウハウ・コード全文・テンプレ付きの完成版（¥1,980〜）」という役割分担で運用する。

**投稿は手動**。Brain は公開 API なし・reCAPTCHA ありで自動投稿リスク高。ドラフト作成までが自動の現実的ライン。

---

## Phase 0: コンテキスト読み込み + 対象記事判定

### ① コンテキスト読み込み

**Brain 特化コンテキスト（最優先）:**
- `context/brain-profile.md` — Brain プロフィール（3パターン・文体ガイド・カテゴリ・タグ戦略）
- `context/brain-strategy.md` — Brain 運用戦略・商品ラインナップ計画・価格戦略・審査対策

**共通コンテキスト:**
- `context/note-profile.md` — プロフィール・ポジショニング
- `context/note-strategy.md` — 収益化戦略
- `context/voice-samples.md` — 文体サンプル
- `context/writing-rules.md` — 証拠優先ルール・AI禁止フレーズ
- `context/article-frameworks.md` — AIDA・Star Story Solution
- `context/existing-articles.md` — 過去記事一覧
- `context/content-memory.md` — 成功パターン（あれば）

**参照レポート（相場・競合分析の裏取り用）:**
- `D:/Claude/bussines/search/brain-competitors-2026-04-20.md` — 競合 10 人プロフィール・商品ラインナップ・サムネテンプレ

### ② 対象 note 記事の特定

以下の優先順で対象記事を決定する：

**ルート A（自動）: 引数なし**
1. `note/today/` 配下に HTML ファイルがあればそれを対象
2. なければ `note/drafts/{sokuho,jituroku,knowhow}/` から最新更新日のファイルを選択
3. 見つからない場合はエラー終了（「Brain化できる note 記事が見つかりません。先に /note-run を実行してください」）

**ルート B（手動）: 引数で指定**
```
/brain-run {記事パス}
/brain-run latest         # 最新ドラフト（ルート A と同じ）
/brain-run url {note_url} # 既に投稿済み note 記事を URL で指定
```

### ③ 対象記事タイプと Brain 化可否判定

| 記事タイプ | Brain 化 | 拡張方針 |
|---|---|---|
| 実録（jituroku） | ◎ 最適 | コード全文・プロンプト全文・受注テンプレ・単価交渉スクリプトを追加 |
| ノウハウ（knowhow） | ◎ 最適 | テンプレ・チェックリスト・設定ファイル全文を追加 |
| 速報（sokuho） | △ 要検討 | 速報は鮮度が命で Brain の長期販売と相性悪い。対象外推奨 |

**速報記事を対象にしようとした場合:**
「速報記事は Brain 販売に向きません（鮮度依存のため）。それでも続けますか？」とユーザーに確認。

### ④ 同一記事の重複出品チェック

Notion「note記事管理」DB で対象記事の `Brainステータス` を確認:
- `投稿済み` → 「すでに Brain 出品済みです。リライト再生成しますか？」と確認
- `草稿完成` → 「すでに Brain 草稿があります。上書きしますか？」と確認
- `未作成` または該当フィールドなし → そのまま次 Phase へ

---

## Phase 1: Brain 相場調査

Brain 内で同ジャンルの売れ筋を調査し、価格・タイトル・説明文の相場を把握する。

### Step 1: Brain サイトで相場確認

**YOU MUST: 記憶ではなく WebFetch で実際に https://brain-market.com/ のランキングページを取得すること。**

1. https://brain-market.com/ の新着・ランキングを取得
2. 対象記事のトピック（Claude Code / AI副業 / クラウドワークス等）と類似する商品を 3〜5 件抽出
3. 各商品について記録:
   - タイトル
   - 価格（¥）
   - 販売数（購入済みの数字）
   - 説明文の冒頭 200 字
   - URL

**補助検索（WebSearch）:**
```
Brain "Claude Code" site:brain-market.com
Brain "AI副業" 人気 ranking
Brain "クラウドワークス" 販売
```

### Step 2: 相場まとめ出力

以下の形式で中間報告する:

```
📊 Brain 相場調査結果（同ジャンル上位 3〜5 件）

1. [タイトル] — ¥{価格} × {販売数}件 → 推定売上 ¥{価格×販売数×0.88}
2. ...

推奨価格帯: ¥{下限}〜¥{上限}
推奨説明文スタイル: {共通パターンの要約}
```

---

## Phase 2: Brain 用拡張リライト

note 版との差別化のため、「買う価値」を明確にするコンテンツを追加する。

### 絶対ルール

- **note 版の完全コピー禁止**: 最低 30% 以上の追加・再構成を行う
- **個人体験談として明記**: タイトル・冒頭に「文系大学生が」「自分の場合」等を入れる
- **誇大表現禁止**: 後述のブラックリスト参照
- **実績証拠を盛り込む**: スクショ配置指示・具体的な金額・件数を残す
- **匿名化**: クライアント名・個人特定情報は伏せる

### 追加すべきコンテンツ（記事タイプ別）

**実録（jituroku）拡張:**

- note 版の導入・結果は流用
- 以下を追加:
  - クライアントとのやり取り全文（匿名化・Before/After 付き）
  - 単価交渉時のメッセージテンプレ
  - Claude Code に投げた実際のプロンプト全文
  - 生成されたコード全文（動作確認済み版）
  - 納品チェックリスト
  - トラブルシュート集（自分が実際に踏んだエラーと解決手順）
  - 受注〜納品のスケジュール表（時間配分の数字）
  - この手法を他ジャンルに応用する方法

**ノウハウ（knowhow）拡張:**

- note 版の概要は流用
- 以下を追加:
  - 設定ファイル全文（`.claude/settings.json` 等）
  - プロンプトテンプレ集（コピペで使える状態）
  - カスタマイズ方法（初心者向け・中級者向け）
  - よくある失敗パターンと回避策
  - 自分の運用ログ（数週間分のデータ）
  - 応用展開のアイデア 3〜5 個

### Brain エディタ対応フォーマット

出力は **Markdown 形式** で書く（Brain エディタは Markdown ペースト対応）。

使用可能記法:
- `# ` `## ` `### ` — 見出し
- `**太字**` — 強調
- `> ` — 引用
- `` `コード` `` — インラインコード
- ` ``` ` — コードブロック（言語指定付き）
- `- ` `1. ` — 箇条書き・番号付き
- `---` — 区切り線
- `[リンク](URL)` — ハイパーリンク

### 構成テンプレート（実録記事の場合）

```markdown
# {タイトル}

## この記事で手に入るもの
- コード全文（コピペで動く）
- プロンプト全文（{件数}個）
- 受注〜納品のテンプレ・チェックリスト
- 単価交渉スクリプト
- トラブルシュート集

## 前提・読者層
- {対象読者層の明記}
- 必要な前提知識（なければ「なし」と明記）
- 用意するもの

## 実録: {具体的な案件名}
### Before — 何に困っていたか
### 何をしたか — 時系列ログ
### After — 結果と学び

## 使った技術スタック
- Claude Code バージョン・設定
- 外部サービス・ツール

## プロンプト全文（{件数}個）

### プロンプト1: {用途}
```
{プロンプト本文}
```

### プロンプト2: {用途}
...

## 生成されたコード全文
```{言語}
{コード}
```

## 受注〜納品のテンプレ

### クライアントへの初回返信
```
{テンプレ本文}
```

### 単価交渉
```
{テンプレ本文}
```

### 納品時の報告
```
{テンプレ本文}
```

## トラブルシュート集

### エラー1: {エラー名}
- 症状
- 原因
- 解決手順

## 応用: この手法を他ジャンルに使う

## まとめ

## 著者プロフィール
- 現役{大学名}{学年}／文系／副業歴{期間}
- 実績: {具体的な金額・件数}
- X: {@アカウント名}
- note: {URL}
```

### 分量の目安

- 実録: 6,000〜12,000 字（note 版の 2〜3 倍）
- ノウハウ: 8,000〜15,000 字

---

## Phase 3: タイトル・商品説明文の生成

Brain の商品ページでは「タイトル」「サブタイトル」「商品説明文（購入前に見える冒頭部分）」が売上を決める。

### Step 1: タイトル A/B テスト

5 本生成してスコアリング。既存 Brain 売れ筋タイトルの型に寄せる。

**Brain で効くタイトル型:**
- **数字実績型**: 「文系大学生が2ヶ月で月14万達成した{具体手段}」
- **完全公開型**: 「{具体タスク}の全手順・プロンプト・コード完全公開」
- **Before/After 型**: 「{困りごと}の状態から{結果}になるまで」
- **具体ツール型**: 「Claude Code × {他ツール} で {結果} を出す方法」

**タイトルスコアリング（各 20 点満点）:**

| 項目 | 判定基準 |
|---|---|
| 具体性 | 数字・固有名詞が入っているか（0-5点） |
| 結果明示 | 「何が手に入るか」が一目でわかるか（0-5点） |
| 誇大表現チェック | 後述ブラックリスト違反がないか（0-5点） |
| 検索キーワード | Brain 内検索で出てきそうなワードか（0-5点） |

**誇大表現ブラックリスト（即リジェクト）:**
- 「誰でも」「絶対」「必ず」「確実に」
- 「再現性 100%」「世界初」
- 「1日○分で月○万」（時間×金額の断定）
- 「知らないと損」「絶対知るべき」
- 「月○万円保証」「収入保証」

### Step 2: サブタイトル生成

- 30〜60 字
- タイトルで言い切れなかった「誰向け」「何が含まれるか」を補足
- 例: 「非エンジニアでも今日から動かせるテンプレ・コード全部入り」

### Step 3: 商品説明文生成

Brain の購入前表示部分（冒頭 200〜400 字）で以下の要素を順番に書く:

1. **フック** — 読者の痛みに触れる 1〜2 文
2. **実績の数字** — 「文系大学生が 2 ヶ月で月 14 万達成」等（個人体験として明記）
3. **この記事を買うと手に入るもの** — 箇条書き 4〜6 項目
4. **対象読者** — 1〜2 文（「こんな人向け」）
5. **注意書き** — 「本記事は個人の体験談であり、同様の成果を保証するものではありません」を必須挿入

### タイトル・説明文の出力フォーマット

```
🏷️ タイトル候補:
1. [タイトルA] — 18/20点 ✅ 採用
2. [タイトルB] — 16/20点
3. [タイトルC] — 14/20点
4. [タイトルD] — 13/20点
5. [タイトルE] — 11/20点

📝 サブタイトル: {サブタイトル}

📄 商品説明文（購入前表示・400字以内）:
{説明文本文}
```

---

## Phase 4: 価格・紹介還元率の提案

### 価格の決め方

Phase 1 の相場調査と以下の条件を組み合わせる:

| 条件 | 推奨価格 |
|---|---|
| Brain 販売実績ゼロ（初投稿） | ¥1,980 |
| 販売実績 1〜5 件 | ¥1,980〜¥2,980 |
| 販売実績 6 件以上 + スキ 10 以上 | ¥2,980〜¥4,980 |
| コード全文＋テンプレ＋設定ファイル付き | +¥1,000 上乗せ可 |
| 速報性がある（リリース 48 時間以内） | +¥500 上乗せ可（鮮度プレミア） |

### 紹介還元率の決め方

Brain の強みはアフィリエイト機能。還元率が高いほどアフィリエイターが拡散しやすい。

| フェーズ | 推奨還元率 |
|---|---|
| 販売初動（実績ゼロ〜5 件） | **50%**（拡散重視） |
| 安定期（6〜20 件） | 40% |
| 安定期（21 件〜） | 30%（利益重視） |

**出力フォーマット:**

```
💰 価格・還元率の提案

価格: ¥{価格}
理由: {根拠3行}

紹介還元率: {%}
理由: {根拠1行}

取り分シミュレーション（月5部販売の場合）
- 自己経由売上: ¥{価格} × 5 × 88% = ¥{金額}
- 紹介経由売上: ¥{価格} × 5 × (100% - {紹介率}% - 12%) = ¥{金額}
- 平均想定: ¥{中央値}/月
```

---

## Phase 5: 品質ゲート

### Step 1: 誇大表現スウィープ（必須）

記事全文を以下のブラックリストで grep し、該当があれば必ず修正する:

**即リジェクトワード:**
- 「誰でも」「必ず」「絶対」「確実に」
- 「再現性 100%」「世界初」「最強」「最速」
- 「保証」「収入保証」
- 「1日{数字}分で月{数字}万」系
- 「知らないと損」「知らないと危険」

**要注意ワード（文脈で判断）:**
- 「簡単に」「すぐに」「誰でもできる」 → 「個人的には〜」「自分の場合は〜」に言い換え
- 「稼げる」 → 「稼いだ（個人の体験）」に言い換え

**修正後は必ず「個人の体験談」タグが入っているか再確認。**

### Step 2: 規約チェックリスト

Brain 規約（/terms は 404 のためガイドラインベースで確認）に基づく以下を必ずチェック:

- [ ] 誇大表現がない
- [ ] 個人体験である旨が冒頭・末尾に明記されている
- [ ] 他サービス（note・X等）への誘導リンクが「販売誘導」になっていない（著者プロフィール欄の参照のみ OK）
- [ ] 根拠のない統計・データがない
- [ ] 医療・投資助言系の記述がない
- [ ] 「効果には個人差があります」の免責文がある

### Step 3: 100 点ルーブリック採点

**コンテンツ価値（40 点満点）:**
- 「この記事を買う理由」が明確か（0-10）
- コード・プロンプト・テンプレの実用性（0-10）
- 非エンジニアでも実行可能か（0-10）
- note 版との差分が明確か（30% 以上の追加情報）（0-10）

**Brain 最適化（30 点満点）:**
- タイトルの相場適合性（0-10）
- 商品説明文のフック力（0-10）
- 価格の妥当性（0-10）

**リスク（20 点満点）:**
- 誇大表現スウィープ実施済み（0-10、未実施は 0 点固定）
- 匿名化・免責文（0-10）

**voice 一貫性（10 点満点）:**
- 「文系大学生の自分」の一人称保持（0-5）
- AI 定型フレーズがない（0-5）

**判定:**
- 80 点以上 → 公開可
- 60〜79 点 → 軽微修正で公開可
- 60 点未満 → 自動 rewrite（最大 2 回）、2 回でも 60 未満ならユーザー報告

**採点結果の表示:**
```
📊 品質スコア: {点}/100 {判定}
  コンテンツ価値: {点}/40
  Brain最適化:    {点}/30
  リスク:         {点}/20
  voice一貫性:    {点}/10
```

---

## Phase 6: 保存・出力

### Step 1: 前回の `brain/today/` を正規フォルダに移動

`brain/today/` フォルダの中身を確認し、ファイルがあれば正規フォルダへ移動:
- `brain/today/*.md` → `brain/drafts/{記事タイプ}/`

（`brain/today/` が空ならスキップ）

### Step 2: 今回のファイルを 2 箇所に保存

**本文ファイル:**
1. `brain/drafts/{記事タイプ}/brain_{日付}_{トピック要約}.md` — バックアップ
2. `brain/today/brain_{日付}_{トピック要約}.md` — 投稿用（すぐ開ける場所）

**メタファイル（タイトル・説明文・価格・タグ・還元率を 1 つにまとめる）:**
3. `brain/drafts/{記事タイプ}/brain_{日付}_{トピック要約}_meta.md` — バックアップ
4. `brain/today/brain_{日付}_{トピック要約}_meta.md` — 投稿用

### Step 3: 本文ファイルのフォーマット

冒頭メタ情報（HTML コメント、Brain ペースト時に削除）:
```markdown
<!--
source_note: {note 版のファイルパス or URL}
type: jituroku / knowhow
score: {Phase 5 の総合スコア}
created: YYYY-MM-DD
status: final
-->

# {記事タイトル}

{本文}
```

### Step 4: メタファイルのフォーマット

```markdown
# Brain 投稿メタ情報

## タイトル
{採用タイトル}

## サブタイトル
{サブタイトル}

## 商品説明文（購入前表示）
{説明文本文}

## カテゴリ
{Brain カテゴリ選択候補: AI / 副業 / 勉強法 等}

## タグ
{タグ1}, {タグ2}, {タグ3}, ...

## 価格
¥{価格}

## 紹介還元率
{%}%

## 免責文
本記事は個人の体験談であり、同様の成果を保証するものではありません。

## 投稿チェックリスト
- [ ] タイトル入力
- [ ] サブタイトル入力
- [ ] 本文ペースト（brain_{日付}_{トピック}.md の本文）
- [ ] サムネ画像アップロード
- [ ] カテゴリ選択
- [ ] タグ設定
- [ ] 価格設定: ¥{価格}
- [ ] 紹介還元率設定: {%}%
- [ ] プレビュー確認
- [ ] 公開
```

### Step 5: 完了サマリー出力

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Brain 用ドラフト完成

タイトル : {採用タイトル}
タイプ   : {実録 / ノウハウ}
価格     : ¥{価格}
還元率   : {%}%
スコア   : {Phase 5 総合}/100

ファイル:
  本文 → brain/today/brain_{日付}_{トピック}.md
  メタ → brain/today/brain_{日付}_{トピック}_meta.md

想定収益（月 5 部販売）: ¥{金額}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 TODO

【1】Brain に投稿
  1. https://brain-market.com/ にログイン
  2. 「コンテンツを投稿する」をクリック
  3. メタファイル（_meta.md）の投稿チェックリストに従って入力
  4. 本文ファイルの内容をペースト
  5. サムネをアップロード（↓ のプロンプトで Gemini 生成）
  6. 公開

【2】公開後の記録
  Notion「note記事管理」DB の対象レコードに以下を更新:
  - Brainステータス → 投稿済み
  - Brain URL → 公開後の URL
  - Brain 公開日 → 今日の日付

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖼️ サムネプロンプト（gemini.google.com の画像生成に貼り付け）

{下記テンプレを使用}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### サムネイル生成プロンプト（Brain 特化版・2026-04-20 実地競合分析ベース）

**参照元**: `D:/Claude/bussines/search/brain-thumbnail-analysis-2026-04-20.md`（Brain 売れ筋 20 件視覚要素分析）

#### Brain サムネの 3 大パターン（把握必須）

- **パターン A 情報商材ゴールド型（40%）**: 漆黒 + 金ピカグラデ + 「完全攻略」「教科書」+ 特典バッジ（リツト・ベク等）
- **パターン B ゲーム/アニメ ド派手ネオン型（30%）**: 黒 + 虹色ネオン光線 + アニメキャラ + 月○万円激デカ（メラメラくん・トシノ等）
- **パターン C テキスト密度型（25%）**: 濃紺/黒 + 白テキスト多段 + ツール名大 + チェックマーク（n8n 攻略バイブル等）
- **パターン D（例外）ライト系クリーン型（5%）**: オフホワイト + ツールロゴ + 顔写真丸型（しゅうへいの Claude 教科書のみ）

#### 優太が狙うポジション

**「パターン C テキスト密度型ベース + 情報商材ギラギラを抑えたクリーンダーク路線」**

- ダーク背景は採用（Brain 相場の 90% がダーク。白系にするとカテゴリ内で浮く）
- 数字訴求は採用（90% が何らかの数字を配置。「月 14 万」は優太の核心差別化）
- 金ピカグラデ・月桂樹バッジ・宇宙星雲・虹色ネオン・アニメキャラは**全て避ける**（コモディティ化 or 優太ブランドと矛盾）
- 代わりに「クリーンなダーク + オレンジ/ゴールド最小限アクセント + 実直なレイアウト」で「文系大学生・実直・若さ」を表現

#### note との違い（展開時の混同防止）

| 比較軸 | note サムネ | Brain サムネ（優太版） |
|---|---|---|
| 背景色 | オフホワイト/ライトグレー | 漆黒/濃紺 |
| テキスト色 | ダークグレー | 白 + オレンジ/ゴールド最小限 |
| フォントウェイト | Regular〜Medium | Bold〜Ultra Bold |
| 文字密度 | タイトル 1〜2 行のみ | 3〜5 行 + サブコピー |
| 数字の扱い | なし or 小さく | 「月 14 万」等を大きく配置 |
| 装飾要素 | 幾何学シェイプ | 薄い回路/グリッド・オレンジライン |
| 雰囲気 | 知的・クリーン・記事メディア | 実績訴求・ダーク・信頼感 |

---

#### 記事タイプ別プロンプト 4 種

以下の 4 タイプから記事タイプに応じて選択してユーザーに出力する。Gemini / Nano Banana（gemini.google.com）に貼り付けて画像生成する想定。

---

##### プロンプト 1: 実録記事型（`jituroku` + 受注・納品・副業ワークフロー系）

```
Create a 16:9 thumbnail image (1280x670px) for a Japanese digital content product on Brain marketplace.

=== DESIGN SPECIFICATION ===

BACKGROUND:
- Deep navy to charcoal gradient (#1A1A2E → #0D0D0D), left to right
- Subtle circuit board pattern overlay at 10% opacity in dark teal (#003333)
- NO bright neon beams, NO rainbow light rays

MAIN TEXT (Japanese, positioned left-center area, 55% width):
- Top label: 「実録」in a clean white rectangle badge, 18px equivalent
- Main headline: 「{短縮タイトル（例: CW案件 受注→納品）}」in ultra-bold gothic, 72px equivalent, pure white
- Sub headline: 「全記録公開」in semi-bold, 48px, warm orange (#FF6B35)
- Body line 1: 「{実績フレーズ（例: 文系大学生が2ヶ月でやったこと）}」in regular, 22px, light gray (#CCCCCC)
- Body line 2: 「{補足訴求（例: プログラミングゼロ・Claude Codeだけ）}」in regular, 20px, light gray

NUMBER BADGE (right-center, 35% width area):
- Large number: 「月14万」in extra-bold, gradient fill (warm orange #FF6B35 to gold #FFD700), 96px
- Below number: 「達成した記録」in white, 20px
- Circle badge style with dark border

ICONS & ELEMENTS:
- CrowdWorks logo icon (simple flat, white) - left side of badge area
- Claude asterisk logo icon (simplified, orange) - paired with CrowdWorks
- Arrow icon between them (→ style, white)
- NO anime characters, NO realistic AI face photos, NO gold laurel wreaths

ACCENT COLOR: Warm orange (#FF6B35), Gold (#FFD700)
FONT STYLE: Clean ultra-bold sans-serif (not decorative/gimmicky)
ATMOSPHERE: Serious college student vibe, trustworthy, not gaudy information-product look

=== AVOID ===
- Rainbow neon beams
- Excessive sparkle/glitter effects
- Gold embossed text with heavy shadows
- Anime characters
- "豪華○大特典" badge style
- Anything that looks like a gambling/lottery advertisement
```

---

##### プロンプト 2: ノウハウ / 教科書型（`knowhow` + 「教科書」「完全ガイド」系）

```
Create a 16:9 thumbnail image (1280x670px) for a Japanese educational content on Brain marketplace.

=== DESIGN SPECIFICATION ===

BACKGROUND:
- Very dark charcoal (#111111) base
- Horizontal thin lines (like notebook/grid) in dark gray (#1E1E1E) at 5% opacity
- Left side: subtle blue-teal glow gradient from edge (#002244 at 30% opacity)
- Clean, professional dark theme

LAYOUT: Two-zone layout
LEFT ZONE (60% width):
  - Tool name badge: 「{ツール名（例: Claude Code）}」in white pill badge, rounded corners, dark border
  - Main title: 「{×対象（例: ×クラウドワークス 受注教科書）}」ultra-bold white gothic, 2 lines, 68px
  - Tag line: 「{ターゲット層（例: 非エンジニア・文系大学生向け）}」in small white text, 18px
  - Bullet points (3 lines, 20px, light gray):
    「{訴求点1（例: 案件選定→応募→納品まで完全解説）}」
    「{訴求点2（例: プログラミング経験ゼロからスタート）}」
    「{訴求点3（例: 実際の受注記録をそのまま公開）}」

RIGHT ZONE (40% width):
  - Book/textbook illustration (simple flat design) in teal/navy
  - Tool logo icons floating beside book (e.g., Claude logo, CrowdWorks icon)
  - Small "教科書" or "完全ガイド" label on book cover in gold (#FFD700)

ACCENT ELEMENTS:
- Thin horizontal orange line (#FF6B35) separating title area from bullets
- Page/chapter badge: 「{付加情報（例: 2ヶ月の記録 / 全○章）}」in small badge

COLORS: #111111 base, #FFFFFF text, #FF6B35 accent, #FFD700 small accent, #4EC9B0 teal elements
ATMOSPHERE: Structured textbook feel, trustworthy, young but serious, NOT flashy

=== AVOID ===
- Cosmic/space background imagery
- Gold gradient text
- 3D emboss effects
- Rotating sparkles
- Anything that resembles pachinko/gambling visual style
```

---

##### プロンプト 3: ツールキット型（テンプレ集・プロンプト集・GPTs 付き商品）

```
Create a 16:9 thumbnail image (1280x670px) for a Japanese tool/template product on Brain marketplace.

=== DESIGN SPECIFICATION ===

BACKGROUND:
- Dark navy (#0A0E27) base
- Subtle grid lines in slightly lighter navy (#0F1535) at 15% opacity
- Right side: soft dark purple glow (#1A0033 at 40% opacity blend)

TOP BANNER (full width, dark teal #006666):
- Text: 「すぐに使える テンプレート集」in white medium gothic, 20px

MAIN CONTENT AREA:
Left side (50%):
  - Big number: 「{同梱数（例: 30）}」in extra-bold, very large (120px), white with orange underline
  - Text below number: 「{何本か（例: 本の応募文テンプレ）}」in bold white, 32px
  - Separator line (orange #FF6B35, 2px)
  - Second row: 「+ {追加要素（例: GPTs付き）}」in bold, 28px, gold (#FFD700)

Right side (50%):
  - Stack of "card" visuals (3-4 overlapping cards showing template preview)
  - Cards should be dark (#1E1E2E) with white text lines simulating document content
  - Small tool logo icon on top card (e.g., Claude)

BOTTOM BAR (full width, slightly lighter dark):
- Three mini badges in white rectangles:
  「{対応範囲1（例: クラウドワークス対応）}」「{特徴2（例: コピペで即使える）}」「{ターゲット3（例: AI副業に最適）}」

COLORS: #0A0E27 base, white text, #FF6B35 accent orange, #FFD700 gold
ATMOSPHERE: Tool/utility feel, organized, practical - like a developer's toolkit not a lottery ad

=== AVOID ===
- Light or colorful backgrounds
- Realistic face photos
- Anime character illustrations
- Excessive decorative effects (flames, sparkles, explosions)
- Yellow/gold gradient text on black (too information-product classic)
```

---

##### プロンプト 4: フラッグシップ型（完全ロードマップ・完全公開・高価格帯 ¥7,980〜）

```
Create a 16:9 thumbnail image (1280x670px) for a Japanese flagship digital product on Brain marketplace.

=== DESIGN SPECIFICATION ===

BACKGROUND:
- Deep black (#000000) base
- Center-radiating very subtle blue-gray light (#111827) — NOT bright, just slight depth
- Left edge: dark teal vertical gradient strip (5% width, #004444)
- NO space nebula, NO planet imagery, NO matrix rain

LARGE NUMBER FOCAL POINT (center-right, 40% area):
- Giant number: 「{最大実績数字（例: 14万）}」in the largest possible size (140px), positioned center-right
- Color: warm orange (#FF7A35) to gold (#FFD700) horizontal gradient
- Below it: 「{単位（例: 円 / 月）}」in white medium weight, 28px
- Even smaller: 「{補足（例: 2ヶ月目に達成）}」in light gray, 18px

LEFT TEXT BLOCK (left 55%):
- Tag: 「{属性タグ（例: 文系大学生の実録）}」white rectangle badge with orange border, 16px text
- Main headline line 1: 「{主軸ツール名}×」ultra-bold white, 52px
- Main headline line 2: 「{対象プラットフォーム（例: クラウドワークス）}」ultra-bold white, 52px
- Subtitle: 「{商品タイプ（例: 完全ロードマップ）}」bold orange (#FF6B35), 38px
- Small print: 「{訴求文（例: プログラミング不要・非エンジニアが実際にやった全手順）}」light gray, 16px

MILESTONE PATH (bottom strip, full width):
- Horizontal road/timeline with 4 steps:
  STEP1「{ステップ1（例: 案件選定）}」→ STEP2「{ステップ2（例: 応募文）}」→ STEP3「{ステップ3（例: 受注）}」→ STEP4「{ステップ4（例: 納品）}」
  Each step in small white rectangle on dark gray strip
  Connecting arrows in orange

ACCENT: Thin orange horizontal rule below main headline
COLORS: #000000 base, #FF7A35 orange, #FFD700 gold, #FFFFFF text, #CCCCCC secondary text
ATMOSPHERE: Achievement-oriented, milestone roadmap feel, professional but accessible — a student who actually did this

=== AVOID ===
- Anime/game characters
- Realistic AI-generated face photos
- Gold embossed/beveled text effects
- Sparkle/firework effects
- Checkerboard/pattern gimmicks
- Laurel wreath badges
- Purple/cosmic themes (already used by competitors)
```

---

#### プロンプト選択ロジック（スキル内部で自動判定）

記事タイプと商品特性から以下のルールで選択:

1. 記事タイプが `jituroku` → **プロンプト 1（実録記事型）**
2. 記事タイプが `knowhow` かつタイトルに「教科書」「完全ガイド」「バイブル」を含む → **プロンプト 2（教科書型）**
3. 商品にテンプレ・GPTs・プロンプト集・設定ファイル等が同梱 → **プロンプト 3（ツールキット型）**
4. 価格 ¥7,980 以上 または タイトルに「完全ロードマップ」「完全公開」「全手順」を含む → **プロンプト 4（フラッグシップ型）**

複数条件に該当する場合は優先度 4 > 2 > 3 > 1 の順に選ぶ。

#### プレースホルダ置換ルール

上記プロンプト内の `{...}` は以下で置換:

- `{短縮タイトル}`: 記事タイトルから 15〜20 字以内に短縮
- `{実績フレーズ}`: 「文系大学生が 2 ヶ月でやったこと」「非エンジニアが Claude Code だけで」等
- `{ツール名}` `{×対象}`: 「Claude Code」「×クラウドワークス」等
- `{最大実績数字}`: 優太の場合は「14万」固定（または記事固有の数字）
- `{訴求点 1〜3}`: 商品の核心メリット 3 点を選定
- `{ステップ 1〜4}`: フラッグシップ商品の主要ステップ

#### NG リスト（全プロンプト共通の禁止要素）

生成前に以下を確認し、該当する指示が含まれていたら除去する:

**Brain 相場に溶け込みすぎる NG（差別化のため回避）:**
1. 金ピカグラデーションテキスト（リツト・ベクが使用済み）
2. AI 生成の宇宙 / 星雲背景（Antigravity 教科書で飽和）
3. 「豪華○大特典付き」バッジ（ほぼ全商品が使用）
4. 月桂樹バッジ（リツトの代名詞）
5. ネオン放射光線背景（メラメラくんの独占）

**優太ブランドを損なう NG（ターゲット感のため回避）:**
6. 過度な成人向け・同人誌感
7. アニメ美少女 / 美少年の AI 生成顔
8. 虹色絵本調
9. 本人の顔写真のみ（実績未確立段階では逆効果）
10. パチンコ・スロット的な点滅・爆発エフェクト

**技術的 NG（視認性・品質のため回避）:**
11. テキスト 8 行以上の詰め込み（一覧表示時に判読不能）
12. 5 色以上の文字色混在
13. 白背景に白縁テキスト（コントラスト不足）
14. 横長の英語テキストのみ

---

## Phase 7: Notion 記録

### 対象記事のレコードを更新

Notion「note記事管理」DB（data_source: `collection://812aa728-8d3e-42e4-a9cd-6a91c303b2c2`）の対象記事レコードに以下フィールドを更新する:

- `Brainステータス`: `草稿完成`
- `Brain 草稿パス`: `{brain/today/ の本文ファイル絶対パス}`
- `Brain 価格`: `¥{価格}`
- `Brain 還元率`: `{%}%`

**対象フィールドが存在しない場合:**
Notion DB に以下のフィールドを追加するようユーザーに案内する:

```
⚠️ Notion「note記事管理」DB に以下のフィールドが未作成です。追加してください:

1. Brainステータス (select) — 選択肢: 未作成 / 草稿完成 / 投稿済み
2. Brain 草稿パス (text)
3. Brain URL (url)
4. Brain 価格 (number)
5. Brain 還元率 (number)
6. Brain 公開日 (date)
7. Brain 売上 (number) — 月次で更新
```

---

## Phase 8: PDCA フィードバック（投稿後）

投稿後にユーザーに促す記録項目:

**投稿直後:**
- Brain URL
- 投稿日
- 最終的に設定した価格・還元率

**1 週間後:**
- 販売数
- Brain 内 PV
- レビュー・コメント

**1 ヶ月後:**
- 累計販売数
- 売上
- アフィリエイター経由の割合
- 学び（何が効いた・効かなかった）

これらは Notion の対象レコードに追記する。次回 /brain-run 実行時に Phase 1 の相場調査と併せて参照される（「前回 X 件売れたから今回は価格を上げよう」等の判断に使う）。

---

## エラーハンドリング

**対象 note 記事が見つからない:**
```
❌ Brain 化できる note 記事が見つかりません。

対処:
1. /note-run を実行して note 記事を作成する
2. または /brain-run {記事パス} で明示的に指定する
```

**記事タイプが速報の場合:**
```
⚠️ この記事は速報タイプです。
速報は鮮度依存のため Brain の長期販売と相性が悪い傾向があります。
それでも Brain 化しますか？ (y/n)
```

**Phase 5 の品質スコアが 60 点未満（2 回 rewrite 後も）:**
```
⚠️ 品質スコアが基準に達していません。
問題箇所: {スウィープで検出された項目}
ユーザーの判断を仰ぎます。
- そのまま保存して人手で修正
- 再度 rewrite を試行
- 対象記事を変えて再実行
```

---

## 完了後の案内

完了サマリーの表示のみ行う。追加のコメントは不要。
Brain 投稿完了後、ユーザーが Notion レコード更新 + Phase 8 の PDCA 記録を行う。
