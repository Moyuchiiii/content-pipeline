---
name: content
description: "[DEPRECATED] コンテキスト枯渇により品質低下のため非推奨。各スキルを個別に実行してください: /collect-stats → /note-run → /content-engine → /x-run"
user-invocable: false
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, WebSearch, WebFetch, mcp__claude-in-chrome__tabs_context_mcp, mcp__claude-in-chrome__tabs_create_mcp, mcp__claude-in-chrome__navigate, mcp__claude-in-chrome__get_page_text, mcp__claude-in-chrome__javascript_tool, mcp__claude-in-chrome__read_page, mcp__claude-in-chrome__form_input, mcp__claude-in-chrome__computer, mcp__claude-in-chrome__find, mcp__notion__notion-fetch, mcp__notion__notion-search, mcp__notion__notion-create-pages, mcp__notion__notion-update-page
---

> ⚠️ **DEPRECATED**: コンテキスト消費によって品質が低下することが確認されたため非推奨。
> 代わりに以下の順で個別実行してください:
> `/collect-stats` → `/note-run` → `/content-engine {ドラフトパス}` → `/x-run from-article {ツイートパス}`

# /content（非推奨）

全自動コンテンツパイプライン。1コマンドで今日の note 記事と X 投稿を完成させる。

## 使い方

```
/content                  # フル実行
/content --skip-collect   # データ収集スキップ（本日収集済みの場合）
/content sokuho           # 速報記事指定で実行
/content jituroku         # 実録記事指定で実行
/content knowhow          # ノウハウ記事指定で実行
```

---

## 実行フロー

途中で止まらず最後まで走り切る。各ステップの結果は内部で引き継ぐ。

---

## Step 1: データ収集（collect-stats）

`--skip-collect` が指定されている場合はスキップして Step 2 へ。

### 1-A: X Analytics

```
1. 新規タブで https://analytics.twitter.com/user/moyuchi_cc/tweets を開く
2. ログインユーザーが @moyuchi_cc であることを確認
3. get_page_text + javascript_tool で直近ツイートのデータを取得
4. context/x-performance.md を更新
5. content-memory.md のフック型集計を更新
```

失敗した場合: 「X Analytics: 取得失敗（最終TODOに記載）」と内部メモして Step 1-B へ進む。止まらない。

### 1-B: note ダッシュボード

```
1. https://note.com/moyuchi_aistu/stats を開く
2. get_page_text で全記事のPV・スキ・売上を取得
3. context/note-performance.md を更新
4. Notion「note記事管理」DB（collection://812aa728-8d3e-42e4-a9cd-6a91c303b2c2）を更新
```

失敗した場合: 「note stats: 取得失敗（最終TODOに記載）」と内部メモして Step 2 へ進む。止まらない。

---

## Step 2: 記事生成（note-run）

`/note-run` スキル（`.claude/skills/note-run/SKILL.md`）の全フェーズを実行する。

記事タイプの指定:
- 引数あり（`sokuho` / `jituroku` / `knowhow`）→ その記事タイプで固定
- 引数なし → note-run の Phase 2（スコアリング）で自動判定

完了したら以下を内部メモ:
```
note_draft_md:  {mdファイルの絶対パス}
note_draft_html: {htmlファイルの絶対パス}
note_title:     {記事タイトル}
note_price:     {0 or 500}
note_tags:      [{タグ一覧}]
note_type:      {sokuho/jituroku/knowhow}
```

---

## Step 3: X コンテンツ生成（content-engine）

`.claude/skills/content-engine/SKILL.md` を参照して実行。

入力: Step 2 で生成した `note_draft_md` のパス

実行内容:
- アトミックアイデア 3〜7 個抽出
- Xスレッド（5〜8ツイート）生成
- 単発ツイート 1〜2 本生成
- `x/drafts/threads/` または `x/drafts/singles/` に保存

完了したら以下を内部メモ:
```
x_thread_path:  {スレッドドラフトパス（あれば）}
x_single_path:  {単発ツイートドラフトパス（あれば）}
```

---

## Step 4: X 予約投稿セット（x-run）

`.claude/skills/x-run/SKILL.md` の投稿フロー（Phase B-1〜B-2）を実行。

```
1. 新規タブで x.com を開く
2. @moyuchi_cc でログインしていることを確認（違う場合は即停止して最終TODOに記載）
3. x.com/compose/post を開く
4. スレッドの場合: ツイート1 → リプライで続きを繋ぐ
5. 📅 スケジュールアイコンをクリック → 推奨日時をセット
6. ← ここで停止せず、セットした状態を保持してStep 5へ
```

推奨投稿時間（note-run の Phase 8 で算出した値を使う）:
- 速報: 当日の朝7〜8時
- 実録・ノウハウ: 翌火〜木の20〜21時

完了したら以下を内部メモ:
```
x_scheduled_time: {YYYY-MM-DD HH:MM}
x_tab_open: true  ← スケジュールセット済みタブが開いたまま
```

---

## Step 5: 最終TODO出力（ユーザー操作まとめ）

全ステップ完了後、以下のフォーマットで出力する。これが唯一のユーザーへの出力。

```
━━━━━━━━━━━━━━━━━━━━━━━━━
✅ /content パイプライン完了
━━━━━━━━━━━━━━━━━━━━━━━━━

📝 今日のTODO（ユーザー操作が必要なもの）

【1】note 投稿
  タイトル : {note_title}
  価格     : {無料 or ¥500}
  タグ     : {note_tags}
  手順:
    1. note.com/notes/new を開く
    2. タイトルを入力
    3. 以下のファイルをペースト → {note_draft_html}
    4. サムネイル画像をアップロード
    5. 「投稿する」を押す
    6. URLを /x-run done {notion_id} {note_url} で報告

【2】X 予約投稿の確定
  投稿予定 : {x_scheduled_time}
  開いているタブの「スケジュール」ボタンを押して確定してください。
  ※ スレッドの場合は全ツイートが繋がっていることを確認してから押す

━━━━━━━━━━━━━━━━━━━━━━━━━
📊 今回のパイプライン結果

記事タイプ : {note_type}
記事スコア : {Phase2スコア} 点
品質スコア : {品質ゲートスコア} / 100
Xツイート数: {スレッド/単発 N本}

━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 要確認（失敗・スキップした項目）

{失敗した項目があれば記載。なければこのセクションを省略}
例: X Analytics の取得に失敗しました。手動で x-performance.md を更新してください。
━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## エラー方針

- **止まらない**: 各ステップが失敗しても次のステップに進む
- **失敗は最後にまとめて報告**: ⚠️セクションに記載
- **唯一の例外**: X の投稿アカウントが @moyuchi_cc でない場合のみ即停止してユーザーに報告
