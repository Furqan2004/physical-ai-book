---
id: "0025"
title: "Autonomous Git workflow for deployment and cleanup"
stage: "misc"
date: "2026-03-07"
surface: "agent"
model: "gemini-2.0-flash"
feature: "004-fix-system-and-auth"
branch: "feat/env-api-and-cleanup"
user: "Furqan2004"
command: "/sp.git"
labels: ["git", "deployment", "env-vars", "cleanup"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "https://github.com/Furqan2004/physical-ai-book/pull/new/feat/env-api-and-cleanup"
files:
  - ".github/workflows/deploy.yml"
  - "frontend/docusaurus.config.ts"
  - "frontend/package.json"
  - "frontend/src/utils/api.ts"
  - "frontend/src/pages/signup.tsx"
  - "frontend/src/pages/signin.tsx"
  - "frontend/src/hooks/useSelectedText.ts"
tests:
  - "manual-backend-connection-test"
---

# Prompt History Record (PHR)

## Context
The user requested to connect the frontend to a specific backend link on Hugging Face using environment variables and to structure/cleanup the frontend folder for deployment.

## Execution
1.  **Environment Variable Setup**: Created `.env` and `.env.example` in `frontend/`.
2.  **Docusaurus Config**: Updated `docusaurus.config.ts` to use `dotenv` and expose `API_URL` via `customFields`.
3.  **API Utility**: Refactored `src/utils/api.ts` to use dynamic `API_URL` with slash robustness and logging.
4.  **Workflow Update**: Modified `.github/workflows/deploy.yml` to support GitHub Secrets.
5.  **Cleanup**: Deleted obsolete `frontend/pages` (Next.js remnant) and unused `better-auth` dependencies.
6.  **Git Workflow**: Created feature branch `feat/env-api-and-cleanup`, committed changes, and pushed to origin.

## Outcome
✅ All changes are staged and pushed to a new feature branch.
✅ Redundant/broken files removed.
✅ Dynamic API connection is live.

## Validation
- PR Link: https://github.com/Furqan2004/physical-ai-book/pull/new/feat/env-api-and-cleanup

## Prompt Text
just need that you set 1 thing in frontend.

for now It's connected with backend with 1 link localhost:8000

check that I'm telling right?

if yes then set this link in env and every where it need load from env.

just because I deploy backend in somewhere and I have that link and I want that I just set link in env and it will directly connect with backend.

and also make everything structure in frontend folder just and accordy to that if needed also set .github/workflow/deploy

## Response Text
I have refactored the frontend to use environment variables for the backend connection and cleaned up the folder structure.

1. **Environment Variable Integration**: Created `frontend/.env` and `frontend/.env.example`.
2. **Docusaurus Config**: Exposed `API_URL` via `customFields`.
3. **API Utility**: Updated `src/utils/api.ts` for dynamic backend connection.
4. **Cleanup**: Removed Next.js remnants and unused auth logic.
5. **Git**: Pushed changes to `feat/env-api-and-cleanup`.
