const form = document.querySelector('#finder-form');
const roomInput = document.querySelector('#room');
const startInput = document.querySelector('#start');
const button = document.querySelector('#find-button');
const status = document.querySelector('#status');
const result = document.querySelector('#result');
const map = document.querySelector('#map');

function showMap(room) {
  document.querySelectorAll('[data-room]').forEach((node) => node.classList.toggle('selected', node.dataset.room === room.room));
}

function safeText(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function renderResult(data) {
  showMap(data.room);
  const aiSection = data.error
    ? `<div class="error-card"><strong>${safeText(data.error.message)}</strong><p>The official directions are still shown above. The server logged the fix.</p></div>`
    : `<div class="ai-note"><span class="ai-badge">AI helper</span><p>${safeText(data.answer || 'Follow the official steps above. If you are unsure, ask a nearby adult.')}</p></div>`;
  result.innerHTML = `<div class="result-heading"><div><span class="eyebrow">Official map match</span><h2>Room ${safeText(data.room.room)}: ${safeText(data.room.name)}</h2></div><span class="location-pill">Building ${safeText(data.room.building)} · Floor ${safeText(data.room.floor)}</span></div><ol class="steps">${data.room.steps.map((step) => `<li>${safeText(step)}</li>`).join('')}</ol>${aiSection}`;
  status.textContent = 'Directions found from the official school map.';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  button.disabled = true;
  status.textContent = 'Thinking…';
  result.innerHTML = '<div class="loading">Checking the official school map and asking the AI helper…</div>';
  try {
    const response = await fetch('/api/directions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room: roomInput.value, start: startInput.value, question: `How do I walk from ${startInput.value} to room ${roomInput.value}?` }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Request failed');
    ClassroomStorage.addSearch(data.room.room, startInput.value);
    renderResult(data);
  } catch (error) {
    result.innerHTML = `<div class="error-card"><strong>We could not find directions.</strong><p>${error.message}</p></div>`;
    status.textContent = 'Try again after checking the room and starting spot.';
  } finally { button.disabled = false; }
});

map.querySelectorAll('[data-room]').forEach((node) => node.addEventListener('click', () => { roomInput.value = node.dataset.room; roomInput.focus(); }));
