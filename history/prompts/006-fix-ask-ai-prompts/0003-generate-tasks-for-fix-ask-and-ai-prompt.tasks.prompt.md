---
id: 0003
title: Generate Tasks for Fix Ask and AI Prompt
stage: tasks
date: 2026-03-09
surface: agent
model: gemini-2.0-flash-exp
feature: 006-fix-ask-ai-prompts
branch: 006-fix-ask-ai-prompts
user: furqan
command: /sp.tasks
labels: ["tasks", "frontend-fix", "prompt-engineering", "cleanup"]
links:
  spec: /specs/006-fix-ask-ai-prompts/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/006-fix-ask-ai-prompts/tasks.md
tests:
 - N/A
---

## Prompt

(Arguments passed from orchestrator to /sp.tasks)

## Response snapshot

I have generated the `tasks.md` file for feature **006-fix-ask-ai-prompts**.

### Summary:
- **Total tasks**: 14
- **Phase 1: Setup**: 2 tasks (Git hygiene)
- **Phase 2: Foundational**: 4 tasks (Frontend cleanup)
- **Phase 3: US1 (P1)**: 1 task (Frontend fix)
- **Phase 4: US2 (P2)**: 4 tasks (Backend prompts)
- **Phase 5: Polish**: 3 tasks (Cleanup & validation)

### Key highlights:
- All tasks follow the strict `- [ ] [TaskID] [P?] [Story?]` format.
- Implementation is organized by user story for independent delivery.
- Parallel opportunities identified for AI prompt updates.

## Outcome

- ✅ Impact: High. Detailed implementation roadmap created.
- 🧪 Tests: No tests run; this is a task generation step.
- 📁 Files: Generated tasks.md.
- 🔁 Next prompts: /sp.implement
- 🧠 Reflection: Tasks are granular enough for direct execution.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
