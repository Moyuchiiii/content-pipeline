---
title: Xスレッド草稿 — hooks_permissiondenied
type: x-thread
price: 0
tags: [ClaudeCode, 副業, AutoMode, hooks]
created: 2026-04-03
status: draft
---

# Xスレッド草稿 — hooks_permissiondenied（2026-04-03）

## スレッド（5ツイート）

---

【1/5】
Auto ModeでCW案件タスクを投げるたびに、戻ったら止まってた。

毎回PermissionDenied。月10回以上あって、確認して再実行するだけで月5時間くらい消えてた。

v2.1.89のPermissionDenied hookを設定したら、2週間でゼロになった。

---

【2/5】
そもそもなんで止まるかっていうと

settings.jsonのallowリストとは別に「Auto Modeクラシファイア」っていうレイヤーがある。

これが怪しいと思った操作（/tmp系へのアクセス、rm -rfのオプション等）はsettings.json関係なくブロックする。

だから「settings.json書いたのに止まる」が起きる。

---

【3/5】
v2.1.89で追加されたPermissionDenied hook、要は

「Auto Modeクラシファイアがブロックした直後に発火するhook」

そこからretry: trueを返すと、モデルが「再試行OK」と認識して別の方法で実行し直してくれる。

設定はsettings.jsonに10行追加するだけ。

---

【4/5】
同じv2.1.89でdeferも追加された

claude -pで動いてるヘッドレスセッションを「ツール実行直前」で一時停止できる機能。

--resume <session-id>で再開すると続きを実行する。

Remote Controlと組み合わせると「スマホで確認してから続行」もできそう。まだ試し中。

---

【5/5】
Auto ModeのPermissionDenied詰まり、hook1つで完全に消えた。

設定内容はnoteに書いた（リプライにURL）。
jqのインストールが必要なのと、matcherを絞りすぎると他ツールに効かない点だけ注意。

---

## 単発ツイート版

Auto ModeでPermissionDeniedが出るたびに副業タスクが止まってた。

v2.1.89のPermissionDenied hookをsettings.jsonに設定したら2週間で停止ゼロになった。月5時間の確認作業がまるごと消えた。

設定方法と詰まりポイントをnoteに書いた（リプライ）

---

## 💬 引用ツイート候補

1. 「settings.json書いたのに止まる、の原因はAuto Modeクラシファイアという別レイヤーだった」
2. 「月10回以上の停止→0回。hook1つで5時間分の作業時間が返ってきた」
3. 「止まるたびに手動で再実行してたのが、hookで全部自動化できた」

---

## note記事告知文（140字以内）

Auto Modeで副業タスクが詰まり続けてた。v2.1.89のPermissionDenied hookを設定したら月5時間の確認作業が消えた。settings.jsonだけでは解決しない理由と設定方法を書いた
