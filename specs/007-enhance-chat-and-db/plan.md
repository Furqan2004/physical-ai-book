# Implementation Plan: Enhance Chat UI and Database Chapter Storage

**Branch**: `007-enhance-chat-and-db` | **Date**: 2026-03-09 | **Spec**: [specs/007-enhance-chat-and-db/spec.md]
**Input**: Feature specification from `/specs/007-enhance-chat-and-db/spec.md`

## Summary
Modernize the frontend chat interface with an auto-resizing input and interactive pre-fill behavior. Implement a PostgreSQL-backed content retrieval system for book chapters to optimize performance and eliminate external dependencies like web crawling.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend), Python 3.11+ (Backend)
**Primary Dependencies**: Docusaurus v3.9, FastAPI, asyncpg, OpenAI Agents SDK
**Storage**: Neon PostgreSQL (relational), Qdrant Cloud (vector)
**Testing**: Manual UI verification, DB inspection scripts (`verify_chapters.py`)
**Target Platform**: Linux (Hugging Face / GitHub Pages)
**Project Type**: Fullstack (Frontend + Backend)
**Performance Goals**: <50ms DB retrieval for chapters, smooth UI expansion for chat input.
**Constraints**: Support for multi-line technical queries using `Shift+Enter`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Rule 1: No agent-generated content (Content is synced from source markdown).
- [x] Rule 4: Structured code (New model in `backend/models/chapter.py`).
- [x] Rule 5: Chunked implementation (Completed in logical phases).
- [x] Rule 8: Build must pass.

## Project Structure

### Documentation (this feature)

```text
specs/007-enhance-chat-and-db/
├── plan.md              # This file
├── research.md          # Completed findings
├── data-model.md        # Chapter entity details
├── quickstart.md        # Verification guide
└── tasks.md             # Implementation roadmap
```

### Source Code (repository root)

```text
backend/
├── models/
│   └── chapter.py       # Pydantic model for PG chapters
├── routers/
│   ├── personalize.py   # Robust error handling with user-facing messages
│   └── translate.py     # Robust error handling with user-facing messages
├── services/
│   ├── db_service.py    # Added get_chapter and save_chapter
│   ├── doc_service.py   # Refactored to prioritize PostgreSQL retrieval
│   └── sync_service.py  # Enhanced to sync chapters to PG on startup
└── scripts/
    └── setup_db.py      # Updated with chapters table definition

frontend/
├── src/
│   ├── components/
│   │   └── ChatWidget/
│   │       ├── ChatWindow.tsx       # Textarea auto-resize, pre-fill logic
│   │       └── TextSelectionPopup.tsx # Interactive Ask trigger
│   └── utils/
│       └── api.ts       # Unified error handling for AI responses
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations identified. | N/A |

## Phase 0: Research & Decisions (Complete)
- **Decision**: Use viewport-relative positioning for popups to handle scroll offsets.
- **Decision**: Replace `input` with `textarea` for multi-line support.
- **Decision**: Standardize on `@site/docs/` slug format for database lookups.

## Phase 1: Implementation (Complete)
- **Database**: `chapters` table created and populated.
- **Backend**: `doc_service.py` refactored to fetch from PG. Error handling added to routers.
- **Frontend**: Chat input upgraded to auto-resizing textarea. "Ask about this" now pre-fills the input.

## Phase 2: Validation (Complete)
- **Sync Verified**: `verify_chapters.py` confirms 16 chapters synced.
- **UI Verified**: `ChatWindow.tsx` handles `Shift+Enter` and auto-resize.
- **Error Handling**: Standardized "Please try again" messages confirmed in routers and components.
