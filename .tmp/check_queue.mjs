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

const startDate = '2026-04-24';
const endDate = '2026-04-26';

const url = `${BASE}/social-sets/${SOCIAL_SET_ID}/queue?start_date=${startDate}&end_date=${endDate}`;
const res = await fetch(url, { headers });
if (!res.ok) {
  console.log(`Error ${res.status}:`, await res.text());
  process.exit(1);
}
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
