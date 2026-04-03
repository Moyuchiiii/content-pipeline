---
title: Claude Code Desktopを副業で使い倒したら、PR待ち時間が週3時間→0になった話
type: knowhow
price: 0
tags: [ClaudeCode, 副業, プログラミング, フリーランス, 自動化, AI開発, Claude, GitHub]
created: 2026-04-03
status: final
score: 21
---

# Claude Code Desktopを副業で使い倒したら、PR待ち時間が週3時間→0になった話

---
**問いかけ:** 副業の案件、PR待ちの間ずっと手が空いていませんか？

---

CWで2〜3本の案件を並行してるとき、こういう状況よくあった。

案件Aのコードを書き終えてPRを出す。CI待ち。この間、案件Bに集中したいのに「CIどうなったかな」が頭をちらついて集中できない。あるいは単純に、CI失敗してたのに30分後まで気づかなくて無駄に時間が経つ。

週で合計すると、PR待ち・確認・CI再実行みたいな作業で3時間くらい飛んでた。

Claude Code Desktopに本格的に切り替えてから1ヶ月。今は「PR待ち時間」という概念がほぼなくなった。

## Claude Code Desktopって何が違うの

最初に言っておくと、Claude Code DesktopはターミナルのClaude Codeと中身は同じ。デスクトップアプリのUIから操作できることと、それに付随していくつかの追加機能がある点が違う。

副業で使い始めて「これは使える」と感じた機能が4つある。

- **Server Preview**: devサーバーをデスクトップ内で自動起動して、ClaudeがUIを見ながらコーディングする
- **Visual Diff Review**: プッシュ前に「Review code」ボタンを押すだけでClaudeがコードをチェック
- **PR Monitoring**: PRを出した後、ClaudeがバックグラウンドでCI結果を監視して、失敗したら自動修正
- **Parallel Sessions**: 複数のセッションを独立して走らせられる。Gitのworktreeが自動で切られる

## 副業ワークフローがどう変わったか

### PRを出したら別案件に全集中できるようになった

いちばん効いたのはPR Monitoring。PRを出した後にセッション上にCIステータスバーが出てくる仕組みで、「Auto-fix」をONにしておくと、CIが失敗したときにClaudeが自動でエラーを読んで修正を試みてくれる。

自分は今のところAuto-fixだけ使って、Auto-mergeは手動にしてる。最終確認だけは自分でやりたいので。

CIが走ってる間に別のセッションに切り替えて案件Bを進める。案件AのCIが通ったらデスクトップ通知が来る。

### デザインの実装確認でブラウザを切り替えなくなった

今はデスクトップのPreviewパネルにブラウザが埋め込まれてて、ClaudeがUIを見ながら「ここレイアウト崩れてる」を自分で気づいて直してくれる。

「Auto-verify」がデフォルトでONになってて、Claudeがファイルを編集するたびに自動でPreviewを確認してくれる。

### プッシュ前のコードチェックが5分で終わる

「Review code」ボタンでClaudeが変更全体をレビューして、問題のある行にインラインでコメントを入れてくれる。コンパイルエラー、ロジックのバグ、セキュリティ問題に絞られてる。スタイルとかフォーマットは指摘しない。

### 3案件を同時に進める構成

- セッションA: メインの作業案件。コードを書いてPRを出す
- セッションB: 別の案件。セッションAのCI待ち中に進める
- セッションC: 定型化できたタスクをAuto Modeで流しっぱなし

## 使い始めてつまずいたこと

### PR MonitoringはGitHub CLIが必要

最初、PR Monitoringを使おうとしたら動かなかった。`brew install gh && gh auth login`してから再試行したら動いた。Windowsは`winget install --id GitHub.cli`で入る。

### Parallel SessionsはGitなしプロジェクトで使えない

GitリポジトリじゃないフォルダでParallel Sessionsを試したら、worktreeが使えずセッション間でファイルが干渉した。`git init`してから使うといい。

## 1ヶ月使ってみた結果

**PR待ち時間 週3時間 → 0**
同時進行案件数 1〜2本 → 3本

以前は「複数案件の同時進行は自分には無理」と思ってたんだけど、Parallel Sessions + PR Monitoringで3案件が同時に動くようになった。

セットアップは10分以内で終わる。claude.comからDesktopアプリをダウンロードして、GitHub CLIを入れて`gh auth login`するだけ。

---
Auto Modeをもっと深く使いこなしたい人はこっち:
▶ 副業の"承認待ち"が1案件あたり30分→5分になった話｜Claude Code Auto Mode 導入記（¥500）
https://note.com/moyuchi_aistu/n/n630fe460066a

### あわせて読みたい
- 大学生がClaude Code Remote Controlを副業で1週間使ったら、移動時間も稼ぎになった話
  https://note.com/moyuchi_aistu/n/n7805b1f0397d
- 大学生がClaude Codeでクラウドワークス案件を受注→納品してみた全記録
  https://note.com/moyuchi_aistu/n/nb99fc24e5eaa
