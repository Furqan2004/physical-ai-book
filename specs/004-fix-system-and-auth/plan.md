# Implementation Plan: System Overhaul & Authentication Fixes

**Branch**: `004-fix-system-and-auth` | **Date**: 2026-03-06 | **Spec**: /specs/004-fix-system-and-auth/spec.md
**Input**: Feature specification from `/specs/004-fix-system-and-auth/spec.md`

## Summary

Restoring and improving the authentication system using **Better Auth**, fixing broken redirects and missing pages, scoping the chatbot to specific documentation routes, migrating signup questionnaire logic to the frontend, and ensuring the reliability of AI agents (Personalization, Translation) and their integration with Neon PostgreSQL and Qdrant Cloud.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), TypeScript/Next.js (Frontend - Docusaurus v3.9.2)  
**Primary Dependencies**: Better Auth, FastAPI, OpenAI Agents SDK, Docusaurus, React 19  
**Storage**: Neon PostgreSQL (Relational + Auth), Qdrant Cloud (Vector)  
**Testing**: Vitest/Jest (Frontend), Pytest (Backend)  
**Target Platform**: Linux/Web  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: <500ms p95 for vector retrieval, <200ms for auth checks  
**Constraints**: **PHASE 1 (Frontend) MUST be completed and approved before Phase 2 (Backend) starts.**  
**Scale/Scope**: ~10-20 pages, 2 primary AI agents, ~10 tools.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **RULE 1 & 2 (Content/Research)**: All agent responses and content must be source-verified. ✅
2. **RULE 3 (Template First)**: Docusaurus conventions must be followed. ✅
3. **RULE 5 (Chunks)**: Frontend fixes will be delivered as a single chunk for approval before backend. ✅
4. **RULE 8 (Build Pass)**: `npm run build` mandatory for frontend. ✅

## Project Structure

### Documentation (this feature)

```text
specs/004-fix-system-and-auth/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (to be created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── ai/                  # Agents (Personalization, Translation)
├── models/              # Pydantic/SQLAlchemy models
├── routers/             # API Endpoints
├── services/            # DB and external service logic
└── tools/               # Agent tools

frontend/
├── src/
│   ├── components/      # Chatbot, Auth UI
│   ├── pages/           # Login, Signup, Forgot Password
│   └── theme/           # Docusaurus theme overrides
└── docs/                # Book content (Chatbot target)
```

**Structure Decision**: Web application structure with distinct `frontend/` (Docusaurus) and `backend/` (FastAPI) directories.

## Implementation Phases

### 🖥️ PHASE 1 — FRONTEND (Pehle Ye Poora Karo)

1. **Task 1 — Signup Button Ka Redirect Fix Karo**
   - Fix redirect from `/signup` to `/physical-ai-book/signup`.
2. **Task 2 — Forgot Password Page Banao**
   - Create functional page at `/physical-ai-book/forgot-password`.
3. **Task 3 — Login & Signup System — Better Auth Se Implement Karo**
   - Poora login/signup system **Better Auth** se implement karo.
4. **Task 4 — Signup Ke Baad Wale Questions — Frontend Mein Shift Karo**
   - Migrate signup questionnaire logic from backend to frontend.
5. **Task 5 — Chatbot Fix Karo Aur Sirf Book Page Par Lagao**
   - Restrict chatbot to `/physical-ai-book/docs/*` routes.
6. **Task 6 — Personalization Agent Fix Karo**
   - Agent logic check for input/output and personalization.
7. **Task 7 — Translation Agent Fix Karo**
   - Agent logic check for Urdu translation accuracy.
8. **Task 8 — Agents Ko Saare Tools Ka Access Do (Frontend Side)**
   - Register all available tools in the frontend/agent layer.

---

### ⚙️ PHASE 2 — BACKEND (Sirf User Approval Ke Baad)

9. **Task 9 — Neon PostgreSQL Verify Aur Fix Karo**
   - Ensure tables exist and Better Auth is correctly connected.
10. **Task 10 — Vector Embeddings Creation Fix Karo**
    - Verify and fix embedding generation logic.
11. **Task 11 — Qdrant Cloud Mein Embeddings Store Karo**
    - Ensure generated embeddings are successfully stored in Qdrant.
12. **Task 12 — Qdrant Ke Baad Calling Aur Retrieval Fix Karo**
    - Fix RAG retrieval and search queries.
13. **Task 13 — Qdrant Ke Saare Tools Verify Karo**
    - Ensure all Qdrant tools (search, retrieve, etc.) are functional.
14. **Task 14 — Agents Ko Backend Se Saare Tools Ka Access Do**
    - Register all tools in the backend agent layer.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
