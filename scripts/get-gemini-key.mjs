#!/usr/bin/env node
// ブラウザ統合テスト用に .env から GEMINI_API_KEY を出力
// 使い終わったら history からクリアすること
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, '..', '.env');

const text = readFileSync(ENV_PATH, 'utf8');
for (const line of text.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx < 0) continue;
  const key = trimmed.slice(0, idx).trim();
  if (key === 'GEMINI_API_KEY') {
    process.stdout.write(trimmed.slice(idx + 1).trim());
    process.exit(0);
  }
}
console.error('GEMINI_API_KEY not found in .env');
process.exit(1);
