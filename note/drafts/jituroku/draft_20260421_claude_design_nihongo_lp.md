---
title: 大学生がClaude Designで日本語LP作ってみたら、5箇所が壊れてた話
type: jituroku
price: 500
tags: [ClaudeDesign, 大学生, 副業, AI副業, LP制作, 非エンジニア, 日本語ウェブ]
created: 2026-04-21
status: final
score: 28
---

HTML 版を参照: `draft_20260421_claude_design_nihongo_lp.html`

## 概要

- Claude Design（2026-04-17リリース・Opus 4.7ベース）で日本語LPを作ろうとすると、デフォルトの英語向けCSS（text-wrap: pretty）が原因で5パターンの文字崩壊が起きる
- 6行の日本語禁則処理CSSをプロンプトに含めるだけで全部直る
- 題材はAizaCX（架空のAIコンタクトセンターSaaS）LP。47KBのstandalone HTMLで完成
- 副業ポートフォリオとしてCW・ココナラの応募で「作れます」を実物で示すための武器

## 構成

無料ゾーン（〜原因特定まで・約30%）:
1. 冒頭アイランド問いかけ
2. 何を作ろうとしたか（ポートフォリオ目的）
3. 一発目の出力は、ぱっと見かっこよかった
4. 壊れた5パターン（1文字改行・英数字途中改行・ボタン改行・バッジ重なり・句読点行頭）
5. 1週間詰まった話
6. 原因にたどり着いた（text-wrap: pretty が英語前提）

有料ゾーン（¥500・約70%）:
7. コピペで直る、日本語LPの呪文（6行CSS全文）
8. 日本語LP生成プロンプトテンプレ
9. 【中盤CTA：メイン商品¥2,000】
10. 完成したAizaCXのスペック
11. 修正指示プロンプト3本
12. つまずいた3点（.zip版7MB・Firefoxフォールバック・バッジpadding）
13. 副業でどう使うか（ポートフォリオ・提案資料叩き台）
14. まとめ
15. 【末尾CTA：メイン商品¥2,000】
16. あわせて読みたい

## 品質スコア

- Phase 2: 28/30（基本26 + PDCA加算2）
- Phase 6: 95/100（コンテンツ27・SEO 24・読者体験19・voice 15・リスク10）

## 事実確認（Phase 6 Step 0）

- Claude Design リリース 2026-04-17 / Opus 4.7ベース → 既存リサーチ（context/research-protocol + D:\Claude\bussines\search\claude-design-prompt-best-practice\2026-04-19\00-summary.md）経由で公式ソース確認済み
- Export as standalone HTML ボタン名 → 公式ヘルプ（support.claude.com/en/articles/14604416-get-started-with-claude-design）で実在を確認
- CSSプロパティ挙動（word-break: auto-phrase / text-wrap: pretty / line-break: strict / @supports フォールバック）→ 既存リサーチで確認済み
- AizaCX ファイルサイズ 47KB / bundle版 7MB → 実ファイル（D:\Claude\bussines\deliverables\claude-design-portfolio\aizacx-lp\index.html = 47,467 bytes、index-v2-bundled.html = 7,422,656 bytes）で実測確認

### 修正履歴

- 「Bundled version」→「Download as .zip」に修正（公式ボタン名確認結果）
- 「商用利用OK」の断言を削除（公式ヘルプに明記なし・利用規約確認の注意書きに変更）
- 「1本3〜10万円」→「数万円〜」に緩和（出典弱い）
- 「スカウトの来方が変わった」削除（ユーザー確認でCW/ココナラLP納品実績なしと判明）
