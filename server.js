const http = require('http');
const fs = require('fs');
const path = require('path');
const { landmarks, rooms } = require('./lib/classroom-data');
const { askAI } = require('./lib/ask-ai');

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const PORT = Number(process.env.PORT || 3000);

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
      if (!landmarks.includes(start)) return sendJson(res, 400, { error: { message: 'Please choose a starting spot from the official map.', fix: 'Choose one of the listed landmarks and try again.' } });
      const room = rooms[requested];
      if (!room) return sendJson(res, 404, { error: { message: 'That room is not on the official school map yet.', fix: 'Check the room number against the official school map.' } });
      try {
        const answer = await askAI({ root: ROOT, room, start, question: payload.question, landmarks });
        sendJson(res, 200, { room, answer, safe: true });
      } catch (error) {
        console.error(error.fix || 'Check the AI key setup and try again.');
        sendJson(res, 200, { room, safe: true, error: { message: error.message || 'The AI helper could not answer.', fix: error.fix || 'Check the AI key setup and try again.' } });
      }
    } catch (error) {
      console.error('Check the request format and try again.');
      sendJson(res, 400, { error: { message: 'Please try that direction request again.', fix: 'Send a room number and one official starting landmark.' } });
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
