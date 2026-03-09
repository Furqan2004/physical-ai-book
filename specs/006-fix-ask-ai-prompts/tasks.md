# Tasks: Fix Ask Functionality and AI Prompt Responses

**Input**: Design documents from `/specs/006-fix-ask-ai-prompts/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, quickstart.md

**Tests**: Tests are performed via the existing `backend/scripts/validate_backend.py` and manual verification as outlined in `quickstart.md`.

## Phase 1: Setup (Repository Hygiene)

**Purpose**: Repository configuration and Git hygiene

- [X] T001 Structure and clean root `.gitignore`
- [X] T002 Create `backend/.gitignore` to support independent backend deployment

---

## Phase 2: Foundational (Frontend Cleanup)

**Purpose**: Remove redundant code and unify authentication routes

**⚠️ CRITICAL**: This phase ensures a clean state before fixing the "Ask about this" functionality.

- [X] T003 Delete redundant signin page `frontend/src/pages/signin.tsx`
- [X] T004 Delete redundant onboarding page `frontend/src/pages/onboarding.tsx`
- [X] T005 Delete redundant onboarding component `frontend/src/components/OnboardingForm.tsx`
- [X] T006 Update the redirect in `frontend/src/pages/profile.tsx` from `/signin` to `/login`

**Checkpoint**: Frontend is clean of redundant auth files; all routes point to unified login/signup.

---

## Phase 3: User Story 1 - Consistent "Ask about this" (Priority: P1) 🎯 MVP

**Goal**: Fix the positioning of the "Ask about this" popup so it works anywhere on the page, regardless of scroll position.

**Independent Test**: Navigate to `/physical-ai-book/docs`, scroll to the middle/end, select text, and verify the popup appears correctly above the selection.

### Implementation for User Story 1

- [X] T007 [US1] Fix coordinate calculation by removing scroll offsets in `frontend/src/components/ChatWidget/TextSelectionPopup.tsx`

**Checkpoint**: "Ask about this" is fully functional and correctly positioned throughout the book documentation.

---

## Phase 4: User Story 2 - Intelligent AI Prompt Responses (Priority: P2)

**Goal**: Professionalize AI responses, specifically handling greetings and domain-specific knowledge fallbacks.

**Independent Test**: Use the chatbot to send greetings and ask general Physical AI questions; verify responses are professional and technically accurate.

### Implementation for User Story 2

- [X] T008 [P] [US2] Professionalize `ChatAgent` instructions to allow greetings and domain fallbacks in `backend/ai/chat_agent.py`
- [X] T009 [P] [US2] Update personalization prompt with professional Roman Urdu instructions in `backend/routers/personalize.py`
- [X] T010 [P] [US2] Update translation prompt with professional pure Urdu instructions in `backend/routers/translate.py`
- [X] T011 [P] [US2] Update orchestrator agent instructions for consistency in `backend/ai/orchestrator_agent.py`

**Checkpoint**: AI agents provide professional, context-aware, and domain-expert responses.

---

## Phase 5: Polish & Backend Cleanup

**Purpose**: Final verification and removal of any remaining obsolete code.

- [X] T012 Scan `backend/` for useless or obsolete code and remove it
- [X] T013 Run comprehensive validation script `backend/scripts/validate_backend.py`
- [X] T014 [P] Perform manual validation of all scenarios in `specs/006-fix-ask-ai-prompts/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Can start after Setup.
- **User Story 1 (Phase 3)**: Can start after Foundational phase cleanup.
- **User Story 2 (Phase 4)**: Independent of US1; can start after Foundational phase.
- **Polish (Phase 5)**: Depends on completion of Phase 3 and Phase 4.

### Parallel Opportunities

- T008, T009, T010, and T011 (AI Prompts) can be implemented in parallel.
- Manual validation (T014) can start as soon as Phase 3 or Phase 4 items are ready for testing.

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 & 2 for a clean project state.
2. Implement T007 to fix the core "Ask about this" functionality.
3. Validate US1 immediately as it is the highest priority for the user.

### Incremental Delivery

1. Foundation & US1 (Frontend Fix) -> First Delivery.
2. US2 (AI Prompts) -> Second Delivery.
3. Final Cleanup & Validation -> Completion.
