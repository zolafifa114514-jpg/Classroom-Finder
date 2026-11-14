const http = require('http');
const fs = require('fs');
const path = require('path');
const { landmarks, rooms } = require('./lib/classroom-data');
const { askAI } = require('./lib/ask-ai');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3000);

function readEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(fs.readFileSync(file, 'utf8').split(/\r?\n/).map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return [];
    const [key, ...rest] = trimmed.split('=');
    return [key, rest.join('=').trim().replace(/^['"]|['"]$/g, '')];
  }).filter((entry) => entry.length));
}

const env = readEnv();
const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function handleDirections(req, res) {
  let body = '';
  req.on('data', (chunk) => { body += chunk; });
  req.on('end', async () => {
    try {
      const payload = JSON.parse(body || '{}');
      const requested = String(payload.room || '').trim().toUpperCase();
      const start = String(payload.start || '').trim();
      if (!landmarks.includes(start)) return sendJson(res, 400, { error: 'Please choose a starting spot from the official map.' });
      const room = rooms[requested];
      if (!room) return sendJson(res, 404, { error: 'That room is not on the official school map yet.' });
      try {
        const answer = await askAI({ root: ROOT, apiKey, room, start, question: payload.question, landmarks });
        sendJson(res, 200, { room, answer, safe: true });
      } catch {
        sendJson(res, 200, { room, answer: 'The official directions are ready. The AI helper is offline right now—please check the OpenAI key in .env and try again.', safe: true, aiUnavailable: true });
      }
    } catch {
      sendJson(res, 400, { error: 'Please try that direction request again.' });
    }
  });
}

function serveFile(req, res) {
  const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = path.normalize(path.join(PUBLIC, requested));
  if (!file.startsWith(PUBLIC)) return sendJson(res, 404, { error: 'Not found' });
  fs.readFile(file, (error, content) => {
    if (error) return sendJson(res, 404, { error: 'Not found' });
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
    res.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'text/plain'}; charset=utf-8` });
    res.end(content);
  });
}

http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/directions') return handleDirections(req, res);
  if (req.method === 'GET') return serveFile(req, res);
  sendJson(res, 405, { error: 'Method not allowed' });
}).listen(PORT, () => console.log(`Classroom Finder is running at http://localhost:${PORT}`));
