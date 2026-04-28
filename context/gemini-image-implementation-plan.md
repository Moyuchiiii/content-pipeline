---
title: Gemini Nano Banana 2 画像生成API 実装プラン（次セッション着手用）
created: 2026-04-28
status: 未着手・次セッションで実装
researched_in: 2026-04-28 セッション（[WebSearch済] 7クエリ・[WebFetch済] 公式ドキュメント）
---

# Gemini Nano Banana 2 (gemini-3.1-flash-image-preview) 画像生成自動化 実装プラン

## 🎯 ゴール

hyui の **note サムネ・Brain サムネ・Brain 本文挿入画像** を **Gemini API 経由で自動化**。月80枚運用想定で **月 $5.36（≈ ¥800）以内で完結**させる。

**スコープ外**: X ヘッダー画像（手動運用継続）、X 投稿の添付画像（必要時のみ手動）

**コスト回収根拠**: Brain 1本 ¥2,980 × 還元率40% = ¥1,192/件。月3件売れれば API コスト回収 + 黒字。

## 📊 リサーチ済み情報（[WebSearch済] [WebFetch済]）

### モデル仕様

| 項目 | 値 |
|---|---|
| 公式モデルID | `gemini-3.1-flash-image-preview` |
| 別名 | Nano Banana 2 |
| 公式リリース | 2026-02-26 |
| 公式ドキュメント | https://ai.google.dev/gemini-api/docs/image-generation |
| Node.js SDK | `@google/genai`（新パッケージ名・旧 `@google/generative-ai` から変更） |
| APIキー取得 | https://aistudio.google.com/apikey |

### 料金（標準モード）

| 解像度 | 単価 |
|---|---|
| 512px | $0.045/枚 |
| 1K | $0.067/枚 |
| 2K | ~$0.10/枚 |
| 4K | $0.151/枚 |

Batch mode で 50% オフ。

### 無料枠（[WebFetch済 公式pricing 2026-04-28] 🚨 重大訂正）

**画像生成モデルは全部無料枠なし**。初回リクエストから課金が発生する。

| モデル | 無料枠 | 1枚あたり |
|---|---|---|
| `gemini-3.1-flash-image-preview`（Nano Banana 2・**採用**） | ❌ なし | 1K: $0.067 / 2K: $0.101 / 4K: $0.151 |
| `gemini-3-pro-image-preview` | ❌ なし | $0.134〜$0.24 |
| `gemini-2.5-flash-image` | ❌ なし | $0.039 |
| `Imagen 4 Fast` | ❌ なし | $0.02 |

**前回プランの「無料枠で完結」は誤り**。RPM 5〜15 / RPD 100〜1,000 / TPM 250K はすべて **テキスト生成モデル（Gemini 2.5 Pro / Flash / Flash-Lite）** の無料枠で、画像生成モデルは対象外だった。

### 月コスト試算（採用案: Nano Banana 2 / 1K Standard）

| 運用量 | 単価 | 月コスト | 円換算（$1=¥150） |
|---|---|---|---|
| 月80枚（1K Standard） | $0.067 | **$5.36** | **¥804** |
| 月80枚（1K Batch・50%OFF） | $0.034 | $2.72 | ¥408 |
| 月80枚（2K Standard） | $0.101 | $8.08 | ¥1,212 |

→ 即時生成性能を取って **1K Standard で進める**。Batch（50%OFF）は最大24時間遅延するためサムネ生成には不向き。

### 対応アスペクト比 14種類

`1:1 / 1:4 / 1:8 / 2:3 / 3:2 / 3:4 / 4:1 / 4:3 / 4:5 / 5:4 / 8:1 / 9:16 / 16:9 / 21:9`

📌 **note サムネ**: 16:9 で生成（note 推奨 1280×670 もこれでカバー）
📌 **Brain サムネ・本文挿入画像**: 16:9 か 4:3 を主用途別に使い分け

### 対応解像度

`512` / `1K` / `2K` / `4K`

### Node.js SDK 実装サンプル

```javascript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});  // GEMINI_API_KEY 環境変数から自動読込

const response = await ai.models.generateContent({
  model: "gemini-3.1-flash-image-preview",
  contents: prompt,  // 日本語自然言語パラグラフ（[Read済 lessons.md 2026-04-20] 公式推奨）
  config: {
    responseModalities: ['TEXT', 'IMAGE'],
    imageConfig: {
      aspectRatio: '16:9',  // 上記14種類から選択
      imageSize: '2K'        // 512 / 1K / 2K / 4K
    }
  }
});
```

## 📋 実装タスク

### 1. ユーザー事前準備（手動）

- [ ] Google AI Studio で API キー取得: https://aistudio.google.com/apikey
- [ ] `projects/content-pipeline/.env` に追加: `GEMINI_API_KEY=xxx`

### 2. 新規ファイル作成

#### `projects/content-pipeline/scripts/gemini-image.mjs`

API ラッパー関数:
- `generateImage({ prompt, aspectRatio, imageSize, outputPath })` → ローカル PNG 保存
- `generateBatch(prompts[], commonConfig)` → 複数枚一括生成
- リトライロジック（503 / 429 対応）
- レート制限ガード（RPM/RPD 自動チェック）
- typefully.mjs と同じ `.env` 読込パターン採用

#### `package.json` 依存追加

```json
"dependencies": {
  "@google/genai": "^x.x.x"
}
```

→ npm install 実行

### 3. 既存スキル統合

#### `note-run/SKILL.md` Phase 8

- サムネプロンプト生成後に「自動生成オプション」分岐
- 手動: gemini.google.com に貼り付け（既存）
- 自動: gemini-image.mjs 経由で `today/thumbnail_YYYYMMDD.png` に保存

#### `brain-run/SKILL.md` Phase 6

- Brain画像プレースホルダー（[実機確認済 lessons.md 2026-04-22]）の **画像N** に対応する画像を一括生成
- `brain_{date}_{suffix}_images.md` のプロンプトを順次 API 投入
- `brain/today/images/{記事ID}/image_N.png` に保存

### 4. 実機テスト

#### テスト1: noteサムネ生成

直近の note 記事のサムネプロンプトを API 経由で生成 → 1280×720（16:9）で出力検証

#### テスト2: Brainサムネ生成

Brain 記事のサムネプロンプト（シネマティックプレミアム路線）を API 経由で生成 → 出力品質確認

#### テスト3: Brain本文挿入画像の複数生成

直近の Brain 記事の画像プロンプト 7-10 枚を API 経由で一括生成 → 出力品質・路線整合性を確認

### 5. lessons.md 追記

実装完了後、`.claude/rules/lessons.md` に学んだことを追記:
- API 経由の挙動と AI Studio UI の差
- アスペクト比 14種類の制約と対処
- Gemini API レート制限の実測値

## 🚨 注意点・既知の制約

### [Read済 lessons.md 2026-04-20] Gemini プロンプト規定

- **日本語自然言語パラグラフ**で書く（英語構造化・箇条書きは NG）
- ネガティブプロンプト非対応
- Gemini アプリのアスペクト比指定は 1:1 固定化バグ報告あり（API では問題ないと予想）

### [Read済 lessons.md 2026-04-22] Brain画像の制約

- 販売ページの購買転換はビジュアル訴求依存（メアリ 78枚・明鏡 23枚等）
- 画像ゼロはリジェクト級
- 記事タイプ別枚数: 教科書型 11〜16・実録型 7〜10・ツールキット型 8〜12

### Gemini-3.1-flash-image-preview 既知バグ（[WebSearch済] 公式フォーラム）

- `imageSize: '2K'` パラメータが無視される報告あり（2026-04-28 時点）
- `aspect_ratio` も背景編集時に reshuffle される報告あり
- → 出力後にサイズ・アスペクト比チェック必須・必要ならローカルで sharp/Jimp トリミング

## 🎬 次セッション着手時の手順

1. このファイル `context/gemini-image-implementation-plan.md` を読む
2. ユーザーに APIキー取得状況を確認
3. `.env` 追加状況を確認
4. `scripts/gemini-image.mjs` 作成
5. `package.json` 更新 + `npm install @google/genai`
6. テスト実行（noteサムネ → Brainサムネ → Brain本文画像複数の順）
7. SKILL.md 統合（note-run Phase 8 / brain-run Phase 6 のみ・x-run は対象外）
8. lessons.md 追記

## 📦 関連ファイル参照

- `scripts/typefully.mjs` — 同じパターン（.env 読込・API ラッパー）の参考実装
- `.claude/rules/lessons.md` — Gemini 仕様の既知メモ（2026-04-20 / 2026-04-22）
- `projects/content-pipeline/.env` — APIキー追加先
- `.claude/skills/note-run/SKILL.md` Phase 8 — サムネプロンプト生成箇所（統合先）
- `.claude/skills/brain-run/SKILL.md` Phase 6 — サムネ&本文画像プロンプト生成箇所（統合先）

## 💰 採用根拠（2026-04-28 訂正版）

| 項目 | 結果 |
|---|---|
| gpt-image-2 medium | $0.053/枚 × 80 = $4.24/月 |
| **Nano Banana 2 / 1K Standard（採用）** | $0.067/枚 × 80 = **$5.36/月（≈ ¥804）** |
| Imagen 4 Fast（次点） | $0.02/枚 × 80 = $1.60/月（≈ ¥240・最安だが指示理解は Nano Banana 2 が優位） |
| API公開状況 | Nano Banana 2 = 即使用可 |
| 知見蓄積 | hyui の context に Gemini 公式仕様メモ（lessons.md 2026-04-20 / 2026-04-22）あり |
| コスト回収 | Brain 1本 ¥2,980 × 40%還元 = ¥1,192/件。月3件販売で黒字化 |

→ 次セッションで Nano Banana 2 / 1K Standard で実装着手する。
