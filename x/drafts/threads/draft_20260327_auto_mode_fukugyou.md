---
type: thread
source_article: note/drafts/knowhow/draft_20260327_auto_mode_fukugyou.md
source_notion_id: 32f8795a-75fd-81bf-8ded-dfe7b33606a5
created: 2026-03-27
status: draft
note_url: https://note.com/moyuchi_aistu/n/n2057c13b0cfb
hook_type: Before/After型（型6）
---

# ツイート草稿

## ツイート1（フック）
副業中の承認ポップアップ、1案件あたり30分かかってた。

Auto Mode使ったら5分になった。

月3〜4件こなすと月4〜5時間の差になる。今日はこの話をする。（スレッド）

## ツイート2
Auto Modeは「全部承認」でも「全スキップ」でもない第3のモード。

AI分類器が操作ごとにリスク判定して、安全な操作は自動実行、危険な操作（rm -rfとか）はブロックしてくれる。

承認地獄を解消しながら安全も保てる、ちょうどいい中間点。

## ツイート3
副業で使う前に整理すること：

任せていい操作 → ファイル読み込み、コード編集、テスト実行、ドキュメント更新

自分が確認する操作 → 外部APIリクエスト、大量削除、.envへのアクセス

この区別を最初にしておくと、どこまで放置できるかがはっきりする。

## ツイート4
分類器は完璧じゃないので、settings.jsonにdeny rulesを追加して二重の安全網を作る。

ブロックしておくと安心なやつ：
- rm -rf系の操作
- curlでの外部リクエスト
- WebFetch
- .envファイルへのアクセス

これで「見逃した危険操作」を止めてくれる。

## ツイート5
もう一個だけ。セッション前に必ずこれをやる。

git add . && git commit -m "before auto-mode session"

Auto Modeで一気に進むので気づいたらコードが大量変更されてる。セッション前のcommitを習慣にするだけで万が一のときに戻れる。

## ツイート6（まとめ + 誘導）
まとめ：

① セッション前にgit commit
② deny rulesで二重の安全網
③ CLAUDE.mdで「外部APIはdry runから」と明示
④ 任せるタスク/確認するタスクを整理

タスク別のワークフロー設計3パターンとCLAUDE.mdテンプレートをnoteに書いた。

#ClaudeCode #副業

## リプライ（URL・本文には入れない）
https://note.com/moyuchi_aistu/n/n2057c13b0cfb
（有料500円・Auto Mode副業活用ノウハウ）

## 投稿メモ
- 推奨投稿時間: 火〜木 20:00〜21:00
- ハッシュタグ: #ClaudeCode #副業（最終ツイートのみ）
- note URL: リプライに置く（本文直埋め禁止）
- 画像: ノウハウ系のビジュアルカード推奨
