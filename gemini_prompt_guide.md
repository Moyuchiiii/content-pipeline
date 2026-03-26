# Gemini 画像生成 プロンプトガイド

> 調査日: 2026-03-26 / 対象: Gemini ImageFX / Imagen 4 / Gemini 2.5 Flash Image

---

## 1. 基本構造

### 黄金則: キーワードの羅列ではなく「場面を描写する」

Gemini / Imagen はキーワードの羅列より、**物語的で説明的な文章**のほうが高品質な画像を生成する。
「A stoic robot barista」ではなく「冷静な表情で熱心にコーヒーを淹れるロボットのバリスタ、青白く光るオプティクスが特徴的」という描写が有効。

ソース: [Google Developers Blog - Gemini 2.5 Flash Image prompting](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)

### 推奨構造（5要素）

```
[被写体] + [背景・環境] + [スタイル] + [照明] + [技術仕様]
```

より詳細な構造（フォトリアリスティック向け）:

```
[ショットタイプ] + [被写体と特徴] + [動作・表情] + [環境] + [照明] + [カメラ設定] + [アスペクト比]
```

実例:
```
85mm ポートレートレンズで撮影、窓辺に立つ陶芸家の女性、土で汚れた手でボウルを持ち穏やかに微笑む、
ゴールデンアワーの暖かな光が横から差し込む、細かいテクスチャを強調、ボケ背景、16:9
```

ソース: [Google Developers Blog - Gemini 2.5 Flash Image prompting](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)

### イラスト・スティッカー向け構造

```
[スタイル] + [主体と特徴] + [カラーパレット] + [線・シェーディング] + [背景]
```

実例:
```
かわいいスティッカーイラスト、赤パンダ、竹を持って座っている、
パステルオレンジと白のカラーパレット、太い輪郭線、セルシェーディング、白背景
```

### テキスト入り画像向け構造

```
[画像タイプ] + [テキスト内容と引用符] + [フォントスタイル] + [デザイン説明] + [カラースキーム]
```

実例:
```
モダンなコーヒーショップのロゴデザイン、テキスト「The Daily Grind」、
太いサンセリフフォント、ミニマルな円形エンブレム、深緑とクリームのカラーパレット
```

ソース: [Google Cloud Vertex AI - Prompt Guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)

---

## 2. スタイル・画風の指定

### 写真・リアル系

| キーワード（英語） | 意味 |
|---|---|
| `photorealistic` | 写真のようにリアル |
| `DSLR photo` | 一眼レフ写真風 |
| `documentary photography` | ドキュメンタリー写真風 |
| `macro photography` | マクロ写真 |
| `editorial photography` | 雑誌・編集用写真風 |
| `product photography` | 製品写真 |

### イラスト・アート系

| キーワード（英語） | 意味 |
|---|---|
| `watercolor illustration` | 水彩イラスト |
| `oil painting` | 油絵 |
| `digital art` | デジタルアート |
| `anime style` | アニメ調 |
| `Studio Ghibli style` | ジブリ風 |
| `ink wash painting` / `sumi-e` | 墨絵 |
| `low-poly 3D render` | ローポリ3Dレンダリング |
| `flat design` | フラットデザイン |
| `isometric illustration` | アイソメトリックイラスト |
| `minimalist` | ミニマリスト |

### 雰囲気・ムード系

| キーワード（英語） | 意味 |
|---|---|
| `cinematic` | 映画的 |
| `moody` | 陰影ある雰囲気 |
| `dreamlike` | 夢幻的 |
| `surreal` | シュールレアリスム |
| `vibrant` | 鮮やか |
| `muted tones` | くすんだトーン |
| `high contrast` | 高コントラスト |
| `pastel` | パステルカラー |

ソース: [Atlabs AI - Imagen 4 Prompting Guide](https://www.atlabs.ai/blog/imagen-4-prompting-guide) / [Google Cloud Vertex AI - Prompt Guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)

---

## 3. 照明・カラーの指定

### 照明キーワード一覧

| キーワード（英語） | 効果 |
|---|---|
| `golden hour lighting` | 夕方・朝の温かなオレンジ光 |
| `blue hour` | 薄暮の青みがかった光 |
| `natural lighting` | 自然光 |
| `soft diffused light` | 柔らかく拡散した光 |
| `dramatic lighting` | コントラストの強い劇的な照明 |
| `rim lighting` | 輪郭を照らす逆光 |
| `studio lighting` | スタジオライティング |
| `neon lighting` | ネオン光 |
| `candlelight` | ろうそくの光 |
| `overcast sky` | 曇り空（均一な拡散光） |
| `single spotlight` | 一点スポットライト |

### カラー指定の書き方

- パレット指定: `color palette: forest green, cream, terracotta`
- トーン指定: `warm tones` / `cool tones` / `monochrome`
- 特定色強調: `dominant blue with gold accents`

ソース: [Google Cloud Vertex AI - Prompt Guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide) / [Atlabs AI - Imagen 4 Prompting Guide](https://www.atlabs.ai/blog/imagen-4-prompting-guide)

---

## 4. 構図・カメラアングルの指定

### ショットタイプ

| キーワード（英語） | 意味 |
|---|---|
| `close-up shot` | クローズアップ |
| `extreme close-up` | 超クローズアップ |
| `medium shot` | ミディアムショット（腰から上） |
| `wide shot` / `establishing shot` | 全景ショット |
| `aerial view` / `bird's eye view` | 俯瞰・空撮 |
| `low-angle shot` | ローアングル（見上げる） |
| `eye-level shot` | 水平アングル |
| `Dutch angle` | ダッチアングル（斜め） |
| `macro shot` | マクロ |
| `over-the-shoulder` | 肩越しのショット |

### カメラ・レンズ設定

| キーワード（英語） | 効果 |
|---|---|
| `85mm portrait lens` | ポートレート用の自然な圧縮感 |
| `24mm wide-angle lens` | 広角、臨場感 |
| `macro lens` | 接写、細部強調 |
| `shallow depth of field` | 背景ボケ（主体強調） |
| `deep depth of field` | 全体にピントが合う |
| `bokeh background` | ボケた背景 |
| `sharp focus` | 鮮明なフォーカス |
| `long exposure` | 長時間露光（光の軌跡） |

### 構図テクニック

| キーワード（英語） | 意味 |
|---|---|
| `rule of thirds` | 三分割法 |
| `negative space on left/right` | 左/右側にネガティブスペース（テキスト挿入用） |
| `centered composition` | 中央構図 |
| `symmetrical composition` | 左右対称 |
| `leading lines` | 誘導線 |
| `framing` | フレーミング |

ソース: [Google Developers Blog - Gemini 2.5 Flash Image prompting](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/) / [Google Cloud Vertex AI - Prompt Guide](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide)

---

## 5. 解像度・アスペクト比

### Gemini 2.5 Flash Image / Imagen 対応アスペクト比

| 比率 | 用途 |
|---|---|
| `1:1` | SNS投稿（正方形）、noteアイキャッチ |
| `16:9` | YouTube/ブログサムネイル、横長バナー |
| `4:3` | 汎用横長 |
| `3:2` | カメラ標準 |
| `9:16` | TikTok・Instagram Reels（縦型） |
| `3:4` | SNS縦型 |
| `4:5` | Instagram推奨縦型 |
| `21:9` | 超横長シネマスコープ |
| `1:4` / `4:1` | 極端な縦/横（Gemini 3.1 Flash Image Preview以降） |
| `1:8` / `8:1` | 超極端な縦/横（Gemini 3.1 Flash Image Preview以降） |

### APIでの設定方法

**Python SDK:**
```python
image_config=types.ImageConfig(
    aspect_ratio="16:9",
    image_size="2K"
)
```

**REST API:**
```json
"imageConfig": {
  "aspectRatio": "16:9",
  "imageSize": "2K"
}
```

### 解像度オプション

`"512"` / `"1K"` / `"2K"` / `"4K"`

**重要:** プロンプト内に「4K」「HD」と書いても実際のピクセル数は変わらない。解像度は `image_size` パラメータで別途設定する。

### Gemini アプリ（非API）でのアスペクト比

Gemini アプリ（ブラウザ・モバイル）では、プロンプトで比率を指定しても常に1:1になるケースが多い（2026年3月時点でのユーザー報告あり）。

ソース: [Google AI for Developers - Image Generation](https://ai.google.dev/gemini-api/docs/image-generation) / [Google Developers Blog - Aspect Ratios](https://developers.googleblog.com/gemini-2-5-flash-image-now-ready-for-production-with-new-aspect-ratios/) / [Gemini Community Forum](https://support.google.com/gemini/thread/371311134/)

---

## 6. ネガティブプロンプト

### 使用可能かどうか（モデル別）

| モデル | ネガティブプロンプト対応 |
|---|---|
| `imagen-3.0-generate-001` | 対応（レガシー） |
| `imagen-3.0-fast-generate-001` | 対応（レガシー） |
| `imagen-3.0-capability-001` | 対応（レガシー） |
| `imagen-3.0-generate-002` 以降 | **非対応**（廃止） |
| Gemini 2.5 Flash Image | 非対応 |

ネガティブプロンプトは **Imagen 3.0-generate-002 以降では廃止されたレガシー機能**。

ソース: [Google Cloud Vertex AI - Negative Prompt](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/omit-content-using-a-negative-prompt)

### Vertex AI（旧モデル）での書き方

REST APIの `negativePrompt` フィールドに除外したい要素を名詞で記述する。

```json
{
  "parameters": {
    "negativePrompt": "blurry, text, people, animals, cropped"
  }
}
```

書き方の注意:
- 「no walls」「don't show trees」などの否定形・命令形は使わない
- 「walls, trees」のように名詞の列挙が有効
- 5〜10語以内に収める

### 現行モデルでの代替手法（セマンティック・ネガティブプロンプト）

最新の Gemini / Imagen 3.0-generate-002 以降では、除外したい要素を**ポジティブな表現で置き換える**ことが推奨される。

| 従来のネガティブ指定 | 現行の推奨表現 |
|---|---|
| `no cars` | `an empty deserted street with no signs of traffic` |
| `no people` | `an uninhabited landscape, solitary and quiet` |
| `no text` | `clean image with no typography or labels` |
| `no background` | `subject isolated on pure white background` |

ソース: [Google Developers Blog - Gemini 2.5 Flash Image prompting](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)

---

## 7. noteサムネイル用テンプレート

### noteサムネイルの基本仕様

- 推奨アスペクト比: **1:1**（正方形）または **16:9**（横長）
- テキストは画像生成後に別途Canva等で追加する想定でプロンプトを組む
- テキスト用のネガティブスペース（空白エリア）をプロンプトで確保する

### テンプレートA: 概念・テーマ系（抽象・シンプル）

```
[テーマ]を象徴するミニマルなデジタルイラスト、
[カラーパレット]のグラデーション背景、
中央にシンプルなアイコンまたはオブジェクト、
右側に縦長のネガティブスペース（テキスト用）、
フラットデザイン、クリーンな構図、1:1
```

### テンプレートB: 人物・ビジネス系（写真風）

```
フォトリアルな[職種・人物]のポートレート、
[背景]の環境、自然光、柔らかいボケ背景、
左側に人物配置、右側に広いネガティブスペース、
プロフェッショナルな雰囲気、16:9、テキストなし
```

### テンプレートC: テクノロジー・IT系

```
[技術/コンセプト]を表すデジタルアート、
暗い背景に光るUI要素やコード、ネオンアクセントカラー、
シネマティック、フューチャリスティック、
上部中央にネガティブスペース（タイトル用）、16:9
```

### テンプレートD: ライフスタイル・趣味系

```
[シーン]の温かみのある写真風イラスト、
ゴールデンアワーの自然光、パステルカラートーン、
被写界深度でメイン被写体を強調、
下部三分の一にネガティブスペース、1:1
```

ソース: [チャエンのAI研究所 - Nano Banana Pro サムネイル](https://digirise.ai/chaen-ai-lab/nano-banana-pro-thumbnail/) / [Atlabs AI - Imagen 4 Prompting Guide](https://www.atlabs.ai/blog/imagen-4-prompting-guide)

---

## 8. 実例集（コピー&ペースト可）

以下のプロンプトはすべて英語で記載（英語のほうが精度が高いため）。日本語版も併記する。

### 実例 1: note記事サムネイル（AIツール紹介）

```
Minimalist digital illustration representing artificial intelligence tools,
deep navy blue gradient background with subtle circuit patterns,
glowing laptop icon at center with neural network lines,
negative space on the right third for title text,
flat design, clean modern aesthetic, no text, 16:9
```

### 実例 2: note記事サムネイル（副業・収入系）

```
Photorealistic product-style composition, a smartphone displaying a rising
graph on screen, placed on a sleek white marble surface,
soft natural studio lighting from the left, minimal props,
wide negative space at top for text overlay,
high contrast, editorial photography style, no text, 1:1
```

### 実例 3: note記事サムネイル（読書・学習系）

```
Cozy watercolor illustration, stack of books with warm tea cup beside them,
soft golden hour window light, autumn leaf palette of amber and cream,
centered composition with generous negative space above,
gentle bokeh background, no text, 1:1
```

### 実例 4: note記事サムネイル（ビジネス・仕事術）

```
Professional editorial photograph, confident woman at clean modern desk,
looking at camera with calm expression, soft office natural light,
left-side subject placement, right side open for title text,
shallow depth of field, muted earth tones, no text, 16:9
```

### 実例 5: note記事サムネイル（旅行・体験記）

```
Cinematic landscape photo, aerial view of winding mountain road at golden hour,
vibrant orange and purple sky, dramatic lighting,
lower third clear for text overlay, wide 16:9 composition,
no people, no text, high dynamic range
```

### 実例 6: note記事サムネイル（料理・グルメ系）

```
Close-up macro photography of fresh handmade pasta on rustic wooden board,
warm candlelight from the right, shallow depth of field,
rich terracotta and cream color palette, appetizing food photography style,
negative space at top for text, no text, 1:1
```

### 実例 7: note記事サムネイル（メンタル・自己啓発系）

```
Dreamlike digital art, solitary figure sitting on a hilltop watching sunrise,
soft pastel pink and lavender gradient sky, minimalist style,
silhouette composition, wide negative space above for title,
hopeful and serene mood, no text, 16:9
```

### 実例 8: note記事サムネイル（テクノロジー・プログラミング）

```
Dark futuristic code editor screenshot style illustration,
glowing green and cyan code lines on deep dark background,
neon rim lighting effect, cyberpunk aesthetic,
central focal point with empty upper area for text,
no actual readable text in image, 16:9
```

### 実例 9: note記事サムネイル（ライフスタイル全般）

```
Bright airy flat lay photography, minimal workspace with notebook,
plant, coffee cup arranged symmetrically on white background,
overhead bird's eye view, soft diffused natural light,
clean negative space on left side, pastel and white tones,
no text, 1:1
```

### 実例 10: note記事サムネイル（お金・投資系）

```
Elegant product photography style, gold coins and small plant
symbolizing financial growth, placed on dark slate background,
single dramatic spotlight from above, luxurious and minimal,
right-side composition with left negative space for text,
high contrast, no text, 1:1
```

### 実例 11: マーケター向け（エコブランド）

```
Vibrant eco-friendly sneaker product hero shot,
shoe placed on lush green moss, soft morning light,
minimal composition, color palette: forest green and cream,
4:5 aspect ratio, no text, clean background
```

ソース: [Atlabs AI - Imagen 4 Prompting Guide](https://www.atlabs.ai/blog/imagen-4-prompting-guide) / [Google Developers Blog](https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/)

---

## 9. 日本語 vs 英語プロンプト

### 基本方針

| 状況 | 推奨言語 |
|---|---|
| 細かい描写・スタイル指定が必要 | **英語** |
| 日本的なシーンや文化的ニュアンス | **日本語**（または日英混在） |
| 日本語テキスト入り画像 | **日本語** |
| 素早いテスト・大まかな確認 | **日本語** でも可 |

### 日本語プロンプトが有効な場面

- 「桜並木の下でお茶をする二人の女性、春の柔らかい光、水彩画風」
- 「昭和レトロな商店街、夕暮れ、ノスタルジックな雰囲気」
- 「富士山をバックに日本の農村風景、清々しい朝の光」

上記のような**日本文化特有のシーン**は、日本語プロンプトのほうが文化的ニュアンスを正確に反映しやすい。

### 英語プロンプトが有効な場面

- 詳細なカメラ設定（`85mm portrait lens`, `shallow depth of field` など）
- スタイル名（`Studio Ghibli style`, `low-poly 3D render` など）
- 照明用語（`golden hour`, `rim lighting`, `bokeh` など）
- 構図用語（`rule of thirds`, `negative space`, `Dutch angle` など）

### 日英混在の実践例

```
桜の木の下に座る女性のポートレート、photorealistic、
85mm portrait lens、golden hour lighting、bokeh background、
soft warm tones、no text、1:1
```

### 日本語プロンプトの書き方のコツ

1. **句読点・括弧でまとまりを明示する**: 要素ごとに「、」で区切り誤解を防ぐ
2. **固定の順序を守る**: 被写体→属性→動作→環境→スタイル→技術仕様
3. **指示語で締める**: 「〜のイラストを生成してください」「〜の画像を作成して」

ソース: [pxz.ai - Gemini画像生成プロンプト75選](https://pxz.ai/ja/blog/gemini-image-prompts) / [TSクラウド - Gemini画像生成のコツ](https://googleworkspace.tscloud.co.jp/gemini/image-generation)

---

## 10. 参考ソース

### 公式ドキュメント

| ソース | URL |
|---|---|
| Google Developers Blog: Gemini 2.5 Flash Image プロンプトガイド | https://developers.googleblog.com/en/how-to-prompt-gemini-2-5-flash-image-generation-for-the-best-results/ |
| Google Cloud Vertex AI: Imagen プロンプトガイド | https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide |
| Google Cloud Vertex AI: ネガティブプロンプト | https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/omit-content-using-a-negative-prompt |
| Google AI for Developers: Image Generation API | https://ai.google.dev/gemini-api/docs/image-generation |
| Google Developers Blog: 新アスペクト比リリース | https://developers.googleblog.com/gemini-2-5-flash-image-now-ready-for-production-with-new-aspect-ratios/ |

### 実践ガイド・解説記事

| ソース | URL |
|---|---|
| Atlabs AI: Imagen 4 プロンプティングガイド | https://www.atlabs.ai/blog/imagen-4-prompting-guide |
| pxz.ai: Gemini画像生成プロンプト75選（日本語） | https://pxz.ai/ja/blog/gemini-image-prompts |
| TSクラウド: Gemini画像生成のコツ（日本語） | https://googleworkspace.tscloud.co.jp/gemini/image-generation |
| チャエンのAI研究所: Nano Banana Proサムネイル（日本語） | https://digirise.ai/chaen-ai-lab/nano-banana-pro-thumbnail/ |
| Gemini Community: アスペクト比の制限（ユーザー報告） | https://support.google.com/gemini/thread/371311134/ |

---

## 付録: よく使うキーワード早見表

### スタイル

`photorealistic` / `watercolor` / `oil painting` / `digital art` / `anime style` / `flat design` / `minimalist` / `cinematic` / `isometric` / `low-poly 3D`

### 照明

`golden hour` / `natural lighting` / `dramatic lighting` / `studio lighting` / `rim lighting` / `neon lighting` / `soft diffused light` / `candlelight`

### 構図・アングル

`close-up` / `wide shot` / `aerial view` / `low-angle` / `dutch angle` / `rule of thirds` / `negative space` / `bokeh background` / `shallow depth of field`

### カメラ・レンズ

`85mm portrait lens` / `24mm wide-angle` / `macro lens` / `sharp focus` / `long exposure`

### アスペクト比（noteサムネイル用）

`1:1`（正方形） / `16:9`（横長サムネイル） / `4:5`（縦型SNS）
