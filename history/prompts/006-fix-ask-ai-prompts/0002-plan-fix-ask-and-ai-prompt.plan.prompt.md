---
id: 0002
title: Plan Fix Ask and AI Prompt
stage: plan
date: 2026-03-09
surface: agent
model: gemini-2.0-flash-exp
feature: 006-fix-ask-ai-prompts
branch: 006-fix-ask-ai-prompts
user: furqan
command: /sp.plan
labels: ["plan", "frontend-fix", "prompt-engineering", "cleanup"]
links:
  spec: /specs/006-fix-ask-ai-prompts/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/006-fix-ask-ai-prompts/plan.md
 - specs/006-fix-ask-ai-prompts/research.md
 - specs/006-fix-ask-ai-prompts/quickstart.md
tests:
 - N/A
---

## Prompt

/sp.plan 1st go to the frontend and check what's the problem by checking every file properly and then take and action to correct the problem also make sure that use any code present in frontend that is not used in the code.

after when you solved frontend issue then go to the backend folder and check the system prompt all of these AI orcastration, chat, personalization and translation and correct all of them prompt professional and then completely scan backend that there is no any useless code present and after that 1st structure root .gitignore and the 1 special thing do only in backend folder that make .gitignore file inside backend folder because I upload whole code in github and after that in huggingface I only upload backend folder also in git I also upload the backend so adjust it accordingly.

## Response snapshot

I have completed the planning phase for feature **006-fix-ask-ai-prompts**.

### Summary of Decisions:
1.  **Frontend Fix**: Identified a positioning bug in `TextSelectionPopup.tsx` where `window.scrollY` was incorrectly added to viewport-relative coordinates.
2.  **Cleanup**: Identified redundant pages (`signin.tsx`, `onboarding.tsx`) and components (`OnboardingForm.tsx`) for deletion.
3.  **AI Prompts**: Planned a rewrite of `ChatAgent`, `Personalize`, and `Translate` prompts to handle greetings and domain-specific knowledge professionally.
4.  **Git/Hygiene**: Planned the creation of `backend/.gitignore` and a cleanup of the root `.gitignore`.

### Artifacts Created:
- **Plan**: `specs/006-fix-ask-ai-prompts/plan.md`
- **Research**: `specs/006-fix-ask-ai-prompts/research.md`
- **Quickstart**: `specs/006-fix-ask-ai-prompts/quickstart.md`

### Next Steps:
Run `/sp.tasks` to break the plan into actionable tasks.

## Outcome

- ✅ Impact: High. Comprehensive plan for both frontend and backend improvements.
- 🧪 Tests: No tests run; this is a planning task.
- 📁 Files: Generated plan, research, and quickstart docs.
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: Thorough investigation of the frontend bug led to a clear, simple fix (viewport coordinates vs scroll offsets).

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
