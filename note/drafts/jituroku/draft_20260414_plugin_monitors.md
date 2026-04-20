---
title: 自作プラグインに監視を埋め込んだら、副業タスクの取りこぼしが週2回→0になった話
type: jituroku
price: 0
tags: [ClaudeCode, プラグイン, 副業, 大学生, 自動化]
created: 2026-04-14
status: final
score: 23
---

# 自作プラグインに監視を埋め込んだら、副業タスクの取りこぼしが週2回→0になった話

本文はHTMLファイル参照: draft_20260414_plugin_monitors.html

## 要点

- Claude Code v2.1.105（2026-04-13リリース）のプラグイン `monitors` manifest機能を副業ワークフローに導入した実録
- 自作プラグイン（記事26の続編）に `monitors/monitors.json` を追加し、セッション開始時とスキル呼び出し時の2トリガーを使い分け
- CI監視・devサーバー監視・PRレビュー監視の3種類を組み込み
- Before/After: Monitor起動忘れ週2回→0回、CI失敗気づく速度 最短30分→最長1分以内
- つまずき2パターン: session_start過剰配置で起動遅延、`${CLAUDE_PLUGIN_DATA}`と`${CLAUDE_PLUGIN_ROOT}`の混同

## 差別化

- note.com競合ゼロ（v2.1.105リリース翌日・monitors manifestの副業実録記事は初）
- 記事26（プラグイン自作 ¥500）・記事29（Monitorツール ¥500）の自然な続編として有料CTA動線確保
- 実体験ベースの失敗談2パターンが初心者の安心感になる
