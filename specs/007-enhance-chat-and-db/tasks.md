# Tasks: Enhance Chat UI and Database Chapter Storage

**Input**: Design documents from `/specs/007-enhance-chat-and-db/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

## Phase 1: Setup (Database Schema)

**Purpose**: Update the relational schema to support chapter storage.

- [ ] T001 Update `backend/scripts/create_tables.sql` with the `chapters` table and index
- [ ] T002 Apply the new schema to the Neon PostgreSQL database (manual or via script)

---

## Phase 2: Foundational (Backend Chapter Management)

**Purpose**: Implement the core logic for saving and retrieving chapters from the database.

- [ ] T003 [P] Create the Chapter Pydantic model in `backend/models/chapter.py`
- [ ] T004 Implement `save_chapter` and `get_chapter` functions in `backend/services/db_service.py`
- [ ] T005 [US3] Enhance `backend/services/sync_service.py` to read markdown from `frontend/docs` and upsert into the `chapters` table on startup

**Checkpoint**: Chapters should be visible in the PostgreSQL database after backend startup.

---

## Phase 3: User Story 3 - Database-Backed Content (Priority: P1) 🎯 MVP

**Goal**: Optimize content retrieval for personalization and translation by using the local database.

**Independent Test**: Trigger a "Personalize" request and verify (via logs) that content is fetched from PG, not crawled.

- [ ] T006 [US3] Refactor `backend/services/doc_service.py` to prioritize database retrieval over `crawl4ai`
- [ ] T007 [US3] Add robust try-except error handling to `backend/routers/personalize.py`
- [ ] T008 [US3] Add robust try-except error handling to `backend/routers/translate.py`
- [ ] T009 [US3] Update frontend personalization/translation components to display "Please try again" on 500 errors

---

## Phase 4: User Story 1 - Interactive "Ask about this" (Priority: P1)

**Goal**: Change "Ask about this" from auto-send to pre-fill.

**Independent Test**: Highlight text, click "Ask", and verify the text appears in the input box without sending.

- [ ] T010 [US1] Update `frontend/src/components/ChatWidget/ChatWindow.tsx` to handle `initialSelectedText` as pre-fill instead of auto-send
- [ ] T011 [US1] Update `frontend/src/components/ChatWidget/TextSelectionPopup.tsx` to ensure it triggers the chatbot opening with the correct pre-fill state

---

## Phase 5: User Story 2 - Modern Chat Interface (Priority: P2)

**Goal**: Implement a multi-line, auto-resizing input box.

**Independent Test**: Type a long message and use `Shift+Enter` to verify expansion and newlines.

- [ ] T012 [US2] Replace the text input with a `textarea` in `frontend/src/components/ChatWidget/ChatWindow.tsx`
- [ ] T013 [US2] Implement auto-resize logic using `ref` and `scrollHeight` in `ChatWindow.tsx`
- [ ] T014 [US2] Implement `handleKeyDown` logic for `Shift+Enter` (newline) vs `Enter` (send)

---

## Phase 6: Polish & Cleanup

**Purpose**: Final verification and code hygiene.

- [ ] T015 Verify all verification scenarios in `specs/007-enhance-chat-and-db/quickstart.md`
- [ ] T016 Remove `crawl4ai` from `backend/requirements.txt` and `backend/services/doc_service.py` if fully obsolete
- [ ] T017 Run `npm run build` in frontend to ensure no UI regressions

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)** MUST be complete before Phase 2.
- **Foundational (Phase 2)** MUST be complete before Phase 3.
- **User Story 3 (Phase 3)** is the primary backend goal.
- **User Story 1 & 2 (Phases 4 & 5)** are frontend-focused and can run in parallel with Phase 3 once Phase 2 is complete.

---

## Implementation Strategy

### MVP First
1. Complete Schema + Sync (Phase 1 & 2).
2. Implement DB Fetching (Phase 3).
3. Implement Pre-fill Logic (Phase 4).

### Incremental Delivery
- Backend optimization (US3) is delivered first.
- Chat UI enhancements (US1 & US2) follow.
