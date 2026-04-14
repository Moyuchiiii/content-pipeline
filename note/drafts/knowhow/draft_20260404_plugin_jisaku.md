---
title: 副業ワークフローをClaude Codeプラグインに詰め込んだら、端末が変わっても5秒で再開できた話
type: knowhow
price: 500
tags: [ClaudeCode, 副業, 大学生, プラグイン, AI開発, 自動化, クラウドワークス]
created: 2026-04-04
status: final
score: 22
---

# 副業ワークフローをClaude Codeプラグインに詰め込んだら、端末が変わっても5秒で再開できた話

## 概要

Claude Code v2.1.91新機能（bin/ディレクトリ）を使い、副業ワークフローを自作プラグインに全パッケージ化した実録。
skills・hooks・bin/スクリプト・settings.jsonを1ディレクトリに詰め込み、どのPCでも/plugin install一発で設定完了（30分→10秒）。
昨日の公式プラグイン記事（週5h→2h）の続編。

## タグ

ClaudeCode / 副業 / 大学生 / プラグイン / AI開発 / 自動化 / クラウドワークス

## 記事本文（HTML版は draft_20260404_plugin_jisaku.html を参照）

## 構成

### 無料エリア
- 冒頭: PC買い替えのたびに設定を最初からやり直す痛み
- プラグインに詰め込めるもの（skills/hooks/bin/settings）
- 最低限の構造（plugin.json + SKILL.md + --plugin-dir テスト）

### 有料エリア（¥500）
- bin/ スクリプト（v2.1.91新機能）— cw-validate 完全コード
- hooks.json — ファイル保存後自動フォーマット
- 最終プラグイン構造（全ファイル）
- GitHubpush + 別PCへのインストール手順
- Before/After（新PC設定 30分→10秒）
- つまずきポイント3つ（chmod +x / name英数字のみ / /reload-plugins必須）

## Before/After

- 新PC設定時間: 30分 → git clone + /plugin install で10秒
- 月1台ペース × 12ヶ月 = 年間6時間削減

## つまずきポイント

1. bin/ のスクリプトに chmod +x が必要（忘れると command not found）
2. plugin.json の name は英数字・ハイフンのみ（日本語不可）
3. 変更後は /reload-plugins を叩く（自動反映されない）

## Notion記事レコード

URL: https://www.notion.so/3378795a75fd81a5b566dafb304b4fae
