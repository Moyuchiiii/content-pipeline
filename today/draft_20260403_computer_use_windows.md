---
title: ClaudeにWindowsを操作させてみたら、副業の手動作業がなくなった話
type: sokuho
price: 500
tags: [ClaudeCode, Claude, 副業, 大学生, AI, ComputerUse, Windows, 自動化, クラウドワークス, Anthropic]
created: 2026-04-03
status: final
score: 21
---

# ClaudeにWindowsを操作させてみたら、副業の手動作業がなくなった話

3月24日にMac版が出て、Windowsユーザーの自分は10日間ひたすら待ってた。

今日4月3日、ついに来た。ClaudeのComputer Use、Windows版。

「Claudeがパソコンを動かす」っていう機能。ブラウザを開いて、ファイルをクリックして、キーボードを打って—そういうPC上の操作を全部Claudeに任せられるやつ。Mac版が出たとき記事7・11で紹介しながら、内心「早くWindowsにも来てくれ」とずっと思ってた。

今日やっとスタートラインに並べた。

## 設定がゼロだった

Claude CoworkのWindowsアプリを開いたら、設定画面に「コンピュータ制御を許可する」のトグルがあった。それをオンにするだけ。終わり。

APIキーも、Dockerも、ターミナルも不要。30秒で使える状態になった。Mac版が出た時点では「Windowsはどうせ複雑な設定がいる」と覚悟してたので、拍子抜けした。

> **Windows版の使用条件**
> Claude Pro または Max プラン（月20ドル〜）
> Claude Coworkデスクトップアプリ（最新版）
> Windows 11（Homeエディションは非対応との報告あり、要公式確認）
> 現在 Research Preview 扱い

## 今日試した2つの副業タスク

### CW新着案件チェック

「クラウドワークスを開いて、今日の新着案件のなかからWebアプリUI開発の案件を探してリストにして」と頼んだ。

Claudeがブラウザを立ち上げてCWにアクセスして、カテゴリを絞り込んで、4件をMarkdownリストで返してくれた。自分でやると15〜20分かかる作業が6分で終わった。Mac版のときと同じ体験がWindowsでも動いた。これだけで「10日間待った甲斐があった」と思った。

### Excelレポートへの入力

先月分の納品実績をExcelのフォーマットに入力する作業をやってもらった。ここで気づいたのが、WindowsではネイティブのExcel for Windowsをそのまま操作してくれること。Macだと Numbers やブラウザ版になりがちなところを、.xlsxファイルをそのまま開いて入力してくれた。

30分くらいかかってた入力作業が8分になった。

---（有料ライン）---

## deny rulesはWindowsパスで書く

（有料コンテンツ省略）

## Claude CodeのPowerShell対応との組み合わせ

（有料コンテンツ省略）

## 動かなかった2パターン

（有料コンテンツ省略）
