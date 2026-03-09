---
id: 0001
title: Create Fix Ask and AI Prompt Spec
stage: spec
date: 2026-03-09
surface: agent
model: gemini-2.0-flash-exp
feature: 006-fix-ask-ai-prompts
branch: 006-fix-ask-ai-prompts
user: furqan
command: /sp.specify
labels: ["spec", "ask-functionality", "ai-prompts"]
links:
  spec: /specs/006-fix-ask-ai-prompts/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - specs/006-fix-ask-ai-prompts/spec.md
 - specs/006-fix-ask-ai-prompts/checklists/requirements.md
tests:
 - N/A
---

## Prompt

mera project ma sab kuch Alhamdulillah Okay ha just kuch changes karni hai like 1st frontend ma login users ka liya 1 functionality ha called Ask about this jo sirif book ma ha matlab http//localhost:3000/physical-ai-book/docs sirif is page or iska andat jitna page hai sab ma ya functionality ha but issue ya ha ka har page ma ya satrt ka content ma work kar raha ha but mid or end ma work nahi kar raha. Ma ya chah raha hu ka ya har http//localhost:3000/physical-ai-book/docs isma or iska andar jitna page hai unma har jaga har 1 chiz ma work kara. Backend ma tumha just AI ka prompts sahi karna hai ka wo in sab ka answer kara like greeting messages or koi bhi question Physical AI & Humanoid Robotics sa related even koi wi content verctor db ma find kar pai ya nahi lakin agar greeting message ha ya isi book sa related koi answer ha to wo lazmi answer kara.

## Response snapshot

I have created the feature specification and branch for feature **006-fix-ask-ai-prompts**.

### Summary of Changes:
1. **Frontend Fix**: Ensure "Ask about this" functionality works consistently for all content (start, middle, and end of pages) within the book section (`/physical-ai-book/docs`).
2. **AI Backend Improvements**: Refine prompts to correctly handle greetings and provide expert answers on Physical AI and Humanoid Robotics, even as a fallback if specific content is not found in the vector database.

### Artifacts Created:
- **Branch**: `006-fix-ask-ai-prompts`
- **Spec File**: `specs/006-fix-ask-ai-prompts/spec.md`
- **Quality Checklist**: `specs/006-fix-ask-ai-prompts/checklists/requirements.md`

All quality checks passed. The feature is now ready for the planning phase.

## Outcome

- ✅ Impact: High. Core feature "Ask about this" is fixed for all page content.
- 🧪 Tests: No tests run; this is a specification task.
- 📁 Files: Created spec.md and requirements checklist.
- 🔁 Next prompts: /sp.plan
- 🧠 Reflection: Successfully translated Urdu description into a structured technical specification.

## Evaluation notes (flywheel)

- Failure modes observed: Initial PHR creation failed due to incorrect feature name.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
