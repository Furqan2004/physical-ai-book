# Tasks: Fix User Flows and AI Features

**Input**: Design documents from `/specs/003-fix-user-flows/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Manual testing only - no automated test tasks included

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/` at repository root
- Paths shown below are absolute paths from codebase analysis

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and dependencies

- [ ] T001 Verify existing project structure matches plan.md (backend/, frontend/ directories)
- [ ] T002 [P] Verify backend dependencies in `backend/requirements.txt` (FastAPI, OpenAI Agents SDK, python-jose)
- [ ] T003 [P] Verify frontend dependencies in `frontend/package.json` (@docusaurus/core v3.9.x, React)
- [ ] T004 [P] Confirm backend virtual environment exists at `backend/venv/`
- [ ] T005 [P] Confirm frontend node_modules exists at `frontend/node_modules/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 [P] Verify backend server starts successfully: `cd backend && source venv/bin/activate && python main.py`
- [ ] T007 [P] Verify frontend dev server starts: `cd frontend && npm run start`
- [ ] T008 [P] Test backend health endpoint: `curl http://localhost:8000/health`
- [ ] T009 [P] Test frontend root page accessible: `curl http://localhost:3000/physical-ai-book/`
- [ ] T010 Verify auth context is working in `frontend/src/theme/Root.tsx` (AuthProvider renders correctly)
- [ ] T011 Verify localStorage token management exists in `frontend/src/utils/api.ts` (`getToken()`, `getUser()`)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Complete Page Routing System (Priority: P1) 🎯 MVP

**Goal**: All routes functional, logout redirects to `/`, all links point to valid routes

**Independent Test**: Navigate to each route (`/`, `/login`, `/signin`, `/signup`, `/profile`, `/onboarding`) and verify correct page loads. Test logout redirect to `/`.

### Implementation for User Story 1

- [x] T012 [P] [US1] Verify root page exists at `frontend/src/pages/index.tsx` and renders correctly at `/`
- [x] T013 [P] [US1] Verify login page exists at `frontend/src/pages/login.tsx` and renders at `/login`
- [x] T014 [P] [US1] Verify signup page exists at `frontend/src/pages/signup.tsx` and renders at `/signup`
- [x] T015 [P] [US1] Verify profile page exists at `frontend/src/pages/profile/index.tsx` and renders at `/profile` (protected route)
- [x] T016 [P] [US1] Verify onboarding page exists at `frontend/src/pages/onboarding.tsx` and renders at `/onboarding` (protected route)
- [x] T017 [P] [US1] Verify signin page exists at `frontend/src/pages/signin.tsx` and renders at `/signin`
- [X] T018 [US1] Fix logout redirect in `frontend/src/theme/Root.tsx` - add `window.location.href = '/'` after clearing auth state
- [ ] T019 [US1] Audit all navigation links in `frontend/src/components/AuthButtons.tsx` - ensure correct route paths
- [ ] T020 [US1] Audit all navigation links in `frontend/docusaurus.config.ts` navbar items - fix broken URLs
- [x] T021 [US1] Verify protected route redirect in `frontend/src/pages/profile/index.tsx` (redirects to `/signin` if not logged in)
- [x] T022 [US1] Verify protected route redirect in `frontend/src/pages/onboarding.tsx` (redirects to `/signin` if not logged in)
- [ ] T023 [US1] Test complete routing flow: Visit all 6 routes, verify each loads without 404
- [ ] T024 [US1] Test logout redirect: Login → Go to profile → Logout → Verify redirected to `/`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Professional Navigation Bar (Priority: P2)

**Goal**: Clean, organized navbar showing Login/Signup (logged out) or Profile/Logout (logged in)

**Independent Test**: View navbar in logged-out and logged-in states on desktop and mobile. Verify buttons are visible, clean, and properly arranged.

### Implementation for User Story 2

- [x] T025 [P] [US2] Verify existing navbar component at `frontend/src/theme/Navbar/Content/index.tsx`
- [X] T026 [US2] Update navbar to show Login/Signup buttons when logged out
- [X] T027 [US2] Update navbar to show Profile/Logout buttons when logged in
- [X] T028 [US2] Use Docusaurus button classes for consistent styling (`button--primary`, `button--secondary`, `button--sm`)
- [X] T029 [US2] Style navbar buttons with proper spacing, colors, and alignment
- [ ] T030 [US2] Add responsive CSS for mobile navbar (media queries for small screens)
- [ ] T031 [US2] Test navbar logged-out state: Verify Login and Signup buttons visible and styled
- [ ] T032 [US2] Test navbar logged-in state: Verify Profile and Logout buttons visible and styled
- [ ] T033 [US2] Test navbar mobile responsiveness: Resize browser to mobile width, verify layout adapts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Ask AI Feature for Selected Text (Priority: P3)

**Goal**: Text selection popup appears for logged-in users on `/docs/*` pages, sends selected text to AI, displays complete response

**Independent Test**: Login → Navigate to any `/docs/*` page → Select text → Verify "Ask AI" popup appears → Click popup → Verify AI responds with complete answer (no streaming)

### Implementation for User Story 3

- [x] T034 [P] [US3] Verify text selection hook exists at `frontend/src/hooks/useSelectedText.ts`
- [x] T035 [P] [US3] Verify text selection popup exists at `frontend/src/components/ChatWidget/TextSelectionPopup.tsx`
- [x] T036 [P] [US3] Verify ChatWidget exists at `frontend/src/components/ChatWidget/index.tsx`
- [X] T037 [US3] Fix backend chat endpoint: Convert `backend/routers/chat.py` from streaming to non-streaming
  - Change `Runner.run_streamed()` to `Runner.run_sync()`
  - Remove `async for event in result.stream_events()` loop
  - Return JSON: `{"response": full_response, "session_id": request.session_id}`
- [X] T038 [US3] Add non-streaming API method to `frontend/src/utils/api.ts`:
  ```typescript
  export async function apiFetchComplete(endpoint: string, body: object, auth: boolean = false): Promise<string>
  ```
- [ ] T039 [US3] Update `frontend/src/components/ChatWidget/ChatWindow.tsx` to use non-streaming API call
- [ ] T040 [US3] Verify TextSelectionPopup only shows for logged-in users on `/docs/*` routes
- [ ] T041 [US3] Test text selection: Login → Go to `/docs/intro` → Select text → Verify popup appears within 100ms
- [ ] T042 [US3] Test Ask AI flow: Click popup → Verify selected text sent to `/api/chat` → Verify complete response displayed (no streaming)

**Checkpoint**: User Story 3 should be fully functional and independently testable

---

## Phase 6: User Story 4 - Personalize Feature (Priority: P4)

**Goal**: Personalize button generates and displays complete personalized content (no streaming)

**Independent Test**: Login → Navigate to chapter → Click "Personalize" → Verify loading indicator → Verify complete personalized content displayed

### Implementation for User Story 4

- [x] T043 [P] [US4] Verify personalize component exists at `frontend/src/components/ChapterPersonalize.tsx`
- [X] T044 [US4] Fix backend personalize endpoint: Convert `backend/routers/personalize.py` from streaming to non-streaming
  - Change `Runner.run_streamed()` to `Runner.run_sync()`
  - Remove `async for event in result.stream_events()` loop
  - Return JSON: `{"personalized_content": full_response, "chapter_id": request.chapter_id}`
- [X] T045 [US4] Update `frontend/src/components/ChapterPersonalize.tsx` to use non-streaming API:
  - Remove streaming reader code (`response.body?.getReader()`)
  - Parse JSON response: `const data = await response.json()`
  - Extract content: `const fullContent = data.personalized_content`
- [ ] T046 [US4] Verify loading indicator shows while personalization is in progress
- [ ] T047 [US4] Verify error handling shows user-friendly message if personalization fails
- [ ] T048 [US4] Test personalize flow: Login → Go to chapter → Click Personalize → Verify loading → Verify complete content displayed
- [ ] T049 [US4] Test personalize toggle: Verify can switch between original and personalized content

**Checkpoint**: User Story 4 should be fully functional and independently testable

---

## Phase 7: User Story 5 - Urdu Translation Feature (Priority: P5)

**Goal**: Urdu Translation button generates and displays complete translation (no streaming)

**Independent Test**: Login → Navigate to chapter → Click "Translate to Urdu" → Verify loading indicator → Verify complete Urdu text displayed with RTL formatting

### Implementation for User Story 5

- [x] T050 [P] [US5] Verify translate component exists at `frontend/src/components/ChapterTranslate.tsx`
- [X] T051 [US5] Fix backend translate endpoint: Convert `backend/routers/translate.py` from streaming to non-streaming
  - Change `Runner.run_streamed()` to `Runner.run_sync()`
  - Remove `async for event in result.stream_events()` loop
  - Return JSON: `{"translated_content": full_response, "chapter_id": request.chapter_id}`
- [X] T052 [US5] Update `frontend/src/components/ChapterTranslate.tsx` to use non-streaming API:
  - Remove streaming reader code (`response.body?.getReader()`)
  - Parse JSON response: `const data = await response.json()`
  - Extract content: `const fullContent = data.translated_content`
- [ ] T053 [US5] Verify Urdu text displays with RTL direction and proper font (`'Noto Nastaliq Urdu', serif`)
- [ ] T054 [US5] Verify loading indicator shows while translation is in progress
- [ ] T055 [US5] Verify error handling shows user-friendly message if translation fails
- [ ] T056 [US5] Test translation flow: Login → Go to chapter → Click Translate → Verify loading → Verify complete Urdu text displayed
- [ ] T057 [US5] Test translation toggle: Verify can switch between English and Urdu views

**Checkpoint**: User Story 5 should be fully functional and independently testable

---

## Phase 8: User Story 6 - Non-Streaming AI Responses (Priority: P6)

**Goal**: All AI responses display complete answer at once (no streaming) with loading indicator

**Independent Test**: Trigger any AI feature (chat, personalize, translate) → Verify loading indicator shows → Verify complete response appears at once (no word-by-word streaming)

### Implementation for User Story 6

**Note**: This user story is cross-cutting - it validates that US3, US4, US5 all use non-streaming approach

- [X] T058 [P] [US6] Verify `backend/routers/chat.py` returns JSON response (not `StreamingResponse`)
- [X] T059 [P] [US6] Verify `backend/routers/personalize.py` returns JSON response (not `StreamingResponse`)
- [X] T060 [P] [US6] Verify `backend/routers/translate.py` returns JSON response (not `StreamingResponse`)
- [ ] T061 [US6] Verify all frontend AI components show loading indicator during processing
- [ ] T062 [US6] Test chat non-streaming: Ask question → Verify complete answer appears at once
- [ ] T063 [US6] Test personalize non-streaming: Click Personalize → Verify complete content appears at once
- [ ] T064 [US6] Test translate non-streaming: Click Translate → Verify complete Urdu text appears at once
- [ ] T065 [US6] Verify no SSE (Server-Sent Events) code remains in any AI endpoint

**Checkpoint**: All user stories should now be independently functional with non-streaming AI

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, documentation, and build verification

- [ ] T066 [P] Run backend build verification: `cd backend && python -m py_compile routers/*.py`
- [ ] T067 [P] Run frontend build: `cd frontend && npm run build`
- [ ] T068 [P] Fix any build errors from `npm run build`
- [ ] T069 [P] Verify no TypeScript errors in frontend build output
- [ ] T070 Update documentation: Add notes about non-streaming API changes in `backend/README.md` or create new file
- [ ] T071 [P] Manual testing: Complete end-to-end flow for all 6 user stories
- [ ] T072 [P] Verify all acceptance criteria from spec.md are met
- [ ] T073 [P] Clean up duplicate pages if needed (signin.tsx vs login.tsx - decide which to keep)
- [ ] T074 [P] Code cleanup: Remove unused imports, fix linting issues
- [ ] T075 [P] Verify constitution compliance: Check all 10 rules from `.specify/memory/constitution.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent, but integrates with US1 routing
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US6 (non-streaming backend)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US6 (non-streaming backend)
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Depends on US6 (non-streaming backend)
- **User Story 6 (P6)**: Cross-cutting validation - Should be implemented alongside US3, US4, US5

### Within Each User Story

- Models/components verification before implementation
- Backend endpoint fixes before frontend integration
- Core implementation before integration testing
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: T002, T003, T004, T005 can all run in parallel
- **Phase 2 (Foundational)**: T006, T007, T008, T009, T010, T011 can all run in parallel
- **Phase 3 (US1)**: T012, T013, T014, T015, T016, T017 can all run in parallel (verification tasks)
- **Phase 5-7 (US3, US4, US5)**: Backend streaming fixes (T037, T044, T051) can run in parallel
- **Phase 6 (US6)**: T058, T059, T060 can run in parallel (verification across all endpoints)

---

## Parallel Example: Backend Streaming Removal

```bash
# Launch all three backend streaming fixes in parallel (different files):
Task: "Fix backend/routers/chat.py - convert to non-streaming"
Task: "Fix backend/routers/personalize.py - convert to non-streaming"
Task: "Fix backend/routers/translate.py - convert to non-streaming"

# These can run in parallel because:
# - Different files (no merge conflicts)
# - No dependencies between them
# - Same pattern applied to each
```

---

## Parallel Example: Frontend Component Verification

```bash
# Launch all component verification tasks in parallel (Phase 3):
Task: "Verify root page exists at frontend/src/pages/index.tsx"
Task: "Verify login page exists at frontend/src/pages/login.tsx"
Task: "Verify signup page exists at frontend/src/pages/signup.tsx"
Task: "Verify profile page exists at frontend/src/pages/profile/index.tsx"
Task: "Verify onboarding page exists at frontend/src/pages/onboarding.tsx"

# These can run in parallel because:
# - Read-only verification tasks
# - Different files
# - No side effects
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (5 tasks)
2. Complete Phase 2: Foundational (6 tasks)
3. Complete Phase 3: User Story 1 (13 tasks)
4. **STOP and VALIDATE**: Test all routes, verify logout redirect
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (11 tasks)
2. Add User Story 1 → Routing works, logout redirect → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Navbar professional → Test independently → Deploy/Demo
4. Add User Story 3 → Ask AI popup works → Test independently → Deploy/Demo
5. Add User Story 4 → Personalize works → Test independently → Deploy/Demo
6. Add User Story 5 → Urdu translation works → Test independently → Deploy/Demo
7. Validate User Story 6 → All AI non-streaming → Final verification

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - **Developer A**: User Story 1 (routing) + User Story 2 (navbar)
   - **Developer B**: User Story 6 (backend streaming removal) + User Story 3 (Ask AI)
   - **Developer C**: User Story 4 (Personalize) + User Story 5 (Translation)
3. Stories complete and integrate independently
4. Team reunites for Phase 9 (Polish & Validation)

---

## Task Summary

| Phase | User Story | Task Count | Key Deliverable |
|-------|-----------|------------|-----------------|
| 1 | Setup | 5 | Verified project structure |
| 2 | Foundational | 6 | Working dev servers |
| 3 | US1 (P1) | 13 | All routes functional |
| 4 | US2 (P2) | 9 | Professional navbar |
| 5 | US3 (P3) | 9 | Ask AI popup working |
| 6 | US4 (P4) | 7 | Personalize feature working |
| 7 | US5 (P5) | 8 | Urdu translation working |
| 8 | US6 (P6) | 8 | Non-streaming AI validated |
| 9 | Polish | 10 | Build passing, documented |
| **Total** | | **75 tasks** | |

**MVP Scope**: Phases 1-3 (24 tasks) - Routing foundation complete

**Full Feature**: All 9 phases (75 tasks) - All user stories complete

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend streaming fixes (US6) should be done BEFORE frontend integration (US3, US4, US5)
- Verify `npm run build` passes before marking Phase 9 complete
