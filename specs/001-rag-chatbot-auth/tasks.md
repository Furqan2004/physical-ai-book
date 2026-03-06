# Tasks: AI Book RAG Chatbot System with Auth & Personalization

**Input**: Design documents from `/specs/001-rag-chatbot-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not included in this task list. Add manually if TDD approach is desired.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/`, `frontend/src/`
- All paths are relative to project root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project restructuring and basic environment setup

- [X] T001 [P] Create backend/ folder structure: backend/{agents,tools,routers,services,models,scripts} with __init__.py files
- [X] T002 [P] Restructure frontend/: move docs/, src/, docusaurus.config.ts, sidebars.ts, package.json into frontend/
- [X] T003 Create backend/requirements.txt with FastAPI, openai-agents, qdrant-client, asyncpg, python-jose, passlib
- [X] T004 Create backend/.env.example with OPENROUTER_API_KEY, QDRANT_URL, NEON_DATABASE_URL, BETTER_AUTH_SECRET
- [X] T005 [P] Add .env to .gitignore in both backend/ and frontend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 [P] Create backend/models/__init__.py with Pydantic models: UserSignup, UserSignin, UserResponse in backend/models/user.py
- [X] T007 [P] Create backend/models/chat.py with ChatRequest, ChatMessage, ChatHistoryResponse
- [X] T008 [P] Create backend/models/background.py with BackgroundRequest
- [X] T009 Create backend/services/openrouter_service.py with get_embedding() using OpenRouter embeddings API
- [X] T010 [P] Create backend/services/qdrant_service.py with get_qdrant_client(), create_collection_if_not_exists(), upsert_vectors(), search_similar()
- [X] T011 [P] Create backend/services/db_service.py with async functions: get_connection(), create_user(), get_user_by_email(), get_user_by_id(), save_user_background(), get_user_background(), create_auth_session(), get_session_by_token(), delete_session(), create_chat_session(), save_chat_message(), get_chat_history(), save_chunk_metadata()
- [X] T012 [P] Create backend/services/auth_service.py with hash_password(), verify_password(), create_jwt_token(), decode_jwt_token(), get_current_user()
- [X] T013 Create backend/agents/__init__.py with OpenRouter AsyncOpenAI client setup for Agents SDK
- [X] T014 Create Neon Postgres tables: users, user_background, sessions, chat_sessions, chat_messages, book_chunks (from data-model.md SQL)
- [X] T015 Create Qdrant collection "book_content" with vector size 768, cosine distance
- [X] T016 [P] Create frontend/src/utils/api.ts with getToken(), getUser(), apiFetch(), apiStream() utilities

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Complete user authentication system with signup, signin, onboarding, and profile management

**Independent Test**: Can be fully tested by completing the signup flow, signing in, and verifying access to protected features while confirming public content remains accessible without login

### Implementation for User Story 1

- [X] T017 [P] [US1] Create backend/routers/deps.py with get_authenticated_user() dependency for token validation
- [X] T018 [P] [US1] Create backend/routers/auth.py with POST /auth/signup, POST /auth/signin, POST /auth/signout, GET /auth/me endpoints
- [X] T019 [P] [US1] Add POST /user/background endpoint in backend/routers/auth.py for saving user background
- [X] T020 [P] [US1] Create frontend/src/pages/signup.tsx with Name, Email, Password form + redirect to /onboarding
- [X] T021 [P] [US1] Create frontend/src/pages/signin.tsx with Email, Password form + redirect to /
- [X] T022 [P] [US1] Create frontend/src/pages/onboarding.tsx with software experience dropdown, hardware background textarea, language checkboxes, learning style radio buttons
- [X] T023 [P] [US1] Create frontend/src/pages/profile.tsx displaying user info + background + Logout button
- [X] T024 [US1] Create frontend/src/theme/Root.tsx with AuthContext provider, useAuth hook, login/logout functions, localStorage token management
- [X] T025 [US1] Swizzle Navbar: npm run swizzle @docusaurus/theme-classic Navbar/Content --wrap, update to show Login/Signup (logged out) or Hello {name} dropdown (logged in)
- [X] T026 [US1] Add auth guard logic: redirect to /signin when accessing protected routes without token
- [X] T027 [US1] Update backend/main.py with CORS middleware, include_router for auth, health endpoint

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - users can signup, signin, complete onboarding, and access protected features

---

## Phase 4: User Story 2 - RAG Chatbot for Book Content Questions (Priority: P2)

**Goal**: RAG-powered chatbot that answers questions based on book content with streaming responses

**Independent Test**: Can be fully tested by selecting text from a chapter, asking a question via the chatbot, and verifying the response is relevant to the book content

### Implementation for User Story 2

- [X] T028 [P] [US2] Create backend/tools/qdrant_search_tool.py with @function_tool qdrant_search(query, top_k) using get_embedding() and search_similar()
- [X] T029 [P] [US2] Create backend/tools/db_tool.py with @function_tool save_message() and load_chat_history()
- [X] T030 [P] [US2] Create backend/agents/chat_agent.py with ChatAgent using qdrant_search, save_message, load_chat_history tools
- [X] T031 [P] [US2] Create backend/agents/orchestrator_agent.py with OrchestratorAgent (will be used by US3, US4)
- [X] T032 [P] [US2] Create backend/agents/triage_agent.py with handoffs to ChatAgent and OrchestratorAgent
- [X] T033 [P] [US2] Create backend/routers/chat.py with POST /api/chat (streaming via Runner.run_streamed) and GET /api/chat/history
- [X] T034 [US2] Create frontend/src/components/ChatWidget/ChatWindow.tsx with message list, input field, send button, streaming response handling, session management
- [X] T035 [US2] Create frontend/src/components/ChatWidget/TextSelectionPopup.tsx with text selection detection, "Ask about this?" popup on /docs/ routes only
- [X] T036 [US2] Create frontend/src/components/ChatWidget/index.tsx with floating button, isOpen state, selectedText state, auth guard
- [X] T037 [US2] Add <ChatWidget /> to frontend/src/theme/Root.tsx AuthProvider
- [X] T038 [US2] Update backend/main.py to include_router(chat.router)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - chatbot answers questions based on book content with streaming

---

## Phase 5: User Story 3 - Chapter Content Personalization (Priority: P3)

**Goal**: Personalize chapter content based on user's experience level, known languages, and learning style

**Independent Test**: Can be fully tested by clicking the "Personalize This Chapter" button on any chapter page and verifying the content is rewritten according to the user's background profile

### Implementation for User Story 3

- [X] T039 [P] [US3] Create backend/tools/personalize_tool.py
- [X] T040 [P] [US3] Create backend/routers/personalize.py
- [X] T041 [P] [US3] Create frontend/src/components/ChapterButtons/PersonalizeButton.tsx
- [X] T042 [US3] Swizzle DocItem Layout and add PersonalizeButton
- [X] T043 [US3] Update backend/main.py to include_router(personalize.router)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Urdu Translation of Chapters (Priority: P4)

### Implementation for User Story 4

- [X] T044 [P] [US4] Create backend/tools/translate_tool.py
- [X] T045 [P] [US4] Create backend/routers/translate.py
- [X] T046 [P] [US4] Create frontend/src/components/ChapterButtons/TranslateButton.tsx
- [X] T047 [US4] Update swizzled DocItem/Layout to include TranslateButton
- [X] T048 [US4] Update backend/main.py to include_router(translate.router)

**Checkpoint**: All user stories should now be independently functional - translation provides Urdu version with preserved code blocks

---

## Phase 7: Book Ingestion (Shared - Required for Chatbot)

**Purpose**: Ingest all book content into Qdrant vectors and Neon metadata

- [ ] T049 [P] Create backend/scripts/ingest_book.py with chunk_text() (400 words, 50 word overlap), extract_metadata(), ingest_all_docs() using get_embedding(), upsert_vectors(), save_chunk_metadata()
- [ ] T050 Run ingestion: cd backend/scripts && python ingest_book.py
- [ ] T051 Verify ingestion: SELECT COUNT(*) FROM book_chunks (should return > 0), check Qdrant dashboard for vector count

---

## Phase 8: Docker + Deployment

**Purpose**: Containerize backend and deploy to Railway, update frontend deployment

- [ ] T052 [P] Create backend/Dockerfile with python:3.11-slim, requirements install, uvicorn command
- [ ] T053 [P] Create backend/.dockerignore with venv/, __pycache__/, .env, scripts/
- [ ] T054 Update .github/workflows/deploy.yml to set working-directory: frontend for build and deploy steps
- [ ] T055 Deploy backend to Railway: connect GitHub repo, set root directory to backend/, add all environment variables
- [ ] T056 Update frontend/.env with REACT_APP_API_URL pointing to Railway backend URL
- [ ] T057 Deploy frontend to GitHub Pages: cd frontend && npm run build && npm run deploy
- [ ] T058 Run production ingestion on Railway-deployed backend

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, testing, and final validation

- [ ] T059 [P] Create backend/README.md with API documentation, environment setup, local development instructions
- [ ] T060 [P] Update root README.md with project overview, architecture diagram, quickstart links
- [ ] T061 [P] Add logging to all service functions (use Python logging module)
- [ ] T062 [P] Add error handling middleware in backend/main.py (global exception handler)
- [ ] T063 Validate quickstart.md: follow all steps from scratch, fix any issues found
- [ ] T064 [P] Run npm run build in frontend/ to verify no TypeScript errors
- [ ] T065 [P] Test all user flows end-to-end: signup → onboarding → chatbot → personalize → translate

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed) after Phase 2
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Book Ingestion (Phase 7)**: Depends on Foundational (Phase 2) - required before Chatbot (US2) testing
- **Deployment (Phase 8)**: Depends on all user stories completion
- **Polish (Phase 9)**: Depends on all user stories completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on Book Ingestion (Phase 7) for full testing
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Models before services
- Services before endpoints/routers
- Backend before frontend integration
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T001, T002, T005 can run in parallel (different directories)

**Phase 2 (Foundational)**:
- T006, T007, T008 can run in parallel (different model files)
- T009, T010, T011, T012 can run in parallel (different service files)
- T016 can run in parallel (frontend utility)

**Phase 3 (US1)**:
- T017, T018, T019 can run in parallel (backend routers)
- T020, T021, T022, T023 can run in parallel (frontend pages)
- T024, T025, T026 are sequential (auth context → navbar → guards)

**Phase 4 (US2)**:
- T028, T029 can run in parallel (tools)
- T030, T031, T032 can run in parallel (agents)
- T033 can start after agents complete
- T034, T035, T036 can run in parallel (frontend components)

**Phase 5 (US3)**:
- T039, T040, T041 can run in parallel (tool, router, component)
- T042 depends on T041 (component integration)

**Phase 6 (US4)**:
- T044, T045, T046 can run in parallel (tool, router, component)
- T047 depends on T046 (component integration)

**Phase 8 (Deployment)**:
- T052, T053, T054 can run in parallel (Docker, CI/CD)
- T055, T056, T057 are sequential (deploy backend → update config → deploy frontend)

---

## Parallel Example: Foundational Phase

```bash
# Launch all model files together:
Task: "Create backend/models/user.py with UserSignup, UserSignin, UserResponse"
Task: "Create backend/models/chat.py with ChatRequest, ChatMessage, ChatHistoryResponse"
Task: "Create backend/models/background.py with BackgroundRequest"

# Launch all service files together:
Task: "Create backend/services/openrouter_service.py"
Task: "Create backend/services/qdrant_service.py"
Task: "Create backend/services/db_service.py"
Task: "Create backend/services/auth_service.py"
```

---

## Parallel Example: User Story 1

```bash
# Launch all backend routers together:
Task: "Create backend/routers/deps.py with get_authenticated_user()"
Task: "Create backend/routers/auth.py with all auth endpoints"

# Launch all frontend pages together:
Task: "Create frontend/src/pages/signup.tsx"
Task: "Create frontend/src/pages/signin.tsx"
Task: "Create frontend/src/pages/onboarding.tsx"
Task: "Create frontend/src/pages/profile.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T016)
3. Complete Phase 3: User Story 1 (T017-T027)
4. **STOP and VALIDATE**: Test signup, signin, onboarding, profile, logout flows
5. Deploy MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Auth system!)
3. Add Phase 7 (Book Ingestion) → Enable chatbot testing
4. Add User Story 2 → Test independently → Deploy/Demo (Chatbot!)
5. Add User Story 3 → Test independently → Deploy/Demo (Personalization!)
6. Add User Story 4 → Test independently → Deploy/Demo (Urdu Translation!)
7. Complete Phase 8 → Production deployment
8. Complete Phase 9 → Polish and documentation

### Parallel Team Strategy

With multiple developers after Foundational phase:

- **Developer A**: User Story 1 (Auth pages, navbar, guards)
- **Developer B**: User Story 2 (Chatbot widget, agents, tools)
- **Developer C**: User Story 3 + User Story 4 (Personalization + Translation)
- **Shared**: Book Ingestion (Phase 7), Deployment (Phase 8)

---

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup | 5 tasks |
| Phase 2 | Foundational | 11 tasks |
| Phase 3 | User Story 1 (Auth) | 11 tasks |
| Phase 4 | User Story 2 (Chatbot) | 11 tasks |
| Phase 5 | User Story 3 (Personalization) | 5 tasks |
| Phase 6 | User Story 4 (Translation) | 5 tasks |
| Phase 7 | Book Ingestion | 3 tasks |
| Phase 8 | Deployment | 6 tasks |
| Phase 9 | Polish | 7 tasks |
| **Total** | | **64 tasks** |

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group of tasks
- Stop at checkpoints to validate stories independently
- Book Ingestion (Phase 7) must complete before Chatbot (US2) can be fully tested
- All user stories require Foundational phase completion before starting
