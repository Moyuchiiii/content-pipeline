#!/usr/bin/env node
// Gemini Nano Banana 2 画像生成 API ヘルパー
// 用途: hyui の note サムネ・Brain サムネ・Brain 本文挿入画像を自動生成
// 仕様: https://ai.google.dev/gemini-api/docs/image-generation
// 料金: 1K $0.067/枚 / 2K $0.101/枚 / 4K $0.151/枚（無料枠なし・2026-04-28 確認）
// 採用案: 1K Standard（即時性重視）→ 月80枚 = $5.36/月 ≈ ¥804

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, '..', '.env');
const MODEL = 'gemini-3.1-flash-image-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

function loadEnv() {
  try {
    const text = readFileSync(ENV_PATH, 'utf8');
    const env = {};
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const value = trimmed.slice(idx + 1).trim();
      env[key] = value;
    }
    return env;
  } catch (err) {
    throw new Error(`Cannot read .env at ${ENV_PATH}: ${err.message}`);
  }
}

const env = loadEnv();
const API_KEY = env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY が .env に設定されていません');
  console.error('  取得: https://aistudio.google.com/app/apikey');
  process.exit(1);
}

const VALID_ASPECTS = ['1:1','1:4','1:8','2:3','3:2','3:4','4:1','4:3','4:5','5:4','8:1','9:16','16:9','21:9'];
const VALID_SIZES = ['512','1K','2K','4K'];

const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/**
 * outputPath の拡張子を実 MIME に合わせて補正
 * 例: outputPath="thumbnail.png" + mimeType="image/jpeg" → "thumbnail.jpg"
 */
function correctExtension(outputPath, mimeType) {
  const correctExt = MIME_TO_EXT[mimeType?.toLowerCase()] || '.png';
  const match = outputPath.match(/\.[^.\\/]+$/);
  if (!match) return outputPath + correctExt;
  const currentExt = match[0].toLowerCase();
  if (currentExt === correctExt) return outputPath;
  return outputPath.slice(0, -match[0].length) + correctExt;
}

/**
 * 画像1枚を生成して PNG として保存
 * @param {object} opts
 * @param {string} opts.prompt - 日本語自然言語パラグラフ（lessons.md 2026-04-20 公式推奨）
 * @param {string} [opts.aspectRatio='16:9'] - 14種類から選択
 * @param {string} [opts.imageSize='1K'] - 512 / 1K / 2K / 4K
 * @param {string} [opts.outputPath] - 保存先 PNG パス（指定時のみファイル書き出し）
 * @returns {Promise<{buffer: Buffer, outputPath: string|undefined, mimeType: string}>}
 */
export async function generateImage({ prompt, aspectRatio = '16:9', imageSize = '1K', outputPath }) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('prompt は非空文字列が必要');
  }
  if (!VALID_ASPECTS.includes(aspectRatio)) {
    throw new Error(`aspectRatio は ${VALID_ASPECTS.join(' / ')} のいずれか`);
  }
  if (!VALID_SIZES.includes(imageSize)) {
    throw new Error(`imageSize は ${VALID_SIZES.join(' / ')} のいずれか`);
  }

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: { aspectRatio, imageSize },
    },
  };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'x-goog-api-key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API ${res.status} ${res.statusText}: ${errBody.slice(0, 1000)}`);
  }

  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find((p) => p.inlineData || p.inline_data);
  if (!imagePart) {
    const text = parts.find((p) => p.text)?.text || '(no text)';
    throw new Error(`No image in response. text="${text.slice(0, 200)}" raw=${JSON.stringify(json).slice(0, 500)}`);
  }
  const inline = imagePart.inlineData || imagePart.inline_data;
  const buffer = Buffer.from(inline.data, 'base64');
  const mimeType = inline.mimeType || inline.mime_type || 'image/png';

  let savedPath = outputPath;
  if (outputPath) {
    savedPath = correctExtension(outputPath, mimeType);
    mkdirSync(dirname(savedPath), { recursive: true });
    writeFileSync(savedPath, buffer);
  }

  return {
    buffer,
    outputPath: savedPath,
    mimeType,
  };
}

/**
 * 複数プロンプトを順次生成（レート制限ガード付き）
 * @param {Array<{prompt: string, outputPath: string, aspectRatio?: string, imageSize?: string}>} jobs
 * @param {object} [opts]
 * @param {number} [opts.delayMs=4000] - 各リクエスト間の待機時間（RPM 緩和）
 * @param {string} [opts.aspectRatio='16:9']
 * @param {string} [opts.imageSize='1K']
 * @returns {Promise<Array<{ok: boolean, outputPath?: string, error?: string, prompt?: string}>>}
 */
export async function generateBatch(jobs, { delayMs = 4000, aspectRatio = '16:9', imageSize = '1K' } = {}) {
  const results = [];
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const idx = `[${i + 1}/${jobs.length}]`;
    try {
      console.log(`${idx} 生成中: ${job.outputPath}`);
      const result = await generateImage({
        prompt: job.prompt,
        aspectRatio: job.aspectRatio || aspectRatio,
        imageSize: job.imageSize || imageSize,
        outputPath: job.outputPath,
      });
      console.log(`${idx} ✅ ${result.outputPath} (${result.buffer.length} bytes)`);
      results.push({ ok: true, outputPath: result.outputPath });
    } catch (err) {
      console.error(`${idx} ❌ ${err.message}`);
      results.push({ ok: false, error: err.message, prompt: job.prompt?.slice(0, 100) });
    }
    if (i < jobs.length - 1) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  const okCount = results.filter((r) => r.ok).length;
  console.log(`\n=== 完了: ${okCount}/${jobs.length} 成功 ===`);
  return results;
}

/**
 * `_images.md` をパースして batch 用 jobs 配列を生成
 * フォーマット:
 *   ## サムネ候補（記事ヘッダー用・16:9）  → thumb
 *   ## 画像N: 「タイトル」                    → {N}.png
 *     - **アスペクト比**: 3:4
 *     ```
 *     {プロンプト}
 *     ```
 *
 * @param {string} mdPath - _images.md ファイルパス
 * @param {string} outputDir - 画像保存先ディレクトリ（既存 `_images.md` の「画像保存先」値を使う）
 * @returns {Array<{prompt: string, outputPath: string, aspectRatio: string, label: string}>}
 */
export function parseImagesMd(mdPath, outputDir) {
  const text = readFileSync(mdPath, 'utf8');
  const lines = text.split(/\r?\n/);
  const jobs = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const thumbMatch = line.match(/^##\s*サムネ候補/);
    const imageMatch = line.match(/^##\s*画像(\d+)\s*[:：]?\s*(.*)?/);

    if (!thumbMatch && !imageMatch) {
      i++;
      continue;
    }

    const isThumb = Boolean(thumbMatch);
    const imageNum = imageMatch ? imageMatch[1] : null;
    const label = imageMatch ? (imageMatch[2] || `画像${imageNum}`).replace(/^「|」$/g, '') : 'サムネ';

    let aspectRatio = '16:9';
    let promptLines = [];
    let inCodeBlock = false;
    let codeBlockClosed = false;

    let j = i + 1;
    while (j < lines.length) {
      const next = lines[j];
      if (next.match(/^##\s+/) && !inCodeBlock) break;

      if (!inCodeBlock) {
        const aspectM = next.match(/\*\*アスペクト比\*\*\s*[:：]\s*([\d:]+)/);
        if (aspectM) aspectRatio = aspectM[1];

        if (next.trim().startsWith('```')) {
          inCodeBlock = true;
          j++;
          continue;
        }
      } else {
        if (next.trim().startsWith('```')) {
          inCodeBlock = false;
          codeBlockClosed = true;
          j++;
          break;
        }
        promptLines.push(next);
      }
      j++;
    }

    const prompt = promptLines.join('\n').trim();
    if (codeBlockClosed && prompt) {
      const fileName = isThumb ? 'thumb.png' : `${imageNum}.png`;
      jobs.push({
        prompt,
        outputPath: resolve(outputDir, fileName),
        aspectRatio,
        label,
      });
    }
    i = j;
  }
  return jobs;
}

async function main() {
  const cmd = process.argv[2];

  if (cmd === 'test') {
    const outputPath = resolve(__dirname, '..', 'today', 'note', `gemini_test_${Date.now()}.png`);
    const result = await generateImage({
      prompt: '黒猫が木の床に座っている、柔らかな自然光、シンプルなテスト画像',
      aspectRatio: '16:9',
      imageSize: '1K',
      outputPath,
    });
    console.log(`✅ 疎通テスト成功`);
    console.log(`  保存先: ${result.outputPath}`);
    console.log(`  サイズ: ${result.buffer.length} bytes`);
    console.log(`  MIME: ${result.mimeType}`);
    return;
  }

  if (cmd === 'gen') {
    const promptFile = process.argv[3];
    const outputPath = process.argv[4];
    const aspectRatio = process.argv[5] || '16:9';
    const imageSize = process.argv[6] || '1K';
    if (!promptFile || !outputPath) {
      console.error('Usage: node scripts/gemini-image.mjs gen <prompt-file.txt> <output-path.png> [aspectRatio] [imageSize]');
      process.exit(1);
    }
    const prompt = readFileSync(promptFile, 'utf8').trim();
    const result = await generateImage({ prompt, aspectRatio, imageSize, outputPath });
    console.log(`✅ ${result.outputPath} (${result.buffer.length} bytes)`);
    return;
  }

  if (cmd === 'gen-inline') {
    // インラインプロンプト生成（プロンプトを直接引数で渡す）
    const prompt = process.argv[3];
    const outputPath = process.argv[4];
    const aspectRatio = process.argv[5] || '16:9';
    const imageSize = process.argv[6] || '1K';
    if (!prompt || !outputPath) {
      console.error('Usage: node scripts/gemini-image.mjs gen-inline "<prompt>" <output-path.png> [aspectRatio] [imageSize]');
      process.exit(1);
    }
    const result = await generateImage({ prompt, aspectRatio, imageSize, outputPath });
    console.log(`✅ ${result.outputPath} (${result.buffer.length} bytes)`);
    return;
  }

  if (cmd === 'from-images-md') {
    // _images.md をパースして一括生成（Brain 用）
    const args = process.argv.slice(3).filter((a) => !a.startsWith('--'));
    const flags = process.argv.slice(3).filter((a) => a.startsWith('--'));
    const dryRun = flags.includes('--dry-run') || flags.includes('--dry');

    const mdPath = args[0];
    const outputDir = args[1];
    const imageSize = args[2] || '1K';
    if (!mdPath || !outputDir) {
      console.error('Usage: node scripts/gemini-image.mjs from-images-md <_images.md> <output-dir> [imageSize] [--dry-run]');
      console.error('  imageSize: 512 / 1K(default) / 2K / 4K');
      console.error('  --dry-run: パース結果だけ表示（API 呼ばない・無料）');
      process.exit(1);
    }
    console.log(`📋 ${mdPath} をパース中...`);
    const jobs = parseImagesMd(mdPath, outputDir);
    if (jobs.length === 0) {
      console.error('❌ パース結果が空。_images.md のフォーマットを確認してください');
      process.exit(1);
    }
    console.log(`📋 ${jobs.length} 枚を ${dryRun ? '【dry-run・生成しない】' : '生成'}:`);
    jobs.forEach((j, i) => {
      const promptPreview = j.prompt.slice(0, 60).replace(/\n/g, ' ');
      console.log(`  ${i + 1}. [${j.aspectRatio}] ${j.label}`);
      console.log(`     → ${j.outputPath}`);
      console.log(`     prompt: ${promptPreview}...`);
    });
    console.log(`\n料金見積: 1K $${(0.067 * jobs.length).toFixed(2)} / 2K $${(0.101 * jobs.length).toFixed(2)}`);

    if (dryRun) {
      console.log('\n✅ dry-run 完了。実生成するには --dry-run を外して再実行。');
      return;
    }

    console.log(`\n生成開始（${jobs.length} × 4秒 = 約${Math.ceil(jobs.length * 4 / 60)}分）...\n`);

    const results = await generateBatch(jobs, { imageSize });
    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      console.error(`\n❌ ${failed.length}件失敗:`);
      failed.forEach((f, i) => console.error(`  ${i + 1}. ${f.error}`));
      process.exit(1);
    }
    return;
  }

  if (cmd === 'batch') {
    // JSON ファイルから一括生成
    const jobsFile = process.argv[3];
    if (!jobsFile) {
      console.error('Usage: node scripts/gemini-image.mjs batch <jobs.json>');
      console.error('  jobs.json 形式: [{"prompt": "...", "outputPath": "..."}, ...]');
      process.exit(1);
    }
    const jobs = JSON.parse(readFileSync(jobsFile, 'utf8'));
    const results = await generateBatch(jobs);
    const failed = results.filter((r) => !r.ok);
    if (failed.length > 0) {
      console.error(`\n❌ ${failed.length}件失敗:`);
      failed.forEach((f, i) => console.error(`  ${i + 1}. ${f.error}`));
      process.exit(1);
    }
    return;
  }

  console.error(`Usage:
  node scripts/gemini-image.mjs test                                                  疎通テスト
  node scripts/gemini-image.mjs gen <prompt-file> <output-path> [aspect] [size]       ファイルから生成
  node scripts/gemini-image.mjs gen-inline "<prompt>" <output-path> [aspect] [size]   インライン生成
  node scripts/gemini-image.mjs from-images-md <_images.md> <output-dir> [size]       _images.md から一括生成（Brain 用）
  node scripts/gemini-image.mjs batch <jobs.json>                                     JSONから一括生成

aspect: ${VALID_ASPECTS.join(' / ')}
size  : ${VALID_SIZES.join(' / ')}
`);
  process.exit(1);
}

const invokedAsScript = Boolean(process.argv[1]) && process.argv[1].endsWith('gemini-image.mjs');
if (invokedAsScript) {
  main().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
}
