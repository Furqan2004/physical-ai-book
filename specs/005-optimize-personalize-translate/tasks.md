# Tasks: Optimize Personalization and Translation Endpoints

**Input**: Design documents from `/specs/005-optimize-personalize-translate/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment verification

- [x] T001 Verify backend environment and dependencies in `backend/requirements.txt`
- [x] T002 [P] Verify `.env` contains `CORS_ORIGINS` for frontend URL mapping

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Update database schema with `user_personalization` and `translations` tables in `backend/scripts/create_tables.sql`
- [x] T004 Apply database schema changes to the Neon database
- [x] T005 [P] Implement `get_user_personalization` and `save_user_personalization` in `backend/services/db_service.py`
- [x] T006 [P] Implement `get_translation` and `save_translation` in `backend/services/db_service.py`
- [x] T007 [P] Update `get_doc_content` in `backend/services/doc_service.py` to fetch from remote URL using `httpx` (US3 core logic)

**Checkpoint**: Foundation ready - database tables and remote fetching utility are in place.

---

## Phase 3: User Story 1 - Personalized Content Retrieval (Priority: P1) 🎯 MVP

**Goal**: Return stored personalization from DB if it exists for the user; otherwise, generate, save, and return.

**Independent Test**: Call `POST /api/personalize` twice for the same chapter. The first should hit the AI (check logs/response), and the second should return instantly from the DB.

### Implementation for User Story 1

- [x] T008 [US1] Update `personalize` endpoint in `backend/routers/personalize.py` to check DB cache first
- [x] T009 [US1] Update `personalize` endpoint in `backend/routers/personalize.py` to save new results to DB before returning

**Checkpoint**: User Story 1 is functional - personalization is now cached per user.

---

## Phase 4: User Story 2 - Global Urdu Translation (Priority: P1)

**Goal**: Return stored Urdu translation from DB if it exists (global for all users); otherwise, generate, save, and return.

**Independent Test**: Call `POST /api/translate` from two different users for the same chapter. Both should receive the same content, and the second user's request should not trigger an AI call.

### Implementation for User Story 2

- [x] T010 [US2] Update `translate` endpoint in `backend/routers/translate.py` to check global DB cache first
- [x] T011 [US2] Update `translate` endpoint in `backend/routers/translate.py` to save new results to DB before returning

**Checkpoint**: User Story 2 is functional - translations are now cached globally.

---

## Phase 5: User Story 3 - Remote Content Extraction (Priority: P2)

**Goal**: Ensure all content fetching is done via frontend URLs instead of local file system.

**Independent Test**: Request personalization for a page that exists on the frontend but not in the backend's local `docs/` folder (if any were removed).

### Implementation for User Story 3

- [x] T012 [US3] Finalize URL mapping logic in `backend/services/doc_service.py` to handle `@site/` and environment-specific base URLs
- [x] T013 [US3] Add robust error handling for HTTP failures in `backend/services/doc_service.py`

**Checkpoint**: User Story 3 is fully integrated - the backend is decoupled from local content.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation and reporting

- [x] T014 Create `backend/report.md` summarizing all changes made to files
- [x] T015 Verify all endpoints with manual tests as per `quickstart.md`
- [x] T016 Run final build and lint check in `backend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1.
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion.
- **Polish (Phase 6)**: Depends on all stories being complete.

### Parallel Opportunities

- T005, T006, and T007 (Foundational services) can be implemented in parallel.
- Once Foundational phase is done, US1 (Phase 3) and US2 (Phase 4) can be worked on in parallel as they touch different files (`personalize.py` vs `translate.py`).

---

## Implementation Strategy

### MVP First (User Story 1 & 2)

1. Complete Setup and Foundational phases.
2. Implement US1 and US2 (P1 priorities).
3. **STOP and VALIDATE**: Verify caching works for both personalization and translation.

### Incremental Delivery

1. Foundation (DB + Fetcher) → Ready
2. Personalization Cache (US1) → Test → Ready
3. Translation Cache (US2) → Test → Ready
4. Remote Extraction Finalization (US3) → Test → Ready
5. Final Report → Done
