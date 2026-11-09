# AGENTS.md — Ol-Kinyi

## What this is
A mobile web AR demo for Maasai Mara cultural tourism. A visitor points a phone at a beaded necklace, a plant or an animal card and sees what it means over the camera, asks follow-up questions, and keeps a trip record. Demo day is tomorrow: reliable beats clever.

## Non-negotiable rules
- All cultural content comes from `content/stories.json`. Never invent meanings, folklore, Maa words or facts in code, prompts or tests.
- Every story has a `verified` flag. Unverified stories show an "Illustrative" label in the UI.
- Ask answers only from approved story text. If nothing matches, reply "That's not in our approved stories yet." Never guess.
- `GROQ_API_KEY` stays on the server (`api/ask.js`). Never in browser code. Never commit secrets or `.env`.
- Works offline once loaded. Every network call has a local fallback.
- No sacred ceremonies, no private moments, no real individuals, no personal data collected.

## Stack
Plain JavaScript (ES modules), no framework, no bundler. MindAR image-target AR, vendored into `vendor/` so it works offline. Groq (`llama-3.3-70b-versatile`) through one Vercel serverless function. Vitest for tests. Service worker for offline.

## Layout
```
index.html  manifest.json  sw.js  targets.mind   # targets.mind is supplied by Deo
content/stories.json     # supplied and checked by Deo
src/                     # stories.js scan.js trip.js overlay.js ask.js main.js
api/ask.js               # Groq proxy
vendor/  img/
tests/
```

## Decided
- Three scan targets: necklace (0), plant (1), animal (2). Image targets only. No open-ended recognition.
- Every target also has a tap-to-view button, so the demo works if tracking fails.
- Core logic is pure functions in `src/`. Camera and DOM wiring live in `main.js` only.
- Ask tries `/api/ask` first, then falls back to local keyword matching.

## How to work
1. **Plan first:** read the phase prompt, give a short plan (files, tests, questions), then stop and wait for approval.
2. After approval: create stubs that throw `Error("NotImplemented")`, write the failing tests and show them red, then the minimum code to turn them green, then stop and report.
3. One phase = one task. Do not start the next one.

## Code rules
- One purpose per file, plain functions, one-line comment at the top of each file saying what it does. No other comments unless the code is not obvious.
- No unused code, no extra features, no debug logs.
- Do not guess library APIs. Check the installed version's docs.
- Fail with clear errors that name the field, for example `targets[1].summary`. Do not swallow exceptions.
- Settings and keys come from environment variables. Never hard-code them.

## Testing rules
- Tests are the spec. Once red is approved, do not edit tests to make them pass. Fix the code.
- Setup and fixture bugs may be fixed, but report each one.
- If a test seems wrong, stop and report: test name, what it asserts, why it is wrong, proposed change. Wait for approval.
- Never delete, skip or loosen a test.
- Tests call plain functions. No network, no camera, no real Groq. Use injected fakes.
