const fs = require('fs');
const path = require('path');
const { getKey } = require('./get-key');

function readModel(root) {
  const notes = fs.readFileSync(path.join(root, 'NOTES.md'), 'utf8');
  return notes.match(/AI model:\s*([^\s]+)/i)?.[1] || 'gpt-6-luna';
}

function openAIError(status) {
  const error = new Error(status === 401 || status === 403 ? 'OpenAI rejected the AI key.' : 'OpenAI could not answer right now.');
  error.fix = status === 401 || status === 403
    ? 'Ask MindDo for a fresh key and check the KEYGEN_URL and KEYGEN_TOKEN settings.'
    : 'Check the internet connection, OpenAI service status, and try again later.';
  error.invalidKey = status === 401 || status === 403;
  return error;
}

async function requestOpenAI({ root, apiKey, room, start, question, landmarks }) {
  const brief = fs.readFileSync(path.join(root, 'BRIEF.md'), 'utf8');
  const officialMap = JSON.stringify({ landmarks, room });
  const input = `Student starting point: ${start}\nStudent question: ${question || `How do I get to room ${room.room}?`}\nOfficial school map data (the only navigation facts you may use): ${officialMap}\nGive a brief, friendly answer for a middle school student. Do not invent a room, building, floor, landmark, or shortcut.`;
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: readModel(root), instructions: brief, input })
  });
  if (!response.ok) throw openAIError(response.status);
  const data = await response.json();
  return data.output_text || data.output?.flatMap((item) => item.content || []).find((item) => item.text)?.text || '';
}

async function askAI({ root, room, start, question, landmarks }) {
  let apiKey = await getKey();
  try {
    return await requestOpenAI({ root, apiKey, room, start, question, landmarks });
  } catch (error) {
    if (!error.invalidKey) throw error;
    apiKey = await getKey({ force: true });
    return requestOpenAI({ root, apiKey, room, start, question, landmarks });
  }
}

module.exports = { askAI };
