---
title: Brain 画像挿入自動化 調査メモ
date: 2026-04-28
status: 検証済み・本番採用は保留（手動アップロード継続）
investigated_in: 2026-04-28 セッション（[実機確認済] Brain エディタ DevTools 観察）
---

# Brain 画像挿入の自動化調査（2026-04-28）

`brain-run` の `_images.md` から生成した画像 12 枚を、Brain エディタに自動挿入する機能を検討した。仕組みは判明したが、ローカル画像をブラウザに渡す方法に壁があり、本番採用は保留した。

## ✅ 確定した仕組み（[実機確認済]）

### Brain CDN
- URL パターン: `https://image.brain-market.com/store/{32文字hex}.jpg`
- ハッシュは MD5 形式（ファイル内容ハッシュの可能性 [要検証]）

### tiptap image extension
- 標準 `@tiptap/extension-image`
- options: `{ inline: true, allowBase64: true, HTMLAttributes: {} }`
- node attrs: `{ src, alt, title }`

### Brain 独自 extension（drop / paste）
- `drop` extension が DragEvent で File を受け取る
- 内部で画像を Brain CDN に同期アップロード（API endpoint 未確定）
- アップロード完了後、tiptap image node の src を CDN URL で更新

### 動作確認テスト（[実機確認済]）
- `Canvas.toBlob()` で生成した 100x100 のテスト画像（2KB）を `DragEvent('drop', { dataTransfer })` で dispatch
- → Brain が自動アップロード → CDN URL `https://image.brain-market.com/store/f07093bf6aba40d2814f0d340fc08808.jpg` を取得
- alt にはファイル名 `test_inject.jpg` が反映された

## ❌ 残った壁: ローカル画像をブラウザに渡す方法

### 試した方法と結果

| 方法 | 結果 |
|---|---|
| `paste` イベント dispatch | ❌ Brain が反応しない（trusted event じゃないため？） |
| `drop` イベント dispatch | ✅ 動作（File さえ作れれば挿入できる） |
| `input.files` 直接設定 + change | 未検証（drop で成功したため未到達） |
| ローカル HTTPサーバー（CORS 対応 Python）+ fetch | ❌ Mixed Content でブラウザがサイレントブロック |
| 同 + img タグ src 設定 | ❌ 同上 |

### ブロックの原因
- Brain は HTTPS、ローカル HTTP サーバーは HTTP → ブラウザの Mixed Content ポリシーで全 fetch / img 読み込み拒否
- localhost 例外も Chrome の最近のバージョンでは厳しめに [要検証]
- Service Worker / CSP メタタグでのブロックではない（[実機確認済] sw_count: 0、csp_metas: []）

## 🔄 将来再検討時の選択肢

### ⭐ E. ブラウザ Gemini API 直叩き → drop dispatch（[実機確認済 2026-04-28・採用候補No.1]）

ブラウザ内で Gemini API を fetch で直接叩き、レスポンス base64 を File 化して drop dispatch する。**ローカルファイル経由を完全回避**できる。

**動作確認結果**:
- ブラウザで `fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent', ...)` 実行 → 772KB の base64 取得成功
- `atob()` → `Uint8Array` → `Blob` → `File` に変換 → `DragEvent('drop', { dataTransfer })` dispatch
- Brain が自動アップロード → CDN URL `https://image.brain-market.com/store/6d44da8b6dca0f6cb565670b11f7dabe.jpg` 取得（[実機確認済]）
- alt は元のファイル名（`gemini_test.jpg`）が反映される

**フロー**:
```
1. ブラウザで Gemini API 叩く ──→ 高画質 base64（~772KB / 1K）
2. ブラウザ内で File 化（atob + Uint8Array + Blob + File）
3. DragEvent('drop') dispatch
4. Brain が再圧縮して CDN にアップロード（~266KB に縮小）
5. tiptap image node に CDN URL 反映
6. リードが CDN URL から curl で逆 DL → today/brain/images/{記事ID}/N.jpg に保存（[実機確認済] HTTP 200）
```

**画質トレードオフ（[実機確認済]）**:
- ブラウザから drop で送信した画像: 772,104 bytes
- CDN 配信される画像: 266,430 bytes（約 1/3 に再圧縮）
- 元の高画質はクライアント側に残らないので、Brain 側で表示する画像が決定版になる

**API キーの渡し方（推奨）**:
- ブラウザの localStorage に 1 度だけセット: `localStorage.setItem('gemini_key', '...')`
- 以降のセッションで `localStorage.getItem('gemini_key')` で読む
- Brain ドメインの localStorage なので Brain 側のスクリプトから読まれるリスクはあるが、Brain は信頼できる商用サービスのため許容 [要検証]

**実装の利点**:
- ✅ ローカルファイル経由なし → Mixed Content 完全回避
- ✅ Cloudflare Tunnel 等の外部依存なし
- ✅ Brain API 仕様調査不要（既存の drop ハンドラを流用）
- ✅ ローカルバックアップも CDN URL から curl で取得可能

**実装の課題**:
- ⚠️ API キーをブラウザの Brain ドメインに渡す必要（localStorage 経由で許容範囲）
- ⚠️ 元の高画質画像がローカルに残らない（Brain 再圧縮版のみ取得可能）
- ⚠️ Gemini API 課金は変わらず（生成 $0.067/枚 × 12 = $0.80）

### A. Base64 chunk 送信（依存ゼロ・確実）
- 1 枚 600KB → base64 で 800KB → 30KB chunk × 30 個に分割
- `javascript_tool` の text パラメータに 25KB ずつ埋め込み → window 変数に蓄積 → 全部揃ったら `atob()` → Blob → File → drop dispatch
- 12 枚で約 360 回 API 呼び出し・実行時間 3 分程度
- 実装: 半日

### B. Cloudflare Tunnel で HTTPS 公開（運用シンプル）
- `cloudflared tunnel --url http://localhost:8765` で HTTPS URL 取得
- ブラウザの fetch が通る → File 化 → drop dispatch
- 12 枚を順次 dispatch すれば数秒で完了
- 課題: cloudflared インストール必要・トンネル URL の都度変更
- 実装: 半日

### C. Brain API endpoint 直叩き（最速・本格運用向き）
- Brain エディタの DevTools Network タブで画像アップロード時の通信を観察
  - エンドポイント・リクエストボディ形式（multipart/form-data 推定）・認証ヘッダー（Cookie ベース推定）を確定
- ブラウザの cookie/session を流用して fetch でアップロード API 直叩き
- レスポンスの CDN URL を本文 HTML プレースホルダー置換で埋め込み → setContent
- 12 枚を並列 fetch すれば数秒で完了
- 課題: API 仕様調査が必要（30 分程度の手作業）・Brain 側の API 変更で破綻リスク
- 実装: 半日

### D. ブラウザ拡張経由（実装重い）
- Claude in Chrome 拡張機能の権限でローカルファイルアクセス
- 実装: 数日・恩恵小さい

## 📊 ROI 評価 → 2026-04-28 セッション最終判断: **画像挿入は手動運用継続**

### 検討した選択肢
- E（ブラウザ Gemini 直叩き → drop dispatch）が技術的に動くことを実機検証済（[実機確認済]）
- 画像 1 枚生成 → 挿入 → CDN URL 取得まで成功

### 採用見送りの理由
1. **画質トレードオフ**: ブラウザ送信 772KB → CDN 再圧縮 266KB（約 1/3）。元画質はクライアントから消える
2. **ROI が微妙**: Brain 投稿頻度 月 2 本（[Read済 published-history.md]）・1 本あたり手動アップロード 5〜10 分・月 10〜20 分の節約 vs SKILL.md 改修 + 継続メンテコスト
3. **API キー露出リスク**: Brain ドメインの localStorage に置く必要・信頼できる商用サービスとはいえ完全 0 リスクではない
4. **現状の手動運用で問題なし**: ユーザーが Brain エディタに手動でドラッグ&ドロップする時間 5〜10 分は許容範囲

### 採用した運用（2026-04-28 確定）
- ✅ **画像生成までは brain-run の Phase 6 内で自動化**（リードが Bash で `node scripts/gemini-image.mjs from-images-md` を実行）
- ✅ **生成画像は `today/brain/images/{記事ID}/` に保存**（thumb.jpg + 1.jpg〜N.jpg）
- ✅ **画像挿入は手動運用**（ユーザーが Brain エディタに各プレースホルダー位置に手動アップロード）

## 🎬 次回再検討時の手順（採用するなら）

1. このファイルを Read
2. 選択肢 E を最有力候補として再評価
3. ユーザーの localStorage に GEMINI_API_KEY をセット
4. brain-run/SKILL.md Phase 6.5 に「画像自動挿入ステップ」を追加
5. 1 枚で動作確認 → 12 枚一括化 → 本番採用判断

## 📦 関連ファイル

- `scripts/serve-images.py` — 検証用 CORS 対応 HTTP サーバー（2026-04-28 作成・Mixed Content の壁で本番採用見送り・将来 B 案再検討時に流用可）
- `scripts/gemini-image.mjs` — 画像生成 API ラッパー（既に運用中）
- `.claude/skills/brain-run/SKILL.md` Phase 6.5 — Brain エディタへの本文流し込み（既存・画像は手動）
