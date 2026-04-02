---
title: Auto Modeで副業タスクが詰まる問題を、hook1つで解決した話
type: knowhow
price: 0
tags: [ClaudeCode, 副業, AutoMode, hooks, 自動化, 大学生, AI副業, ClaudeCodehooks, PermissionDenied]
created: 2026-04-03
status: final
score: 23
---

Auto Modeで副業タスクを回してるときに、一番テンションが下がるのが「止まってる...」ってやつ。

講義後に戻ってみると、タスクが途中で固まってる。理由はたいていPermissionDenied。Bashで何かしようとしたときにAuto Modeのブロックに引っかかって、そこで完全に止まってる。

自分は副業でCW案件をAuto Modeに投げることが多い。Webアプリの修正とか、報告書の生成とか。そのたびに「戻ったら詰まってた」が起きてた。月に10回以上あって、確認して再実行するだけで月5時間くらい消えてた計算になる。

先週、v2.1.89（2026-04-01リリース）のchangelogを読んでいたら**PermissionDenied hook**というのが追加されてた。設定してみたら、詰まりが全部消えた。

---

## なぜsettings.jsonだけでは解決しなかったのか

最初はsettings.jsonの`allow`リストに許可したいコマンドを書いてみた。でも効かない操作がある。

Claude CodeのAuto Modeは、settings.jsonの許可リストとは別に「Auto Modeクラシファイア」というレイヤーがある。これが「怪しい」と判断した操作はsettings.jsonの設定に関係なくPermissionDeniedになる。

具体的にブロックされやすいのはこういう操作:

- プロジェクト外のパス（/tmp系）へのアクセス
- オプション付きのrmコマンド（`rm -rf`など）
- 環境変数の変更

これらはsettings.jsonに書いても、Auto Modeクラシファイアが「ちょっと待って」と言ってブロックする。だから詰まりが消えなかった。

## PermissionDenied hookとは

v2.1.89のchangelogにこう書いてあった:

> Added PermissionDenied hook — fires after auto mode classifier denials. Return {retry: true} to tell the model it can retry.

つまり「Auto Modeクラシファイアがブロックした直後に発火するhook」が追加された。そのhookから`retry: true`を返すと、モデルが「もう一度試せる」と認識して、別の方法で実行し直してくれる。

止まるたびに手動で再実行してたのが、hookで自動化できる。

## 設定方法（hook1つ追加するだけ）

プロジェクトの`.claude/settings.json`を開く。なければ新規作成する。

以下のhooksセクションを追加する:

```json
{
  "hooks": {
    "PermissionDenied": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "jq -n '{hookSpecificOutput:{hookEventName:\"PermissionDenied\",retry:true}}'"
          }
        ]
      }
    ]
  }
}
```

`matcher`を空文字列にすると全ツールのPermissionDeniedに反応する。Bashだけにしたいなら`"matcher": "Bash"`に変える。

hookの動作:
1. Auto Modeがブロック（「このコマンドはPermissionDenied」と判定）
2. PermissionDenied hookが発火（設定したコマンドが実行される）
3. retry: trueを返す（モデルが「再試行OK」と認識して別の方法で実行し直す）

これだけ。設定後2週間、タスクが途中で止まる回数がゼロになった。

## deferでタスクを「後回し」にする使い方も追加された

同じv2.1.89で**defer**というのも追加された。

`claude -p`（ヘッドレスモード）で動いてるセッションが、ツール実行の直前に一時停止できる機能。PreToolUse hookから`"permissionDecision": "defer"`を返すと、セッションがそこで一旦終了する。

`claude -p --resume <session-id>`で再開すると、hookが再評価されて続きを実行する。

自分がやってみたい使い方: 「このファイルを消していい？」みたいな操作を一旦保留にしておいて、Remote Control経由でスマホから確認してからOKを出す。承認が必要な操作だけを後回しにして、それ以外は走らせ続ける設計。

副業での需要でいうと、PermissionDenied hookの「自動リトライ」の方が即効性は高い。deferは「承認フローをカスタマイズしたい」人向けの応用機能だと思ってる。今後試してみる。

## Before/After

**設定前（月平均）:**
- PermissionDenied停止: 10回以上
- 確認＋再実行の合計時間: 約5時間
- 移動中に投げたタスクが帰宅までに終わってる確率: 60%くらい

**設定後（2週間）:**
- PermissionDenied停止: 0回
- 確認作業の時間: ほぼゼロ
- 移動中に投げたタスクが帰宅までに終わってる確率: 95%以上

数字で見るとシンプルで、hook設定1個で5時間分の作業時間が返ってきた。

## つまずいたこと2つ

### jqが入ってなかった

設定してみたら「hookが動いてるのに何も変わらない」状態になった。hookのコマンドで使ってる`jq`がインストールされていなかった。

macOSなら`brew install jq`、Windowsなら`winget install jqlang.jq`でインストールできる。これが入ってないとhookコマンドが失敗してサイレントにスルーされる。

### matcherをBashに絞ったら他のツールで止まった

最初は「BashのPermissionDeniedだけに反応すればいい」と思って`"matcher": "Bash"`にした。ところが、ReadやWriteツールでPermissionDeniedが出る場合もあって、そっちには反応しなかった。

自分の案件はBash操作がほとんどなので問題はなかったけど、全ツールをカバーしたいなら`"matcher": ""`（空文字列）にするのが安全。

## Auto Modeを本格運用するなら入れておきたい設定

v2.1.89以前は「詰まったら手動で再実行」しかなかった。これが実質的なAuto Modeの限界だった。

PermissionDenied hookが追加されたことで、「詰まりを自動で乗り越える」設定が公式にできるようになった。副業でAuto Modeを使ってる人には、settings.jsonへの追記1回でいいので試してみる価値はあると思う。

次はdeferを使った「承認フローのカスタマイズ」も試す予定。Remote Controlと組み合わせると面白そうなので、うまくいったらまた書く。

### あわせて読みたい
- [Claude Codeの承認地獄が終わった｜Auto Modeを即日試してみた](https://note.com/moyuchi_aistu/n/nf6421081b44b)
- [大学生がClaude Code Remote Controlを副業で1週間使ったら、移動時間も稼ぎになった話](https://note.com/moyuchi_aistu/n/n7805b1f0397d)
