# Implementation Plan: Fix Ask Functionality and AI Prompt Responses

**Branch**: `006-fix-ask-ai-prompts` | **Date**: 2026-03-09 | **Spec**: [specs/006-fix-ask-ai-prompts/spec.md]
**Input**: Feature specification from `/specs/006-fix-ask-ai-prompts/spec.md`

## Summary
The goal is to fix the "Ask about this" frontend component for consistent cross-page support, professionalize the backend AI prompts for better interaction (greetings and domain-specific knowledge), and clean up redundant code in both the frontend and backend. Additionally, Git configuration will be updated for better deployment flexibility.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend), Python 3.11+ (Backend)
**Primary Dependencies**: Docusaurus v3.9, FastAPI, OpenAI Agents SDK (OpenRouter)
**Storage**: Neon Postgres, Qdrant Cloud (Vector DB)
**Testing**: `backend/scripts/validate_backend.py` (Validation script)
**Target Platform**: Linux (Hugging Face / GitHub Pages)
**Project Type**: Fullstack (Frontend + Backend)
**Performance Goals**: Instant popup visibility, <1s AI response latency (streamed)
**Constraints**: Support for logged-in users only on `/physical-ai-book/docs` routes.
**Scale/Scope**: Unified book context with fallback domain-specific knowledge.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] No content generation from agents. (AI prompts will be expert-guided but context-restricted).
- [x] Research agent used for verification (N/A for this task).
- [x] Build must pass.
- [x] Chunks-based implementation.

## Project Structure

### Documentation (this feature)

```text
specs/006-fix-ask-ai-prompts/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # No data model changes required
└── quickstart.md        # Feature setup notes
```

### Source Code (repository root)

```text
backend/
├── ai/
│   ├── chat_agent.py          # Updated prompts
│   └── orchestrator_agent.py  # Updated prompts
├── routers/
│   ├── chat.py                # Updated prompt logic
│   ├── personalize.py         # Updated prompt text
│   └── translate.py           # Updated prompt text
└── .gitignore                 # New file

frontend/
├── src/
│   ├── components/
│   │   └── ChatWidget/
│   │       └── TextSelectionPopup.tsx  # Fixed positioning
│   └── pages/
│       ├── login.tsx                  # Kept and polished
│       ├── signin.tsx                 # [DELETE]
│       └── onboarding.tsx             # [DELETE]
└── .gitignore (root)                  # Updated
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations identified. | N/A |

## Implementation Steps

### Phase 1: Frontend Fixes & Cleanup
1.  **Fix Positioning**: Update `TextSelectionPopup.tsx` to use viewport-relative coordinates for `top` and `left`.
2.  **Remove Duplicates**:
    -   Delete `signin.tsx`.
    -   Update all `/signin` links to point to `/login`.
    -   Update `profile.tsx` redirect to use `/login`.
    -   Check and potentially delete `onboarding.tsx` if fully redundant.

### Phase 2: Backend Prompt Professionalization
1.  **Chat Prompt**: Update `chat_agent.py` to handle greetings and domain questions as a fallback.
2.  **Personalization Prompt**: Refine the expert teacher persona and Roman Urdu instructions in `personalize.py`.
3.  **Translation Prompt**: Refine the pure Urdu technical translation logic in `translate.py`.
4.  **Orchestrator Prompt**: Ensure consistent persona and formatting rules.

### Phase 3: Repository Hygiene
1.  **Git Configuration**:
    -   Create `backend/.gitignore`.
    -   Clean up and structure the root `.gitignore`.
2.  **General Cleanup**:
    -   Scan for any obvious unused code or artifacts.
