---
id: 0002
title: AI Book RAG Fixes Plan
stage: plan
date: 2026-03-06
surface: agent
model: qwen-coder
feature: 002-rag-chatbot-fixes
branch: 002-rag-chatbot-fixes
user: furqan
command: /sp.plan
labels: ["plan", "rag-chatbot", "authentication", "qdrant", "guest-mode", "research"]
links:
  spec: specs/002-rag-chatbot-fixes/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/002-rag-chatbot-fixes/plan.md
 - specs/002-rag-chatbot-fixes/research.md
 - specs/002-rag-chatbot-fixes/data-model.md
 - specs/002-rag-chatbot-fixes/contracts/api.md
 - specs/002-rag-chatbot-fixes/quickstart.md
tests:
 - Constitution check (all rules PASS)
 - Code scan completed (frontend + backend)
 - Research tasks completed (9/9)
---

## Prompt

Create technical implementation plan for AI Book Assistant RAG fixes feature covering connection issues, guest chatbot mode, authentication, and Qdrant pipeline validation.

## Response snapshot

Completed Phase 0 and Phase 1 planning:

**Phase 0 Research (9 tasks)**:
- Validated Qdrant vector dimension (768 hardcoded → needs dynamic detection)
- Found CORS missing GitHub Pages URL
- Identified chat endpoint requires auth (needs optional)
- Found frontend API URL hardcoded (needs env var)
- Confirmed auth pages missing (login, signup, profile)
- Validated embedding format correct (OpenRouter special format)
- Discovered custom JWT (not Better-Auth despite spec naming)

**Phase 1 Design**:
- data-model.md: 6 entities documented (users, user_background, sessions, chat_sessions, chat_messages, book_chunks)
- contracts/api.md: 10 API endpoints documented with request/response schemas
- quickstart.md: Complete development setup guide
- Agent context updated with new technologies

**Constitution Check**: All 10 rules PASS or N/A

## Outcome

- ✅ Impact: Technical plan complete with research findings, data models, API contracts, and quickstart guide
- 🧪 Tests: Constitution check passed, code scan completed, 9 research tasks resolved
- 📁 Files: 5 files created (plan.md, research.md, data-model.md, contracts/api.md, quickstart.md)
- 🔁 Next prompts: /sp.tasks to break down into actionable implementation tasks
- 🧠 Reflection: Existing codebase is well-structured but needs fixes in CORS, auth optional flow, and frontend API URL. Custom JWT implementation is working (not Better-Auth). Qdrant pipeline needs validation script.

## Evaluation notes (flywheel)

- Failure modes observed: None — plan completed successfully
- Graders run and results (PASS/FAIL): PASS — Constitution check all green
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.tasks to create implementation task list
