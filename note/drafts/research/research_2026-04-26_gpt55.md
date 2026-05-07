# GPT-5.5 リサーチ結果

**実施日**: 2026-04-26
**記事タイプ**: 速報
**角度**: Claude月14万依存の文系副業者がGPT-5.5に乗り換えるか、5項目で比較

---

## 検証済みファクト [WebSearch済]

### リリース情報
- **リリース日**: 2026年4月23日 [WebSearch済・複数ソース一致: TechCrunch/CNBC/Fortune/Axios]
- **コードネーム**: "Spud" [WebSearch済: axios.com/2026/04/23/openai-releases-spud-gpt-model]
- **API展開**: 2026年4月24〜25日にAPI（Responses/Chat Completions）公開 [WebSearch済: apidog.com]
- **前モデルからの間隔**: GPT-5.4から約6週間後 [WebSearch済: Fortune, TechCrunch]
- **位置づけ**: GPT-4.5以来初の完全再トレーニングベースモデル [WebSearch済: thenextweb.com]

### 機能・性能 [WebSearch済]
- エージェントコーディング強化（Terminal-Bench 2.0: 82.7%）[WebSearch済: llm-stats.com]
- SWE-bench Pro: 58.6% [WebSearch済: llm-stats.com]
- 幻覚率: 前世代比60%削減 [WebSearch済: apidog.com]
- コンテキストウィンドウ: 100万トークン [WebSearch済: apidog.com]
- トークン効率: 同等タスクで72%少ないトークン消費 [WebSearch済: llm-stats.com]
- 早期テスターが「週最大10時間削減」と報告 [WebSearch済: TechCrunch/OpenAI公式発表]

### 3バリアント [WebSearch済: apidog.com]
1. GPT-5.5 Standard（デフォルト・トークン効率重視）
2. GPT-5.5 Thinking（拡張推論・週3,000メッセージ上限）
3. GPT-5.5 Pro（最高精度・Pro/Business/Enterpriseのみ）

### 対応プラン [WebSearch済: TechCrunch, apidog.com]
- ChatGPT: Plus・Pro・Business・Enterpriseで利用可能
- GPT-5.5 Pro: Pro・Business・Enterpriseのみ
- API: 4/24〜4/25から利用可能（Responses API / Chat Completions API）
- Codex: 全プランで限定期間トライアル可能

### 価格 [WebSearch済: openai.com/api/pricing/, apidog.com]
- 標準版API: 入力$5/M tokens、出力$30/M tokens
- Pro版API: 入力$30/M tokens、出力$180/M tokens

---

## Claude Opus 4.7との比較 [WebSearch済: llm-stats.com, mindstudio.ai]

### GPT-5.5が上回る分野
- Terminal-Bench 2.0: GPT-5.5 82.7% vs Opus 4.7 69.4%
- BrowseComp（ブラウザ操作）
- OSWorld（PC自動操作）
- CyberGym（セキュリティ）
- トークン効率: GPT-5.5の方が効率的

### Claude Opus 4.7が上回る分野
- SWE-bench Pro: Opus 4.7 64.3% vs GPT-5.5 58.6%（実コードバグ修正）
- GPQA（科学的推論）
- HLE（高難度質問）
- MCP Atlas（外部ツール連携）
- FinanceAgent v1.1（金融業務）

### 価格比較 [WebSearch済]
- 入力: 同額（$5/M tokens）
- 出力: Opus 4.7が$25/M tokens、GPT-5.5が$30/M tokens（Claude側が安い）

---

## 副業・文系フリーランス文脈での評価

- GPT-5.5はエージェント的・長期タスク（PC操作・ブラウザ操作）に強い
- Opus 4.7はコードレビュー・バグ修正・外部ツール連携に強い
- 文系副業（CW応募文・提案書・ライティング）への適性はどちらも高水準
- 両者の月額は概ね¥2,000〜¥5,000程度（Plusプラン相当）[要検証: 正確な日本円価格]

---

## 未検証・記事から除外すべき情報

- ❌ 「@OpenAIツイート 5万いいね/1,135万閲覧」: WebSearch15本試みたが数値ソース確認不可 → 記事から削除
- ⚠️ 「Opus 4.7をベンチ全体で超えた」: 分野によって優劣が分かれるため使わない
- ⚠️ SWE-benchの88.7%と58.6%の数値差: 測定基準（SWE-bench全体 vs SWE-bench Pro）が異なる可能性。Pro版数値58.6%を採用

---

## ソース一覧

- techcrunch.com/2026/04/23/openai-chatgpt-gpt-5-5-ai-model-superapp/
- cnbc.com/2026/04/23/openai-announces-latest-artificial-intelligence-model.html
- axios.com/2026/04/23/openai-releases-spud-gpt-model
- fortune.com/2026/04/23/openai-releases-gpt-5-5/
- apidog.com/blog/what-is-gpt-5-5/
- llm-stats.com/blog/research/gpt-5-5-vs-claude-opus-4-7
- mindstudio.ai/blog/gpt-55-vs-claude-opus-47-coding-comparison
- gigazine.net/news/20260424-openai-gpt-5-5/
- thenextweb.com/news/openai-gpt-5-5-launch-enterprise
