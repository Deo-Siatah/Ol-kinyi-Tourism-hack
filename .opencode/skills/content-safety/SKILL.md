---
name: content-safety
description: Use this when editing content/stories.json, writing overlay or ask copy, building prompts, or adding any cultural meaning, folklore, Maa word, or UI label in Ol-Kinyi. Enforces approved-content-only, the verified/Illustrative rule, offline fallbacks, and secret/personal-data limits.
---

# Content safety

All cultural content is supplied and checked by Deo. Never invent it.

## Source of truth
- Every meaning, story, folklore detail, and Maa word comes from `content/stories.json`.
- Do not invent meanings, folklore, Maa words, or facts in code, prompts, or tests.
- If the approved text does not cover it, do not fabricate.

## Verified flag
- Every story has a `verified` flag.
- Unverified stories must show an "Illustrative" label in the UI.

## Ask
- Answers come only from approved story text.
- If nothing matches, reply exactly: "That's not in our approved stories yet."
- Never guess.

## Secrets and offline
- `GROQ_API_KEY` stays on the server (`api/ask.js`). Never in browser code.
- Never commit secrets or `.env`.
- Every network call needs a local fallback so the app works offline once loaded.

## Boundaries
- No sacred ceremonies, no private moments, no real individuals.
- Do not collect personal data.
