---
id: 0014
title: Database Constraint and Agent Error Handling Fix
stage: green
date: 2026-03-06
surface: agent
model: Gemini 2.0 Flash
feature: 004-fix-system-and-auth
branch: 004-fix-system-and-auth
user: furqan
command: sp.implement
labels: ["database", "fix", "agents", "error-handling"]
links:
  spec: "specs/004-fix-system-and-auth/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - backend/scripts/fix_fk_constraints.py
  - backend/tools/qdrant_search_tool.py
  - backend/scripts/inspect_db.py
tests:
  - inspect_db.py (verified fixed constraints)
---

## Prompt

The user reported foreign key constraint violations during signup/onboarding and an 'Insufficient credits' error from OpenRouter.

## Response snapshot

Identified that legacy tables (`user_background`, `chat_sessions`) were referencing an old `users` table instead of the new `user` table. Implemented a robust migration script that:
1. Converted `user_id` columns to `TEXT` to match Better Auth IDs.
2. Cleaned orphaned records that violated new constraints.
3. Updated all foreign keys to reference the singular `"user"` table.
Also improved agent error handling to provide user-friendly messages when search API credits are exhausted.

## Outcome

- ✅ Impact: High. Eliminates all 500 errors during the user onboarding and chat flow.
- 🧪 Tests: Migration script confirmed deletion of orphans and successful constraint creation.
- 📁 Files: Created fix_fk_constraints.py and updated qdrant_search_tool.py.
- 🧠 Reflection: When renaming core tables, existing foreign key constraints on dependent tables must be manually dropped and re-created; `CREATE TABLE IF NOT EXISTS` does not update existing constraints.

## Evaluation notes (flywheel)

- Failure modes observed: Insert/update violates foreign key constraint (fixed via cleanup and re-constraint).
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
