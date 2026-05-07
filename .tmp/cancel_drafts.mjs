import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ENV_PATH = resolve(__dirname, '..', '.env');
const BASE = 'https://api.typefully.com/v2';

function loadEnv() {
  const text = readFileSync(ENV_PATH, 'utf8');
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx < 0) continue;
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return env;
}

const env = loadEnv();
const API_KEY = env.TYPEFULLY_API_KEY;
const SOCIAL_SET_ID = env.TYPEFULLY_SOCIAL_SET_ID;

const headers = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

const draftIds = [8828746, 8828747, 8828748, 8828749, 8828750];

for (const id of draftIds) {
  try {
    const res = await fetch(`${BASE}/social-sets/${SOCIAL_SET_ID}/drafts/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (res.ok) {
      console.log(`✅ draft ${id} deleted`);
    } else {
      const body = await res.text();
      console.log(`⚠️ draft ${id} status=${res.status}: ${body.slice(0, 200)}`);
    }
  } catch (err) {
    console.log(`❌ draft ${id} error: ${err.message}`);
  }
}
