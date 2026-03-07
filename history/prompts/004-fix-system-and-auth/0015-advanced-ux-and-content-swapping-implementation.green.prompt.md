---
id: 0015
title: Advanced UX and Content Swapping Implementation
stage: green
date: 2026-03-06
surface: agent
model: Gemini 2.0 Flash
feature: 004-fix-system-and-auth
branch: 004-fix-system-and-auth
user: furqan
command: sp.implement
labels: ["ux", "markdown", "agents", "frontend", "dynamic-content"]
links:
  spec: "specs/004-fix-system-and-auth/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/ChatWidget/ChatWindow.tsx
  - frontend/src/theme/Root.tsx
  - frontend/src/theme/DocItem/Layout/index.tsx
  - frontend/src/components/ChapterButtons/PersonalizeButton.tsx
  - frontend/src/components/ChapterButtons/TranslateButton.tsx
  - backend/ai/orchestrator_agent.py
tests:
  - react-markdown integration (verified)
---

## Prompt

The user wanted:
1. 'Ask AI' popup to directly send text to chatbot.
2. Personalization and Translation to swap English content with AI markdown on the same page.
3. Agents to process data directly without tools.

## Response snapshot

Implemented a sophisticated content-swapping mechanism in the Docusaurus frontend.
1. Updated `ChatWindow` to auto-trigger message handling when opened via text selection.
2. Created a global `PageContentContext` to manage the state of the current document.
3. Overrode `DocItemLayout` to conditionally render `ReactMarkdown` when AI content is active, effectively swapping the page content.
4. Simplified `OrchestratorAgent` by removing all tools, focusing strictly on direct markdown transformation.

## Outcome

- ✅ Impact: High. Provides a seamless, magical experience for personalization and translation.
- 📁 Files: Modified ~6 key frontend and backend files.
- 🧠 Reflection: Managing page state in Docusaurus requires careful coordination between theme overrides and component-level triggers; using a context provider in Root was the correct architectural choice here.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
