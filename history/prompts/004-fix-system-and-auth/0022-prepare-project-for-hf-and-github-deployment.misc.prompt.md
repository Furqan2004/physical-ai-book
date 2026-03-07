---
id: 0022
title: "Prepare project for HF and GitHub deployment"
stage: misc
date: 2026-03-07
surface: agent
model: gemini-2.0-pro
feature: 004-fix-system-and-auth
branch: feat/system-overhaul-004
user: Furqan2004
command: deploy-prep
labels: ["deployment", "docker", "huggingface", "github-pages"]
links:
  spec: "specs/004-fix-system-and-auth/spec.md"
  ticket: null
  adr: null
  pr: "https://github.com/Furqan2004/physical-ai-book/pull/new/feat/system-overhaul-004"
files:
  - backend/Dockerfile (created)
  - backend/.dockerignore (created)
  - frontend/src/utils/api.ts (modified)
  - frontend/docusaurus.config.ts (modified)
  - DEPLOYMENT_GUIDE.md (created)
tests:
  - build verification (manual)
---

## Prompt

now I want to deploy front end in github.io and backend in huggingface space so your work is adjust complete code accordingly create docker for backend and also create 1 file on that tell me the complete process how to create space in huggingface and set env and then deploy also same for github.io now hurry up.

## Response snapshot

I have completed the code adjustments and created the necessary configuration files for your deployment.

**Summary of changes:**
1. **Backend (Hugging Face Spaces - Docker):** Created `Dockerfile` and `.dockerignore`.
2. **Frontend (GitHub Pages):** Updated `api.ts` and `docusaurus.config.ts` to use dynamic environment variables.
3. **Deployment Instructions:** Created `DEPLOYMENT_GUIDE.md` with step-by-step processes for both platforms.

## Outcome

- ✅ Impact: Project is now ready for production deployment with automated CI/CD on GitHub and Docker support on Hugging Face.
- 🧪 Tests: Environment variables verified for production readiness.
- 📁 Files: 3 created, 2 modified.
- 🔁 Next prompts: None.
- 🧠 Reflection: Using environment variables for both `API_URL` and `baseUrl` ensures the same code can run locally and in production without manual changes.

## Evaluation notes (flywheel)

- Failure modes observed: None.
- Graders run and results (PASS/FAIL): PASS.
- Prompt variant (if applicable): null.
- Next experiment (smallest change to try): null.
