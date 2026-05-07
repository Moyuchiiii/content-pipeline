---
name: hub-update
description: note ハブページ（「わたしについて + 全記事一覧 + メイン商品/Brain CTA」）を生成して、月1回 or 新記事5本ごとに更新する。X→note→Brain の内部循環の起点として機能。
user-invocable: true
allowed-tools: Read, Write, Edit, Bash, mcp__notion__notion-fetch
---

# /hub-update

note の **ハブページ**（プロフィール固定・全記事入口）を生成する。

[エージェント調査済 sasaki-search レポート 2026-05-07] 業界ベストプラクティス: 「全記事の入口 + 3本導線」が note → 有料記事 → Brain の流入率を 2-3倍化する。フォロワー数が少ない段階ほど効果的（検索流入をハブで受け止めて回遊させる）。

## 起動

```
/hub-update           # 全記事一覧を最新化（速報/実録/ノウハウのカテゴリ別）
/hub-update preview   # HTML出力のみ・noteへの貼り付けはユーザーが手動
```

## Phase 1: 入力データ取得

並列で以下を読む:

1. `context/published-history.md`（直近30日 + 月次アーカイブ）
2. `context/persona-hyui.md`（自己紹介テキスト用・「2. 副業歴・収益推移」セクション必須）
3. Notion 記事管理DB（`collection://812aa728-8d3e-42e4-a9cd-6a91c303b2c2`）から noteURL 入りレコード全件取得
4. メイン商品 / Brain 3本のURL確認（[Read済 published-history.md]）:
   - メイン商品: https://note.com/moyuchi_aistu/n/na548ac967740
   - Brain 1本目（4/22 Claude Design 実戦メモ）: 要 published-history.md 確認
   - Brain 2本目（4/27 CW 3ジャンル受注実録）: https://brain-market.com/u/moyuchi/a/b1QTM2QjMgoTZsNWa0JXY
   - Brain 3本目（4/28 メイン商品Brain版）: https://brain-market.com/u/moyuchi/a/b0YDN2QjMgoTZsNWa0JXY

## Phase 2: HTML 生成

以下のテンプレに沿って構築する。

```html
<hr>
<p style="text-align: center;"><b>はじめての方は、ここから読むのが一番伝わるはず</b></p>
<hr>

<h2>わたしについて</h2>

<p>{persona-hyui.md の自己紹介テキストを150-200字に整形}</p>

<p><b>副業4ヶ月の月収推移（事実・盛らない）</b></p>
<blockquote>
<p>2026-02 ¥55,000（業務自動化スクリプト・副業デビュー月）<br>
2026-03 ¥140,000（WebアプリUIへジャンル移動・メイン商品の核）<br>
2026-04 ¥100,000（3ジャンル並行・Brain 3本投稿）</p>
</blockquote>

<h2>まず読んでほしい3本（コアCTA）</h2>

<p><b>1. 月14万到達の全記録（メイン商品 ¥2,000）</b></p>
<p>大学生がClaude Codeで副業2ヶ月やってみたら、月14万になった話</p>
<p>https://note.com/moyuchi_aistu/n/na548ac967740</p>

<p><b>2. AI使ってなぜか稼げない人と、月14万になったわたしの違い</b></p>
<p>{該当URL}</p>

<p><b>3. 副業ゼロから月14万到達した5つの挫折パターン</b></p>
<p>{該当URL}</p>

<h2>速報記事（最新のClaude/AIニュースを副業視点で）</h2>

<ul>
{速報タイプの最新5本・published-history.md から自動取得・新しい順}
</ul>

<h2>実録記事（やってみた・失敗・成果）</h2>

<ul>
{実録タイプの最新5本・新しい順}
</ul>

<h2>ノウハウ記事（再現できる手順）</h2>

<ul>
{ノウハウタイプの最新5本・新しい順}
</ul>

<h2>Brain（高単価コンテンツ）</h2>

<p>note では書ききれなかった「コード全文・プロンプト全文・テンプレ込みの完成版」です。</p>

<p><b>Brain 1本目: Claude Design 実戦メモ ¥2,980</b></p>
<p>{Brain 1本目URL}</p>

<p><b>Brain 2本目: Claude Code × CW 3ジャンル受注実録 ¥2,980</b></p>
<p>https://brain-market.com/u/moyuchi/a/b1QTM2QjMgoTZsNWa0JXY</p>

<p><b>Brain 3本目: 副業立ち上げ実録（メイン商品Brain版）¥3,980</b></p>
<p>https://brain-market.com/u/moyuchi/a/b0YDN2QjMgoTZsNWa0JXY</p>

<hr>

<p style="text-align: center;"><b>X / Threads でも毎日発信中</b></p>
<p style="text-align: center;">X: <a href="https://x.com/hyui_cc">@hyui_cc</a> / Threads: <a href="https://www.threads.net/@hyui__cc">@hyui__cc</a></p>
```

## Phase 3: 保存

ファイル: `today/hub/hub_{YYYY-MM-DD}.html` + `today/hub/hub_{YYYY-MM-DD}.md`

MD版にはURL一覧（コピペ用）を併記。

## Phase 4: ユーザー操作（手動）

note のプロフィール固定ノートを編集して、生成HTMLを貼り付け。固定の方法:
1. note でプロフィール画面を開く
2. 「クリエイターページの設定」→ 固定したいノートを選択
3. 該当ノートを編集して、生成HTMLをペースト

## 推奨実行頻度

- **月1回 or 新規記事5本投稿後**
- 「速報・実録・ノウハウ」の最新5本リストが古くなったら更新
- 月初の `/source-run plan` 起動時にハブページの最終更新日が30日以上経過していたら自動リマインドを Phase 5 報告で出す（将来的拡張）

## 戦略的根拠

[WebFetch済 note.com/kasu_report/n/n558f154f569d] note が伸びない理由のトップ要因が「導線設計」。記事末尾の3本導線 + ハブページの組み合わせで回遊率 2-3 倍改善実例あり。

[エージェント調査済 sasaki-search 2026-05-07] フォロワー数 < 100 段階の hyui のような立ち位置では、検索経由の流入をハブページで受け止めることが note → 有料記事 → Brain への流入導線として最も重要。

## 関連ファイル

- `context/note-strategy.md`「フォロワー段階別 戦略マトリクス」
- `search/2026-05-07/sns-marketing-research.md`
- `context/published-history.md`（記事リスト元データ）

---

## 関連: X プロフィール固定リンクへの Brain アフィリ紐付け（2026-05-07 追加）

[エージェント調査済 sasaki-search] 既存 Brain 3本のアフィリ拡散基盤として、X プロフィール固定リンクに3本紐付けることが業界ベストプラクティス。

### X プロフィール固定リンク 推奨レイアウト

X プロフィールの固定ツイート（または `link.tree` 系の集約ページ）に、以下を1スレッドで紐付け:

```
🎓 はじめまして、文系大学生 hyui です。
副業ゼロ→2ヶ月で月14万。AI×副業の全記録を発信中。

📝 メイン記事（月14万到達の全記録 / ¥2,000・〜5/14は¥1,480）
https://note.com/moyuchi_aistu/n/na548ac967740

📦 Brain 1本目: Claude Design 実戦メモ（¥2,980 / 還元50%）
{Brain 1本目URL}

📦 Brain 2本目: CW 3ジャンル受注実録（¥2,980 / 還元40%）
https://brain-market.com/u/moyuchi/a/b1QTM2QjMgoTZsNWa0JXY

📦 Brain 3本目: 副業立ち上げ実録 14日カリキュラム（¥3,980 / 還元50%）
https://brain-market.com/u/moyuchi/a/b0YDN2QjMgoTZsNWa0JXY

📚 全記事ハブ:
{ハブページの note URL（/hub-update で生成したページの URL）}
```

### 設置タイミング

- /hub-update でハブページを生成した直後（同時に X プロフィール固定ツイートも更新）
- Brain 新規投稿時（4本目以降が出たら追加）
- メイン商品の価格改定時（¥2,000 → ¥1,480 セール等）

### 設置後の効果

- Brain 既存3本のアフィリ収益が note → X 経由で発生する確率が上がる
- 紹介還元率 40〜50% が機能する基盤（フォロワー数より露出数が重要）
- メイン商品 + Brain の合計 LTV を最大化

詳細: `search/2026-05-07/sns-marketing-research.md` 論点5「メイン商品¥2,000級の販売構造」/ `context/note-strategy.md`「フォロワー段階別 戦略マトリクス」
