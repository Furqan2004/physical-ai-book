---
id: 0017
title: Qdrant Fix and Powerful Roman Urdu Prompts
stage: green
date: 2026-03-06
surface: agent
model: Gemini 2.0 Flash
feature: 004-fix-system-and-auth
branch: 004-fix-system-and-auth
user: furqan
command: sp.implement
labels: ["qdrant", "prompts", "roman-urdu", "ui", "manual-tools"]
links:
  spec: "specs/004-fix-system-and-auth/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - backend/services/qdrant_service.py
  - backend/routers/chat.py
  - backend/routers/personalize.py
  - backend/routers/translate.py
  - frontend/src/components/ChatWidget/ChatWindow.tsx
tests:
  - Qdrant search verification (passed)
---

## Prompt

The user reported Qdrant search failures ('no attribute search'), requested manual tool execution instead of agent tools, asked for personalization in Roman Urdu, and requested powerful prompts with no content limits. Also reported chatbot UI issues.

## Response snapshot

1. Fixed Qdrant integration by using the correct `client.search` pattern.
2. Removed tools from all agents; the backend now executes search and history retrieval manually, providing results as prompt context.
3. Overhauled Personalization prompt to use Roman Urdu and powerful technical teaching instructions.
4. Overhauled Translation prompt for pure Urdu with strict formatting rules.
5. Removed character limits for content transformation.
6. Redesigned Chatbot UI with a modern, rounded, and theme-compatible aesthetic.

## Outcome

- ✅ Impact: High. Fixes the core RAG functionality and significantly improves the output quality and UI.
- 📁 Files: Updated 4 backend and 1 frontend files.
- 🧠 Reflection: Shifting tool execution to the backend gives more control over the data flow and simplifies agent logic, making them more robust against library version changes.

## Evaluation notes (flywheel)

- Failure modes observed: Qdrant client attribute error (fixed).
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
