# Tasks: System Overhaul & Authentication Fixes

**Input**: Design documents from `/specs/004-fix-system-and-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Install `better-auth` in `frontend/package.json`
- [x] T002 [P] Configure `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` in `frontend/.env.local`
- [x] T003 [P] Verify `NEON_DATABASE_URL` in `backend/.env` for shared use with Better Auth
- [x] T004 [P] Update `backend/requirements.txt` with any missing dependencies for agents

---

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T005 Setup Better Auth database tables in Neon PostgreSQL using `npx better-auth generate` or similar
- [x] T006 Implement Better Auth server-side configuration in `frontend/src/utils/auth.ts` (or equivalent)
- [x] T007 Configure Better Auth API route in `frontend/pages/api/auth/[...better-auth].ts`
- [x] T008 [P] Implement `backend/scripts/setup_db.py` to ensure user profile and history tables exist in Neon
- [x] T009 [P] Initialize Qdrant Cloud client and verify collection in `backend/scripts/create_qdrant_collection.py`

---

## Phase 3: User Story 1 - Seamless Authentication Flow (Priority: P1) 🎯 MVP

**Goal**: Users can sign up, log in, and reset passwords via Better Auth with correct redirects.

**Independent Test**: Verify Signup button redirect, check Forgot Password page existence, and confirm successful login/session creation.

### Implementation for User Story 1

- [x] T010 [US1] Update Signup button `href` in `frontend/src/pages/signin.tsx` (or equivalent Login page) to `/physical-ai-book/signup`
- [x] T011 [US1] Create the Forgot Password page at `frontend/src/pages/forgot-password.tsx` (mapped to `/physical-ai-book/forgot-password`)
- [x] T012 [US1] Update "Forgot Password" link in `frontend/src/pages/login.tsx` to point to the new path
- [x] T013 [US1] Implement Signup form using Better Auth client SDK in `frontend/src/pages/signup.tsx`
- [x] T014 [US1] Implement Login form using Better Auth client SDK in `frontend/src/pages/login.tsx`
- [x] T015 [US1] Implement Password Reset request flow in `frontend/src/pages/forgot-password.tsx`

---

## Phase 4: User Story 2 - Context-Aware Chatbot (Priority: P1)

**Goal**: Restrict chatbot visibility to documentation pages only.

**Independent Test**: Chatbot is visible on `/physical-ai-book/docs/*` but hidden on `/signup` and other non-docs pages.

### Implementation for User Story 2

- [x] T016 [US2] Wrap application or layout in `frontend/src/theme/Root.tsx` to include the chatbot component
- [x] T017 [US2] Implement path-based conditional rendering in `frontend/src/components/ChatWidget/index.tsx` using Docusaurus `useLocation` hook
- [x] T018 [US2] Verify chatbot works correctly (sends/receives messages) after path scoping

---

## Phase 5: User Story 5 - Reliable Data Persistence (Priority: P1)

**Goal**: Ensure chat history and vector embeddings are saved and retrieved correctly.

**Independent Test**: Chat history persists after refresh (Neon), and new content is searchable (Qdrant).

### Implementation for User Story 5

- [x] T019 [P] [US5] Verify and fix chat history saving logic in `backend/services/db_service.py`
- [x] T020 [P] [US5] Verify and fix vector embedding storage logic in `backend/services/qdrant_service.py`
- [x] T021 [US5] Implement retrieval validation in `backend/routers/chat.py` to ensure relevant results from Qdrant

---

## Phase 6: User Story 4 - Frontend-Driven Onboarding (Priority: P2)

**Goal**: Move signup questions logic from backend to frontend.

**Independent Test**: Complete signup flow and see the questions form handled entirely by the frontend before final backend submission.

### Implementation for User Story 4

- [x] T022 [US4] Create a multi-step form component for onboarding in `frontend/src/components/OnboardingForm.tsx`
- [x] T023 [US4] Integrate `OnboardingForm.tsx` into the post-signup redirect flow in `frontend/src/pages/onboarding.tsx`
- [x] T024 [US4] Implement final submission of onboarding data to `backend/routers/auth.py` (matching the new contract)
- [x] T025 [US4] Remove or deactivate legacy question logic from the Python backend

---

## Phase 7: User Story 3 - Robust Agent Interactions (Priority: P2)

**Goal**: Fix Personalization and Translation agents and give them full tool access.

**Independent Test**: Agents successfully use tools (search, translate) and provide clear, bug-free personalized responses.

### Implementation for User Story 3

- [x] T026 [P] [US3] Centralize tool registration in `backend/ai/orchestrator_agent.py` to include all available tools
- [x] T027 [US3] Fix logic and error handling in `backend/ai/personalize_agent.py` (or equivalent orchestrator call)
- [x] T028 [US3] Fix logic and error handling in `backend/ai/translate_agent.py` (or equivalent orchestrator call)
- [x] T029 [US3] Ensure all agents generate clear, bug-free responses in `backend/ai/chat_agent.py`

---

## PHASE 2: BACKEND (User Approval Received)

- [x] T009 [P] Neon PostgreSQL Verify and Fix
- [x] T010 [P] Vector Embeddings Creation Fix
- [x] T011 [P] Qdrant Cloud Storage Implementation
- [x] T012 [P] Qdrant Retrieval and Calling Fix
- [x] T013 [P] Qdrant Tool Verification
- [x] T014 [P] Agent Backend Tool Access Registration

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T030 Run `npm run build` in `frontend/` to ensure no build errors after changes
- [x] T031 Validate end-to-end flow from signup to personalized docs chat
- [x] T032 [P] Update `specs/004-fix-system-and-auth/quickstart.md` with final verification steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 & 2**: MUST be completed first to establish the auth and DB foundation.
- **Phase 3 (Auth)**: Highest priority after foundation.
- **Phase 4 (Chatbot Scoping)**: Can be done in parallel with Phase 3.
- **Phase 5 (Data Persistence)**: Critical for RAG functionality.
- **Phase 6 & 7**: Priority P2, follow-up on core fixes.

### User Story Dependencies

- **US4 (Onboarding)** depends on **US1 (Auth)** being functional.
- **US3 (Agents)** depends on **US5 (Persistence)** for context retrieval.

---

## Parallel Example: User Story 5

```bash
# Launch persistence tasks together:
Task: "Verify and fix chat history saving logic in backend/services/db_service.py"
Task: "Verify and fix vector embedding storage logic in backend/services/qdrant_service.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 5)

1. Complete Setup & Foundation.
2. Fix Auth redirects and login (US1).
3. Scope Chatbot to docs (US2).
4. Ensure history and embeddings are reliable (US5).
5. Request user approval before proceeding to P2 stories (US4, US3).
