# Implementation Plan: AI Book Assistant RAG Fixes

**Branch**: `002-rag-chatbot-fixes` | **Date**: 2026-03-06 | **Spec**: [specs/002-rag-chatbot-fixes/spec.md](./spec.md)
**Input**: Fix connection issues, make chatbot public, validate authentication, and ensure Qdrant pipeline works correctly

## Summary

The AI Book Assistant requires fixes in three critical areas: (1) Frontend-backend connection issues (CORS, API URLs), (2) Chatbot accessibility (currently requires login, needs guest mode), and (3) Qdrant pipeline validation. The system uses Docusaurus for frontend, FastAPI for backend, Better-Auth for authentication, Neon Postgres for relational data, and Qdrant Cloud for vector storage. The implementation will follow a validate-first approach — scanning existing code, fixing connection issues, then enabling guest chatbot access while keeping premium features (personalization, translation, chat history) behind authentication.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x (frontend), Node.js 20.x LTS
**Primary Dependencies**: FastAPI 0.115.0, Docusaurus v3.9.x, Better-Auth, asyncpg 0.29.0, qdrant-client 1.11.0, OpenAI SDK 1.50.0
**Storage**: Neon Serverless Postgres (relational data), Qdrant Cloud Free Tier (vectors)
**Testing**: Manual validation scripts (pytest not configured)
**Target Platform**: Linux server (backend deployment), Web browser (frontend on GitHub Pages)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: Chatbot response within 3 seconds, 100 concurrent users
**Constraints**: Qdrant Free Tier (1 cluster, limited storage), GitHub Pages static hosting
**Scale/Scope**: Single book with RAG chatbot, user authentication, personalization features

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitution Rule | Compliance Check | Status |
|-------------------|------------------|--------|
| RULE 1: Apni Taraf Se Kuch Nahi | Not adding content without source/spec | ✅ PASS |
| RULE 2: Source-Verified-Researcher | Not applicable (this is a fix feature, not content creation) | ✅ N/A |
| RULE 3: Docusaurus Template | Already following Docusaurus conventions | ✅ PASS |
| RULE 4: Code Bilkul Structured | Maintaining existing structure, no random placement | ✅ PASS |
| RULE 5: Ek Kaam Ek Waqt Mein | Chunk-by-chunk implementation in phases | ✅ PASS |
| RULE 6: Koi Undocumented Decision | All decisions documented in this plan | ✅ PASS |
| RULE 7: RAG-Ready Architecture | Validating Qdrant pipeline, not changing | ✅ PASS |
| RULE 8: Build Hamesha Pass Hona | Will validate `npm run build` after changes | ✅ PLAN |
| RULE 9: Branding Sirf Approved | No branding changes in scope | ✅ N/A |
| RULE 10: Book Content Sirf Outline | Not modifying book content | ✅ PASS |

**GATE RESULT**: ✅ PASS — All applicable constitution rules satisfied

## Project Structure

### Documentation (this feature)

```text
specs/002-rag-chatbot-fixes/
├── plan.md              # This file
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
└── tasks.md             # Phase 2 output (NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── main.py                     # FastAPI app, CORS config
├── routers/
│   ├── auth.py                 # /auth/signup, /auth/signin, /auth/me
│   ├── chat.py                 # /api/chat (requires auth)
│   ├── personalize.py          # /api/personalize
│   ├── translate.py            # /api/translate
│   └── deps.py                 # get_authenticated_user dependency
├── services/
│   ├── auth_service.py         # JWT, password hashing
│   ├── db_service.py           # Neon Postgres operations
│   ├── qdrant_service.py       # Qdrant Cloud operations
│   └── openrouter_service.py   # Embeddings via OpenRouter
├── models/
│   ├── user.py                 # UserSignup, UserSignin schemas
│   ├── chat.py                 # Chat request/response schemas
│   └── background.py           # BackgroundRequest schema
├── ai/
│   ├── triage_agent.py         # Agent orchestration
│   ├── chat_agent.py           # Chat agent logic
│   └── orchestrator_agent.py   # Main orchestrator
├── tools/
│   ├── qdrant_search_tool.py   # Search tool
│   ├── personalize_tool.py     # Personalization tool
│   ├── translate_tool.py       # Translation tool
│   └── db_tool.py              # Database tool
├── scripts/
│   ├── setup_db.py             # Database setup
│   └── create_qdrant_collection.py  # Qdrant collection setup
├── .env.example                # Environment template
└── requirements.txt            # Python dependencies

frontend/
├── docusaurus.config.ts        # Docusaurus config (url, baseUrl)
├── src/
│   ├── utils/
│   │   └── api.ts              # API client (needs fix for env vars)
│   ├── css/
│   │   └── custom.css          # Custom styles
│   └── pages/                  # MISSING — auth pages to be created
├── package.json
└── tsconfig.json

.github/workflows/
└── deploy.yml                  # GitHub Actions deployment
```

**Structure Decision**: Web application structure (Option 2 from template) — separate `backend/` and `frontend/` directories with clear separation of concerns. Backend uses FastAPI router pattern, frontend uses Docusaurus convention.

## Phase 0: Research & Discovery

### Unknowns Identified from Technical Context

1. **CORS Configuration**: Current `main.py` uses `CORS_ORIGINS` env var — need to verify if GitHub Pages URL is included
2. **Qdrant Vector Dimension**: `qdrant_service.py` hardcodes `VECTOR_SIZE = 768` — need to verify if this matches actual embedding dimension
3. **Chat Endpoint Authorization**: `chat.py` uses `get_authenticated_user` (required) — needs to be optional for guest mode
4. **Frontend API URL**: `api.ts` uses hardcoded `http://localhost:8000` — needs environment variable support
5. **Missing Auth Pages**: No pages in `frontend/src/pages/` — login, signup, profile pages missing
6. **Database Tables**: `user_background` table used but migration status unknown
7. **Better-Auth vs Custom JWT**: Using custom JWT implementation, not Better-Auth library (name mismatch in spec)

### Research Tasks

- [ ] **Task 0.1**: Verify Qdrant embedding dimension matches hardcoded 768
- [ ] **Task 0.2**: Check if GitHub Pages URL is in CORS_ORIGINS
- [ ] **Task 0.3**: Validate database tables exist (users, user_background, chat_sessions, chat_messages)
- [ ] **Task 0.4**: Test Qdrant collection exists and has data
- [ ] **Task 0.5**: Verify OpenRouter embedding function works with special format

## Phase 1: Design & Contracts

### Data Model (from existing code + spec requirements)

**Existing Tables:**
- `users` (id, name, email, hashed_password, created_at, updated_at)
- `user_background` (user_id, software_experience, hardware_background, known_languages, learning_style)
- `sessions` (user_id, token, expires_at)
- `chat_sessions` (session_token, user_id, created_at)
- `chat_messages` (session_id, role, content, created_at)
- `book_chunks` (qdrant_id, chapter_name, heading, source_file, chunk_index, content_preview)

**To Document in data-model.md:**
- Entity relationships
- Validation rules
- Index recommendations

### API Contracts

**Existing Endpoints:**
```
POST   /auth/signup          → Register user, return JWT
POST   /auth/signin          → Login, return JWT
POST   /auth/signout         → Logout, invalidate session
GET    /auth/me              → Get current user profile
POST   /user/background      → Save user background
POST   /api/chat             → Chat with bot (CURRENTLY REQUIRES AUTH)
GET    /api/chat/history     → Get chat history (requires auth)
POST   /api/personalize      → Personalize content (requires auth)
POST   /api/translate        → Translate to Urdu (requires auth)
GET    /health               → Health check
```

**Changes Required:**
- `POST /api/chat` → Make Authorization header OPTIONAL (guest mode)
- Add `is_guest` flag to response
- Don't save chat history for guest users

### Quickstart Guide

To be created in `quickstart.md`:
- Local development setup
- Environment variable configuration
- Running backend and frontend
- Testing guest vs logged-in chat

### Agent Context Update

After plan completion, run:
```bash
.specify/scripts/bash/update-agent-context.sh qwen
```

To add technology details to agent context.

## Phase 2: Implementation Tasks

**CRITICAL**: Tasks are NOT created by `/sp.plan`. This section outlines what `/sp.tasks` will create.

### High-Level Task Groups

1. **Connection Fixes** (Priority: P0)
   - Fix CORS to include GitHub Pages URL
   - Fix frontend API URL to use environment variable
   - Validate all environment variables

2. **Qdrant Validation** (Priority: P0)
   - Verify vector dimension (768 vs dynamic)
   - Test collection exists
   - Run end-to-end embedding → search test

3. **Guest Chatbot Mode** (Priority: P1)
   - Make `/api/chat` authorization optional
   - Don't save history for guests
   - Add `is_guest` flag to response

4. **Missing Auth Pages** (Priority: P2)
   - Create login page
   - Create signup page with background questions
   - Create profile page
   - Add auth guard/hook

5. **Feature Validation** (Priority: P3)
   - Test personalization endpoint
   - Test translation endpoint
   - Validate chat history persistence

## Complexity Tracking

> **No Constitution Check violations requiring justification**

All implementation decisions align with constitution rules. No additional complexity beyond what's specified in the feature requirements.

---

## Next Steps

1. Complete Phase 0 research tasks (validate unknowns)
2. Create `research.md` with findings
3. Create `data-model.md` documenting entities
4. Create `contracts/` with API specifications
5. Create `quickstart.md` for setup guide
6. Run `/sp.tasks` to break down into actionable tasks
