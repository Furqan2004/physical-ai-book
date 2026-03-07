---
id: 0016
title: Agent Content Resolution and Full Document Swapping
stage: green
date: 2026-03-06
surface: agent
model: Gemini 2.0 Flash
feature: 004-fix-system-and-auth
branch: 004-fix-system-and-auth
user: furqan
command: sp.implement
labels: ["backend", "file-system", "agents", "markdown"]
links:
  spec: "specs/004-fix-system-and-auth/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - backend/services/doc_service.py
  - backend/routers/personalize.py
  - backend/routers/translate.py
  - backend/ai/orchestrator_agent.py
tests:
  - Backend path-to-content resolution (verified)
---

## Prompt

The user reported that the agent was asking for the Markdown text instead of receiving it. They requested that the agent receives the complete chapter content and returns the full transformed content to be shown on the page.

## Response snapshot

Implemented a backend file-resolution service that translates Docusaurus metadata source paths (e.g., `@site/docs/...`) into actual Markdown text by reading directly from the frontend directory. Updated the `personalize` and `translate` routers to use this service, ensuring the agent always receives the full document body. Enforced strict agent instructions to return the COMPLETE transformed document without summaries or omissions.

## Outcome

- ✅ Impact: High. Fixes the fundamental data-flow issue for content transformation.
- 📁 Files: Created backend/services/doc_service.py and updated 3 other files.
- 🧠 Reflection: Docusaurus metadata only provides the source file path at the layout level; the backend must take responsibility for reading the actual content if the frontend cannot easily provide it.

## Evaluation notes (flywheel)

- Failure modes observed: Agent asking for manual paste of content (fixed via backend resolution).
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
