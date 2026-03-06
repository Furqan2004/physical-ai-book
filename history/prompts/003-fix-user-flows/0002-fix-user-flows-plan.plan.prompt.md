---
id: 0002
title: fix-user-flows-plan
stage: plan
date: 2026-03-06
surface: agent
model: qwen-coder-plus
feature: 003-fix-user-flows
branch: 003-fix-user-flows
user: furqan
command: /sp.plan Fix routing, authentication UI, and AI features
labels: ["planning","routing","authentication","streaming","navbar","ai-features"]
links:
  spec: specs/003-fix-user-flows/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/003-fix-user-flows/plan.md
tests:
 - Codebase analysis (frontend + backend)
 - API contract definitions
 - Streaming to non-streaming conversion plan
---

## Prompt

/sp.plan command to create technical execution plan for fixing:
1. Routing issues (pages not connected, missing root, logout redirect)
2. Three broken features (Ask AI popup, Personalize, Urdu Translation)
3. Navbar structure (messy buttons)
4. Remove AI streaming (complete response first, then display)

## Response snapshot

Created comprehensive implementation plan at `specs/003-fix-user-flows/plan.md`:

**Phase 0 - Research Completed**:
- Full frontend codebase analysis (all pages, components, hooks, utils)
- Full backend codebase analysis (all routers, services, endpoints)
- Identified 3 streaming endpoints: chat.py, personalize.py, translate.py
- All use `Runner.run_streamed()` → need conversion to `Runner.run_sync()`
- Frontend already has text selection hook and popup components
- Auth system functional but password verification commented out in signin

**Phase 1 - Design**:
- API contracts defined for non-streaming endpoints
- Frontend changes: api.ts, ChapterPersonalize.tsx, ChapterTranslate.tsx
- Navbar integration plan using AuthButtons component
- Logout redirect fix in Root.tsx
- Testing guide with backend/frontend test commands

**Constitution Check**: ✅ PASS - All 10 principles satisfied

**Key Files to Modify**:
Backend (3 files):
- backend/routers/chat.py (lines 52-89)
- backend/routers/personalize.py (lines 19-44)
- backend/routers/translate.py (lines 19-44)

Frontend (5 files):
- frontend/src/utils/api.ts (add apiFetchComplete)
- frontend/src/components/ChapterPersonalize.tsx (remove streaming)
- frontend/src/components/ChapterTranslate.tsx (remove streaming)
- frontend/src/theme/Root.tsx (fix logout redirect)
- frontend/docusaurus.config.ts (navbar integration)

## Outcome

- ✅ Impact: Complete technical plan with exact file paths and line numbers
- 🧪 Tests: Testing guide included for backend and frontend verification
- 📁 Files: 1 file created (plan.md with 464 lines)
- 🔁 Next prompts: /sp.tasks to break into implementation tasks
- 🧠 Reflection: Plan follows agent-first approach - read codebase thoroughly before touching any code

## Evaluation notes (flywheel)

- Failure modes observed: None - plan completed successfully
- Graders run and results (PASS/FAIL): PASS - Constitution check passed
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Start with backend streaming removal (chat.py first)
