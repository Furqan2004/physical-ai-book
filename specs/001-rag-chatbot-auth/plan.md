# Implementation Plan: AI Book RAG Chatbot System with Auth & Personalization

**Branch**: `001-rag-chatbot-auth` | **Date**: 2026-03-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rag-chatbot-auth/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a RAG-powered chatbot system with authentication, content personalization, and Urdu translation for an existing Docusaurus book website. The system uses OpenRouter for LLM and embeddings, Qdrant Cloud for vector storage, Neon Postgres for relational data, Better Auth for authentication, and FastAPI for the backend. The frontend remains Docusaurus-based with added auth pages, chatbot widget, and chapter transformation buttons.

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript 5.x (frontend), Node.js 20.x LTS
**Primary Dependencies**: FastAPI 0.115.0, OpenAI Agents SDK 0.0.15, OpenAI SDK 1.50.0, Qdrant Client 1.11.0, AsyncPG 0.29.0, Better Auth (client), Docusaurus v3.9.x
**Storage**: Qdrant Cloud Free Tier (vectors), Neon Serverless Postgres (relational data)
**Testing**: pytest (backend), Jest (frontend - if tests exist)
**Target Platform**: Web (GitHub Pages frontend, Railway backend)
**Project Type**: Web application with separate frontend and backend
**Performance Goals**: 95% of chatbot responses within 5 seconds, support 1000 concurrent users
**Constraints**: All free tier limits (Qdrant Cloud, Neon, Railway), CORS for GitHub Pages domain
**Scale/Scope**: Single book content (~50 chapters), user authentication, real-time chat streaming

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Constitution Principle | Compliance Check | Status |
|------------------------|------------------|--------|
| **RULE 1: Apni Taraf Se Kuch Nahi** | Content for chatbot responses comes from book chunks only (RAG), personalization/translation uses LLM on existing chapter content | ✅ PASS |
| **RULE 2: Source-Verified-Researcher Mandatory** | Book content already exists; no new content generation required for this feature | ✅ PASS (N/A - feature adds functionality, not content) |
| **RULE 3: Docusaurus Template Pehle Padhna** | Existing Docusaurus project; will follow established conventions | ✅ PASS |
| **RULE 4: Code Bilkul Structured Hoga** | Strict folder structure defined (backend/, frontend/), kebab-case file names | ✅ PASS |
| **RULE 5: Ek Kaam Ek Waqt Mein** | 10-phase implementation plan with sequential execution | ✅ PASS |
| **RULE 6: Koi Undocumented Decision Nahi** | All technical decisions documented in this plan; no extra packages without approval | ✅ PASS |
| **RULE 7: RAG-Ready Architecture** | Book content structured as MDX/Markdown chunks with metadata for indexing | ✅ PASS |
| **RULE 8: Build Hamesha Pass Hona Chahiye** | Each phase includes testing checklist; npm run build required | ✅ PASS |
| **RULE 9: Branding Sirf Approved Jagahon** | No branding changes; feature is functional only | ✅ PASS (N/A) |
| **RULE 10: Book Content Sirf Course Outline** | Existing book content untouched; feature adds interactive layer only | ✅ PASS |

## Project Structure

### Documentation (this feature)

```text
specs/001-rag-chatbot-auth/
├── spec.md                # Feature specification
├── plan.md                # This implementation plan
├── research.md            # Phase 0 output (OpenRouter, Qdrant, Better Auth research)
├── data-model.md          # Phase 1 output (database schemas, entity relationships)
├── quickstart.md          # Phase 1 output (local development setup)
├── contracts/             # Phase 1 output (API specifications)
│   ├── auth.yaml          # OpenAPI spec for auth endpoints
│   ├── chat.yaml          # OpenAPI spec for chat endpoints
│   ├── personalize.yaml   # OpenAPI spec for personalization endpoint
│   └── translate.yaml     # OpenAPI spec for translation endpoint
└── tasks.md               # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
project-root/
├── frontend/              # Docusaurus v3 TypeScript application
│   ├── docs/              # Book content (EXISTING - DO NOT TOUCH)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWidget/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── ChatWindow.tsx
│   │   │   │   └── TextSelectionPopup.tsx
│   │   │   └── ChapterButtons/
│   │   │       ├── PersonalizeButton.tsx
│   │   │       └── TranslateButton.tsx
│   │   ├── pages/
│   │   │   ├── signup.tsx
│   │   │   ├── signin.tsx
│   │   │   ├── onboarding.tsx
│   │   │   └── profile.tsx
│   │   ├── theme/
│   │   │   └── Root.tsx   # Auth provider wrapper
│   │   ├── utils/
│   │   │   └── api.ts     # API fetch utilities
│   │   └── css/
│   ├── docusaurus.config.ts
│   ├── sidebars.ts
│   ├── package.json
│   └── tsconfig.json
│
├── backend/               # FastAPI Python application
│   ├── main.py            # FastAPI app entry point
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   ├── agents/
│   │   ├── __init__.py    # OpenRouter Agents SDK setup
│   │   ├── triage_agent.py
│   │   ├── chat_agent.py
│   │   └── orchestrator_agent.py
│   ├── tools/
│   │   ├── __init__.py
│   │   ├── qdrant_search_tool.py
│   │   ├── db_tool.py
│   │   ├── personalize_tool.py
│   │   └── translate_tool.py
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── deps.py        # Authentication dependencies
│   │   ├── auth.py
│   │   ├── chat.py
│   │   ├── personalize.py
│   │   └── translate.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── openrouter_service.py  # Embeddings
│   │   ├── qdrant_service.py
│   │   ├── db_service.py
│   │   └── auth_service.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── chat.py
│   │   └── background.py
│   └── scripts/
│       └── ingest_book.py  # One-time book ingestion
│
└── .github/
    └── workflows/
        └── deploy.yml     # GitHub Actions (update for frontend/)
```

**Structure Decision**: Option 2 (Web application with separate frontend and backend). Frontend remains in Docusaurus structure, backend is a new FastAPI application. Communication via REST API with JWT authentication.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multi-agent architecture | Clear separation of concerns for routing, RAG chat, and content transformation | Single agent would have tool selection confusion and harder debugging |
| Separate frontend/backend | Docusaurus already deployed; backend needs Python for AI SDKs | Monolith would require full rewrite of existing frontend |

---

## Phase Summary

### Phase 0: Research ✅ COMPLETE

- [x] All technical decisions documented in `research.md`
- [x] 10 key decisions made (LLM provider, vector DB, auth, agents, etc.)
- [x] All NEEDS CLARIFICATION markers resolved
- [x] Technology stack finalized and justified

### Phase 1: Design & Contracts ✅ COMPLETE

**Artifacts Created**:

- [x] `data-model.md` — Complete database schema with 6 tables, entity relationships, validation rules
- [x] `contracts/auth.yaml` — OpenAPI spec for 5 auth endpoints
- [x] `contracts/chat.yaml` — OpenAPI spec for chat endpoints with SSE streaming
- [x] `contracts/personalize.yaml` — OpenAPI spec for personalization endpoint
- [x] `contracts/translate.yaml` — OpenAPI spec for translation endpoint
- [x] `quickstart.md` — Local development setup guide with troubleshooting
- [x] Agent context updated with new technologies

**Constitution Check Re-evaluation**: ✅ PASS (all principles still satisfied)

### Phase 2: Implementation Tasks (NEXT STEP)

**Ready for `/sp.tasks`** — The following phases will be broken into testable tasks:

| Phase | Description | Estimated Tasks |
|-------|-------------|-----------------|
| Phase 0 | Project restructure (frontend/ folder creation) | 2 tasks |
| Phase 1 | Backend setup (folders, models, DB, services) | 10 tasks |
| Phase 2 | Vector size confirmation + 4 tools | 5 tasks |
| Phase 3 | 3 agents (Triage, Chat, Orchestrator) | 4 tasks |
| Phase 4 | FastAPI routers (auth, chat, personalize, translate) | 6 tasks |
| Phase 5 | Book ingestion script | 3 tasks |
| Phase 6 | Frontend auth pages (signup, signin, onboarding, profile) | 6 tasks |
| Phase 7 | Chatbot widget (ChatWindow, TextSelectionPopup) | 4 tasks |
| Phase 8 | Chapter buttons (Personalize, Translate) | 4 tasks |
| Phase 9 | Docker + Railway deployment | 5 tasks |

**Total Estimated Tasks**: ~49 implementation tasks

---

## Plan Completion

**Status**: Phase 2 planning complete. Ready for task breakdown.

**Next Command**: Run `/sp.tasks` to break the implementation into testable, sequential tasks.

**Artifacts Summary**:

```
specs/001-rag-chatbot-auth/
├── spec.md           # Feature specification (from /sp.specify)
├── plan.md           # This implementation plan (from /sp.plan)
├── research.md       # Phase 0: Technical decisions
├── data-model.md     # Phase 1: Database schema
├── quickstart.md     # Phase 1: Local setup guide
├── contracts/        # Phase 1: API specifications
│   ├── auth.yaml
│   ├── chat.yaml
│   ├── personalize.yaml
│   └── translate.yaml
└── checklists/
    └── requirements.md  # Spec quality checklist
```
