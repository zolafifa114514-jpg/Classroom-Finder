const fs = require('fs');
const path = require('path');

let cached = null;
let pending = null;

function readLocalEnv() {
  const file = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return [];
    const [name, ...rest] = trimmed.split('=');
    return [name, rest.join('=').trim().replace(/^['"]|['"]$/g, '')];
  }).filter((entry) => entry.length));
}

function failure(message, fix) {
  const error = new Error(message);
  error.fix = fix;
  return error;
}

async function requestKey() {
  const local = readLocalEnv();
  const keygenUrl = process.env.KEYGEN_URL || local.KEYGEN_URL;
  const keygenToken = process.env.KEYGEN_TOKEN || local.KEYGEN_TOKEN;
  if (!keygenUrl || keygenUrl === 'paste-here' || !keygenToken || keygenToken === 'paste-here') {
    throw failure('The MindDo key settings are missing.', 'Put KEYGEN_URL and KEYGEN_TOKEN in .env locally or in Vercel Environment Variables.');
  }

  let response;
  try {
    response = await fetch(`${keygenUrl.replace(/\/$/, '')}/api/lookup-key`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${keygenToken}`, Accept: 'application/json' }
    });
  } catch {
    throw failure('MindDo could not be reached.', 'Check the KEYGEN_URL, internet connection, and MindDo service status.');
  }

  let data = {};
  try { data = await response.json(); } catch { /* handled below */ }
  if (!response.ok || typeof data.apiKey !== 'string' || !data.apiKey || !data.expiresAt) {
    throw failure('MindDo did not return a usable AI key.', 'Check the MindDo token, KEYGEN_URL, and that the lookup response includes apiKey and expiresAt.');
  }
  const expiresAt = Date.parse(data.expiresAt);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    throw failure('MindDo returned an expired AI key.', 'Check the MindDo lookup response and issue a fresh key with a future expiresAt value.');
  }
  cached = { apiKey: data.apiKey, expiresAt };
  return cached.apiKey;
}

async function getKey(options = {}) {
  if (!options.force && cached && cached.expiresAt > Date.now()) return cached.apiKey;
  if (!pending) {
    pending = requestKey().finally(() => { pending = null; });
  }
  return pending;
}

module.exports = { getKey };
