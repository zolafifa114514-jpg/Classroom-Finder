const path = require('path');
const { landmarks, rooms } = require('../lib/classroom-data');
const { askAI } = require('../lib/ask-ai');

module.exports = async function directions(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const requested = String(payload.room || '').trim().toUpperCase();
    const start = String(payload.start || '').trim();
    if (!landmarks.includes(start)) return res.status(400).json({ error: { message: 'Please choose a starting spot from the official map.', fix: 'Choose one of the listed landmarks and try again.' } });
    const room = rooms[requested];
    if (!room) return res.status(404).json({ error: { message: 'That room is not on the official school map yet.', fix: 'Check the room number against the official school map.' } });
    try {
      const answer = await askAI({ root: path.join(__dirname, '..'), room, start, question: payload.question, landmarks });
      return res.status(200).json({ room, answer, safe: true });
    } catch (error) {
      console.error(error.fix || 'Check the AI key setup and try again.');
      return res.status(200).json({ room, safe: true, error: { message: error.message || 'The AI helper could not answer.', fix: error.fix || 'Check the AI key setup and try again.' } });
    }
  } catch {
    console.error('Check the request format and try again.');
    return res.status(400).json({ error: { message: 'Please try that direction request again.', fix: 'Send a room number and one official starting landmark.' } });
  }
};
