# 出力スタイル定義

disler/claude-code-hooks-mastery の出力スタイルシステムを content-pipeline 向けに実装。
note-run / x-run に「出力モード」引数を追加するための定義ファイル。

---

## 出力モード一覧

### genui（デフォルト）

**用途:** noteエディタへの貼り付け用。完成稿として使う。

**特徴:**
- h2 / h3 / blockquote / hr を全て使用したリッチHTML
- noteエディタのMarkdown記法に準拠
- 画像差し込み位置をコメントで指示
- フォントサイズ・改行が実際の表示に近い状態で確認できる

**使用例:** `/note-run` （デフォルトなので引数不要）

---

### markdown

**用途:** 確認・編集がしやすいモード。HTML装飾なし。

**特徴:**
- Markdownのみ（HTMLタグ禁止）
- 構成・内容の確認に集中できる
- Google Docs / Obsidian などに貼り付けやすい
- noteに貼る前に内容を精査したい時に使う

**使用例:** `/note-run markdown`

---

### ultra-concise

**用途:** 時間がない時の最速確認モード。

**特徴:**
- 各フェーズの中間出力を省略（スキャン結果・構成案の詳細説明等）
- 最終稿のみ表示
- フェーズ間の説明文・コメントを全て削除
- 生成時間が最も短い

**使用例:** `/note-run ultra-concise`

---

### tts-summary

**用途:** 音声読み上げ（TTS）向けのテキスト生成。

**特徴:**
- 装飾なし（HTML・Markdown記法なし）
- 箇条書き禁止（全て文章で）
- 見出しは「◆」などのシンプルな区切りに置き換え
- 絵文字禁止
- 読み上げたとき自然に聞こえる文章構造
- URLは「リンク先を参照」などに置き換え

**使用例:** `/note-run tts-summary`

---

### review

**用途:** 品質改善・レビュー重視モード。

**特徴:**
- 各フェーズの出力に採点（A〜D評価）を付与
- 改善提案を箇条書きで詳細表示
- 声クローンチェックの詳細結果を表示
- SEOスコアの内訳（タイトル / 冒頭 / 見出し / タグ）を表示
- 最終稿の前に「修正すべき箇所リスト」を表示

**出力フォーマット（一部）:**
```
[タイトル評価: B]
✅ キーワード前半30字以内: OK
⚠️  数字なし: タイトルに数字を入れると CTR が上がる可能性
❌ 読者の悩み表現が薄い: 「〜できない人向け」等の表現を検討

[冒頭200字評価: C]
...
```

**使用例:** `/note-run review`

---

### draft-fast

**用途:** 速報記事・時間制約がある時の高速モード。

**特徴:**
- **競合調査フェーズを省略**（Phase 3 をスキップ）
- 構成テンプレートをそのまま使用（カスタマイズなし）
- 声クローンチェックを簡易版に短縮
- SEOチェックは必須項目のみ（タイトルのキーワード有無だけ確認）
- 通常比 50〜60% の時間で生成

**注意:** 競合との差別化が弱くなる。速報性が価値の記事向け。

**使用例:** `/note-run draft-fast`

---

## 出力モードの選び方

```
投稿する → genui（デフォルト）
まず確認したい → markdown
急いでいる → ultra-concise または draft-fast
品質を上げたい → review
音声コンテンツ化 → tts-summary
```

---

## SKILL.md frontmatter への追加方法

note-run または x-run の SKILL.md frontmatter に以下を追加することで出力モードを有効化する:

```yaml
---
name: note-run
# ... 既存の設定 ...
arguments:
  - name: output_style
    description: "出力スタイル。genui(デフォルト) / markdown / ultra-concise / tts-summary / review / draft-fast"
    required: false
    default: "genui"
---
```

スキル内での参照方法:
```
# 出力スタイルを確認
OUTPUT_STYLE="${output_style:-genui}"
# context/output-styles.md の対応するセクションを読んで出力形式を調整
```
