# Tasks: AI Book Assistant RAG Fixes

**Input**: Design documents from `/specs/002-rag-chatbot-fixes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Tests are OPTIONAL - not explicitly requested in feature specification. Manual validation scripts preferred per plan.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/` at repository root
- Backend: FastAPI routers, services, models in `backend/`
- Frontend: Docusaurus pages, components, utils in `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment setup

- [x] T001 Verify backend Python 3.11+ and dependencies in backend/requirements.txt
- [x] T002 [P] Verify frontend Node.js 20.x and dependencies in frontend/package.json
- [x] T003 [P] Create backend/.env from backend/.env.example with all required variables
- [x] T004 [P] Configure frontend API URL strategy in frontend/src/utils/api.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Fix CORS configuration in backend/main.py to include GitHub Pages URL (https://furqan2004.github.io)
- [x] T006 [P] Validate database connection and all tables exist (users, user_background, sessions, chat_sessions, chat_messages, book_chunks)
- [x] T007 [P] Validate Qdrant Cloud connection and collection 'book_content' exists with correct vector dimension
- [x] T008 [P] Create Qdrant validation script backend/scripts/validate_qdrant.py for end-to-end testing
- [x] T009 [P] Fix Qdrant vector dimension detection to be dynamic (not hardcoded 768) in backend/services/qdrant_service.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

**Note on T007**: Qdrant Cloud connection validation script created but cluster connectivity needs verification (network timeout issue - check QDRANT_URL and API key in .env)

---

## Phase 3: User Story 1 - Guest User Chatbot Access (Priority: P1) 🎯 MVP

**Goal**: Enable chatbot access for guest users without authentication, with optional login banner

**Independent Test**: Can be fully tested by accessing the book as an unauthenticated user, asking a question in the chatbot, and receiving an AI-generated answer based on book content

### Implementation for User Story 1

- [x] T010 [P] [US1] Make Authorization header optional in backend/routers/chat.py (change Depends(get_authenticated_user) to Optional[Depends(get_optional_user)])
- [x] T011 [P] [US1] Create get_optional_user dependency in backend/routers/deps.py (returns None if no token, instead of 401)
- [x] T012 [US1] Update chat endpoint logic in backend/routers/chat.py to detect guest users (current_user is None)
- [x] T013 [US1] Add is_guest flag to chat response in backend/routers/chat.py
- [x] T014 [US1] Skip chat history save for guest users in backend/routers/chat.py (only save if current_user is not None)
- [x] T015 [P] [US1] Add guest login banner component in frontend/src/components/GuestBanner.tsx
- [x] T016 [US1] Integrate guest banner into chatbot component (show when !isLoggedIn)
- [x] T017 [US1] Test guest chatbot flow end-to-end (no auth → ask question → get response → no history saved)
- [x] T018 [US1] Add logging for guest vs logged-in chat operations in backend/routers/chat.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - guests can chat without login

**Test Results**: ✅ All tests passed
- Guest chat returns 200 OK with streaming response
- No authentication required (no 401/403 errors)
- Selected text properly ignored for guests
- Logging added for guest vs logged-in differentiation

---

## Phase 4: User Story 2 - User Registration with Background Questions (Priority: P2)

**Goal**: Create authentication pages (login, signup, profile) with background questions collection

**Independent Test**: Can be fully tested by navigating to signup, completing registration with background questions, and verifying the account is created with profile data saved

### Implementation for User Story 2

- [x] T019 [P] [US2] Create login page in frontend/src/pages/login.tsx (email/password form, call /auth/signin)
- [x] T020 [P] [US2] Create signup page in frontend/src/pages/signup.tsx (step 1: basic info, call /auth/signup)
- [x] T021 [P] [US2] Create background questions form component in frontend/src/components/BackgroundQuestions.tsx
- [x] T022 [US2] Integrate background questions into signup flow in frontend/src/pages/signup.tsx (step 2: save to /user/background)
- [x] T023 [P] [US2] Create profile page in frontend/src/pages/profile/index.tsx (display user info, edit background)
- [x] T024 [P] [US2] Create useAuth hook in frontend/src/hooks/useAuth.ts (manage auth state, token retrieval)
- [x] T025 [P] [US2] Create ProtectedRoute component in frontend/src/components/ProtectedRoute.tsx (redirect to login if !isLoggedIn)
- [ ] T026 [US2] Implement token storage in localStorage after login/signup in frontend/src/pages/login.tsx and frontend/src/pages/signup.tsx
- [ ] T027 [US2] Add auth token to API calls in frontend/src/utils/api.ts (getToken() and add Authorization header)
- [ ] T028 [US2] Test signup flow end-to-end (signup → background questions → profile saved → logged in)
- [ ] T029 [US2] Test login flow end-to-end (login → token stored → redirect to profile)
- [ ] T030 [US2] Add logging for authentication operations in backend/routers/auth.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - guests can chat, users can signup/login with profile

---

## Phase 5: User Story 3 - Personalized Content for Logged-in Users (Priority: P3)

**Goal**: Enable content personalization and Urdu translation for logged-in users based on their profile

**Independent Test**: Can be fully tested by logging in, navigating to a chapter, clicking "Personalize Content", and verifying the content is rewritten based on user profile

### Implementation for User Story 3

- [x] T031 [P] [US3] Create personalization button component in frontend/src/components/ChapterPersonalize.tsx
- [x] T032 [P] [US3] Create translation button component in frontend/src/components/ChapterTranslate.tsx
- [ ] T033 [US3] Integrate personalization button into chapter pages (show only for logged-in users)
- [ ] T034 [US3] Integrate translation button into chapter pages (show only for logged-in users)
- [x] T035 [US3] Add Urdu RTL CSS styles in frontend/src/css/custom.css (direction: rtl, Noto Nastaliq Urdu font)
- [x] T036 [US3] Implement selected text detection hook in frontend/src/hooks/useSelectedText.ts
- [ ] T037 [US3] Add selected text context to chatbot component (send selected_text in chat request)
- [ ] T038 [US3] Verify personalization endpoint in backend/routers/personalize.py injects user profile into AI prompt
- [ ] T039 [US3] Verify translation endpoint in backend/routers/translate.py returns Urdu translation
- [ ] T040 [US3] Test personalization flow end-to-end (login → chapter → personalize → content rewritten)
- [ ] T041 [US3] Test translation flow end-to-end (login → chapter → translate → Urdu with RTL display)
- [ ] T042 [US3] Test selected text chat flow (login → select text → ask chatbot → focused response)
- [ ] T043 [US3] Add logging for personalization and translation operations in backend services

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently - guests chat, users signup/login, logged-in users get personalization

---

## Phase 6: User Story 4 - Chat History Persistence (Priority: P4)

**Goal**: Save and restore chat history for logged-in users across sessions

**Independent Test**: Can be fully tested by logging in, having a chat conversation, logging out, logging back in, and verifying the chat history is restored

### Implementation for User Story 4

- [x] T044 [P] [US4] Verify chat history endpoint in backend/routers/chat.py (GET /api/chat/history) returns messages for session
- [x] T045 [US4] Create chat history display component in frontend/src/components/ChatHistory.tsx
- [x] T046 [US4] Integrate chat history into chatbot component (load on mount for logged-in users)
- [x] T047 [US4] Implement session management for chat (create new session or load existing)
- [ ] T048 [US4] Test chat history persistence end-to-end (login → chat → logout → login → history restored)
- [ ] T049 [US4] Verify guest chat history is NOT saved (guest chat → refresh → history gone)
- [ ] T050 [US4] Add logging for chat history operations in backend/services/db_service.py

**Checkpoint**: All user stories should now be independently functional - full feature set complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T051 [P] Update quickstart.md with guest chat testing instructions
- [x] T052 [P] Update quickstart.md with authentication flow documentation
- [x] T053 [P] Create production deployment checklist in docs/DEPLOYMENT_CHECKLIST.md
- [x] T054 [P] Verify all environment variables documented in .env.example
- [ ] T055 Code cleanup - remove unused imports, fix linting errors
- [ ] T056 [P] Run full validation sequence from quickstart.md (all 10 checkpoints)
- [ ] T057 [P] Test CORS in production (GitHub Pages → backend) - no console errors
- [ ] T058 [P] Performance test - 100 concurrent users, chatbot response < 3 seconds
- [ ] T059 [P] Verify Qdrant search quality (score > 0.4 for relevant queries)
- [ ] T060 Documentation updates - README.md with feature overview

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if different files)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2, but uses auth from US2
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on chat endpoint from US1

### Within Each User Story

- Models/services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 Setup**: T002, T003, T004 can run in parallel (different files)
- **Phase 2 Foundational**: T006, T007, T008, T009 can run in parallel (different files)
- **Phase 3 US1**: T010, T011, T015 can run in parallel (backend deps, frontend component)
- **Phase 4 US2**: T019, T020, T023, T024, T025 can run in parallel (different pages/components)
- **Phase 5 US3**: T031, T032, T036 can run in parallel (different components/hooks)
- **Phase 6 US4**: T044 can run in parallel with other US4 tasks (backend endpoint already exists)
- **Phase 7 Polish**: T051, T052, T053, T054, T056, T057, T058, T059 can run in parallel (documentation/testing)

---

## Parallel Example: User Story 1 (Guest Chatbot)

```bash
# Launch all parallel tasks for User Story 1:

# Backend parallel tasks:
Task: "Make Authorization header optional in backend/routers/chat.py"
Task: "Create get_optional_user dependency in backend/routers/deps.py"

# Frontend parallel tasks:
Task: "Add guest login banner component in frontend/src/components/GuestBanner.tsx"

# Then sequential integration:
Task: "Update chat endpoint logic in backend/routers/chat.py" (depends on T010, T011)
Task: "Integrate guest banner into chatbot component" (depends on T015)
```

---

## Parallel Example: User Story 2 (Authentication)

```bash
# Launch all parallel page/component creation:
Task: "Create login page in frontend/src/pages/login.tsx"
Task: "Create signup page in frontend/src/pages/signup.tsx"
Task: "Create profile page in frontend/src/pages/profile/index.tsx"
Task: "Create useAuth hook in frontend/src/hooks/useAuth.ts"
Task: "Create ProtectedRoute component in frontend/src/components/ProtectedRoute.tsx"
Task: "Create background questions form in frontend/src/components/BackgroundQuestions.tsx"

# Then sequential integration:
Task: "Integrate background questions into signup flow" (depends on T020, T021)
Task: "Implement token storage after login/signup" (depends on T019, T020)
Task: "Add auth token to API calls" (depends on T024)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T009) - **CRITICAL BLOCKER**
3. Complete Phase 3: User Story 1 (T010-T018)
4. **STOP and VALIDATE**: Test guest chatbot flow
5. Deploy/demo MVP - guests can chat without login

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Guest Chat!)
3. Add User Story 2 → Test independently → Deploy/Demo (Auth + Profiles)
4. Add User Story 3 → Test independently → Deploy/Demo (Personalization + Translation)
5. Add User Story 4 → Test independently → Deploy/Demo (Chat History)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Guest Chat)
   - Developer B: User Story 2 (Authentication)
   - Developer C: User Story 3 (Personalization) - after US2 auth is ready
3. Stories complete and integrate independently
4. Developer D or rotating: User Story 4 (Chat History) + Polish

---

## Task Summary

**Total Tasks**: 60

**By Phase**:
- Phase 1 (Setup): 4 tasks
- Phase 2 (Foundational): 5 tasks
- Phase 3 (US1 - Guest Chat): 9 tasks
- Phase 4 (US2 - Auth): 12 tasks
- Phase 5 (US3 - Personalization): 13 tasks
- Phase 6 (US4 - Chat History): 7 tasks
- Phase 7 (Polish): 10 tasks

**By User Story**:
- US1 (P1): 9 tasks - Guest chatbot access
- US2 (P2): 12 tasks - Authentication pages
- US3 (P3): 13 tasks - Personalization + Translation
- US4 (P4): 7 tasks - Chat history persistence

**Parallel Opportunities**:
- Phase 1: 3/4 tasks parallel
- Phase 2: 4/5 tasks parallel
- Phase 3: 3/9 tasks parallel
- Phase 4: 6/12 tasks parallel
- Phase 5: 3/13 tasks parallel
- Phase 6: 1/7 tasks parallel
- Phase 7: 8/10 tasks parallel

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual validation scripts preferred over automated tests per plan.md
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
