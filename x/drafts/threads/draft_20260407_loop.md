---
type: thread
source_article: D:/Claude/note-pipeline/drafts/knowhow/draft_20260322_claude_code_loop.md
source_notion_id: 32a8795a75fd8176ac80f0fbf210983a
created: 2026-03-26
status: draft
note_url: https://note.com/moyuchi_aistu/n/n62d37bf48e7b
scheduled: 2026-04-07 20:00
---

# ツイート草稿

## ツイート1（フック）

Claude Codeの /loop を使い始めてから
副業の「手を動かしてない時間」がほぼゼロになった

↓

## ツイート2

/loop ってなに？

Claude Codeに「/loop 10m 〇〇して」と打つと、10分ごとに自動実行してくれる機能

cronみたいなものがClaude Codeの中で動く。セッションが開いてる間だけ動く

## ツイート3

使い方1: 新着案件の自動スキャン

/loop 30m クラウドワークスで「Python 自動化」の新着案件をチェック。単価5万以上なら報告して

30分ごとに勝手にチェックしてくれる

Before: 1日3回×15分 = 45分
After: 通知を見るだけ（5分）

## ツイート4

使い方2: 納品前テストの定期実行

/loop 15m python test_main.py を実行して。FAILがあれば修正案も出して

寝る前にセットしておくと、朝には「全部PASS」か「ここ直して」が届いてる

これが一番助かってる

## ツイート5

使い方3: 作業ログの自動生成

/loop 1h git logとファイルの変更差分を確認して、「何をやったか」「なぜやったか」「次にやること」の3点でwork_log.mdに追記して

クライアントへの報告書がほぼ自動で完成する

Before: 作業後に報告書作成30分
After: 自動ログを確認して送るだけ（5分）

## ツイート6（まとめ + note誘導）

注意: セッションを閉じると止まる。「24時間365日回したい」ならGitHub Actionsを使うべき

ただし「作業中にバックグラウンドで確認系タスクを回す」用途には最適

コマンドサンプルを全部まとめてnoteに書いた

https://note.com/moyuchi_aistu/n/n62d37bf48e7b

#ClaudeCode

---

## 投稿メモ
- 推奨投稿時間: 2026-04-07（火）20:00
- 理由: ノウハウスレッドはゴールデンタイム火曜夜が最も保存率が高い
- 画像: /loop 実行中のターミナル画面スクショがあれば添付推奨
- ハッシュタグ: 最後のツイートのみ #ClaudeCode
- note URL: https://note.com/moyuchi_aistu/n/n62d37bf48e7b（公開済み）
