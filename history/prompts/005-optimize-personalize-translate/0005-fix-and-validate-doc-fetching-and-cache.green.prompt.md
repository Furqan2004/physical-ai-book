---
id: 0005
title: fix-and-validate-doc-fetching-and-cache
stage: green
date: 2026-03-07
surface: agent
model: gemini-2.0-flash
feature: 005-optimize-personalize-translate
branch: 005-optimize-personalize-translate
user: furqan
command: /sp.implement
labels: ["fix", "validation", "doc-service", "caching"]
links:
  spec: specs/005-optimize-personalize-translate/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - backend/services/doc_service.py
 - backend/scripts/test_personalize.py
 - backend/report.md
tests:
 - backend/scripts/test_personalize.py
---

## Prompt

I don't think so it's working perfectly


because it didn't personalize and return the md content so it will adjust.


try to run backend yourself and validate things

## Response snapshot

Fixed and validated the document fetching and caching logic. 
Key fixes:
1. Updated `doc_service.py` to handle the `baseUrl` (`/physical-ai-book/`) correctly.
2. Added a fallback mechanism in `doc_service.py` that detects if a remote fetch returns HTML (common on Docusaurus dev servers) and reads from the local `frontend/docs/` directory instead.
3. Created and executed `test_personalize.py` to verify caching for both personalization (per-user) and translation (global).
4. Verified that personalization correctly uses valid user IDs from the database.

## Outcome

- ✅ Impact: High - Ensures the system reliably retrieves Markdown source for personalization, even when remote fetching returns HTML.
- 🧪 Tests: `backend/scripts/test_personalize.py` passed, confirming both fetching and caching logic.
- 📁 Files: Updated `doc_service.py` and `report.md`. Created `test_personalize.py` and `list_users.py`.
- 🔁 Next prompts: None (Feature complete and validated).
- 🧠 Reflection: The fallback mechanism is crucial for development environments where the frontend server doesn't serve raw Markdown files directly.

## Evaluation notes (flywheel)

- Failure modes observed: Remote fetch returning HTML instead of Markdown.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
