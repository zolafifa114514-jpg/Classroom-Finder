# Classroom Finder notes

## How to run

1. Put your real `OPENAI_API_KEY` in `.env`.
2. Run `node server.js` (or `npm start`).
3. Open http://localhost:3000.

AI model: gpt-6-luna

## Done in Version 1

- Saved the competition and product brief in `BRIEF.md`.
- Added room lookup with safe, official-map-only sample directions.
- Added starting-landmark selection.
- Added a simple building/floor map with clickable room markers.
- Added a server-side OpenAI request; the key never goes to the browser.
- Added browser-only localStorage for recent searches and official landmarks.
- Shows “Thinking…” and disables the button during the AI request.
- Added friendly key/internet error handling.
- Saves on this computer only for now.
- Room-number directions checked locally: room 204 returns four official-map steps.

## Vercel setup

- The page stays in `public/` and Vercel serves it as static files.
- `api/directions.js` is the Vercel server function for the AI request.
- `lib/ask-ai.js` is the one small AI-request file shared by local Node and Vercel.
- Vercel reads `OPENAI_API_KEY` only from its Environment Variables settings; `.env` stays local and ignored.
- `vercel.json` includes `BRIEF.md` and `NOTES.md` in the function so the brief and model setting are available online.
- No other environment variable is required. If Vercel asks for a framework, choose `Other` and use `public` as the output directory.

## Maybe Later

- The user can see a notice when a room isn't on the official map.
- The user can enter their class schedule and get directions between each class.
- The user can ask how to find places like the gym, office, or nurse.
- The user can report a wrong direction so the map info gets fixed.
- The user can see how many minutes the walk will take.
- The user can search a teacher's name to find their classroom.
- The user can print or save directions for their first day.
- The user can hear the directions read aloud.

## Next

- Replace sample map entries with the official school map data.
- Confirm the OpenAI key and `gpt-6-luna` model work on this computer.
- Test the four MVP features in a short demo video.

After each save point, push it to GitHub.
