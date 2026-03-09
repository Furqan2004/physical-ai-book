# Tasks: Enhanced Chatbot UI & Database Chapter Storage

**Input**: Design documents from `/specs/008-enhance-chat-ui-and-db/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are primarily browser-based verification and backend integration tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing, following the user's requested order: Frontend first, then Backend.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1: Contextual Inquiry, US2: Fluid Chat, US3: DB Storage)

---

## Phase 1: Setup (Frontend Chat Environment)

**Purpose**: Ensure the frontend chat state is ready for refinement.

- [x] T001 [P] Verify `ChatWindow` and `ChatWidget` state in `frontend/src/components/ChatWidget/`

---

## Phase 2: User Story 1 - Contextual Inquiry (Priority: P1)

**Goal**: Pre-fill the chatbot with context without auto-sending.

**Independent Test**: Click "Ask about this" on a doc page; verify chat opens with editable context and no message is sent.

- [x] T002 [US1] Update `frontend/src/components/ChatWidget/ChatWindow.tsx` to refine the pre-fill message format in `useEffect`
- [x] T003 [US1] Verify that no other `useEffect` or logic triggers `handleSend` automatically in `frontend/src/components/ChatWidget/ChatWindow.tsx`
- [ ] T004 [US1] Test "Ask about this" interaction in the browser and verify context is editable

---

## Phase 3: User Story 2 - Fluid Chat Input (Priority: P2)

**Goal**: Support newlines and auto-resizing in the chatbot UI.

**Independent Test**: Type a multi-line message using Shift+Enter; verify box expands and message renders with breaks.

- [x] T005 [P] [US2] Update `frontend/src/components/ChatWidget/ChatWindow.tsx` message bubble styles to include `white-space: pre-wrap`
- [x] T006 [US2] Update `frontend/src/components/ChatWidget/ChatWindow.tsx` to increase `adjustHeight` limit to 250px and ensure Shift+Enter logic is correct
- [ ] T007 [US2] Test multi-line input and rendering in the browser

---

## Phase 4: Foundational (Backend Chapter Sync)

**Purpose**: Populate the PostgreSQL database with all book content.

**⚠️ CRITICAL**: Must be completed before User Story 3 can be tested.

- [x] T008 Create `backend/scripts/sync_chapters_to_db.py` to crawl `frontend/docs/` and save chapters to the `chapters` table
- [x] T009 Run `python backend/scripts/sync_chapters_to_db.py` and verify console output for all chapters
- [x] T010 [P] Verify chapters are correctly stored in Neon PostgreSQL using `backend/scripts/inspect_db.py` or similar

---

## Phase 5: User Story 3 - Database-Driven Personalization (Priority: P1)

**Goal**: Use stored database content for AI features.

**Independent Test**: Trigger "Personalize"; verify backend logs show DB retrieval and no `crawl4ai` calls.

- [x] T011 [US3] Update `backend/services/doc_service.py` to remove `crawl4ai` fallback and prioritize `get_chapter` from DB
- [x] T012 [US3] Add detailed logging to `backend/services/doc_service.py` to confirm content source during retrieval
- [x] T013 [US3] Verify `backend/routers/personalize.py` and `backend/routers/translate.py` correctly handle the updated `doc_service` responses
- [x] T014 [US3] Run integration test `backend/scripts/test_personalize.py` to confirm database-driven retrieval works

---

## Phase 6: Polish & UX (Error Handling)

**Purpose**: Provide better feedback on failures.

- [x] T015 [P] Update `frontend/src/components/ChapterButtons/PersonalizeButton.tsx` to add local `error` state and display "Please try again" on failure
- [x] T016 [P] Update `frontend/src/components/ChapterButtons/TranslateButton.tsx` to add local `error` state and display "Please try again" on failure
- [x] T017 [P] Run `npm run build` and `npm run typecheck` in `frontend/` to ensure no regressions

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 1-3 (Frontend)**: User Story 1 & 2 can be worked on first.
2. **Phase 4 (Foundational)**: Essential before Phase 5.
3. **Phase 5 (User Story 3)**: Depends on Phase 4 completion.
4. **Phase 6 (Polish)**: Final cleanup and UX improvements.

### Parallel Opportunities

- **Frontend vs Backend**: Phases 1-3 (Frontend) can be implemented in parallel with Phase 4 (Backend Sync) if desired.
- **US1 & US2**: Both touch `ChatWindow.tsx`, so sequential implementation is safer but tasks T005 and T002 are in different functional areas.
- **US3 & Polish**: Phase 6 button updates are mostly independent of Phase 5 backend logic.

---

## Implementation Strategy

### MVP First (Frontend Improvements)

1. Complete Phase 1-3 to satisfy the immediate UI and "Ask AI" flow requirements.
2. **STOP and VALIDATE**: Test the chatbot in the browser.

### Incremental Delivery

1. Deploy Frontend UI fixes.
2. Implement Phase 4 (Sync) to prepare the database.
3. Implement Phase 5 to switch AI features to database-driven content.
4. Add Phase 6 for better error visibility.
