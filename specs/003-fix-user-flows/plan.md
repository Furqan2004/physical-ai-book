# Implementation Plan: Fix User Flows and AI Features

**Branch**: `003-fix-user-flows` | **Date**: 2026-03-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification for routing, authentication UI, AI features, and streaming removal

## Summary

Fix four critical problems in the Physical AI book application:
1. **Routing**: Connect existing pages to proper routes, create root page, fix logout redirect
2. **Three Broken Features**: Fix "Ask AI" text selection popup, Personalize button, and Urdu Translation
3. **Navbar**: Create professional structured navigation bar
4. **Remove Streaming**: Convert AI responses from streaming to complete-response-first approach

Technical approach: Backend analysis revealed all AI endpoints use `Runner.run_streamed()` which will be converted to `Runner.run_sync()`. Frontend already has text selection hook and popup components that need proper integration.

## Technical Context

**Language/Version**: TypeScript 5.x (Docusaurus frontend), Python 3.11 (FastAPI backend)
**Primary Dependencies**: 
- Frontend: @docusaurus/core v3.9.x, React
- Backend: FastAPI 0.115.0, OpenAI Agents SDK 0.0.15, python-jose
**Storage**: Neon Serverless Postgres (relational data), Qdrant Cloud Free Tier (vectors for RAG)
**Testing**: Manual testing via browser, backend API testing
**Target Platform**: Web application (GitHub Pages deployment)
**Project Type**: Web application with separate frontend (Docusaurus) and backend (FastAPI)
**Performance Goals**: 
- AI responses displayed within 2 seconds of generation completion
- Text selection popup appears within 100ms
- Personalization/translation complete within 3 seconds
**Constraints**: 
- Must work with existing Docusaurus structure
- Must maintain backward compatibility with guest chat
- No new npm packages without permission
**Scale/Scope**: 
- 6 routes to fix/create
- 3 backend endpoints to convert from streaming
- 1 navbar component to restructure
- Multiple link/button fixes across codebase

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Constitution Principles Compliance

| Principle | Compliance | Notes |
|-----------|------------|-------|
| **RULE 1**: Apni Taraf Se Kuch Nahi | ✅ PASS | No content being added; only fixing existing features |
| **RULE 2**: Source-Verified-Researcher | ✅ N/A | Not adding book content; fixing code features |
| **RULE 3**: Docusaurus Template | ✅ PASS | Following existing Docusaurus conventions |
| **RULE 4**: Code Bilkul Structured | ✅ PASS | All files in proper locations |
| **RULE 5**: Ek Kaam Ek Waqt Mein | ✅ PASS | Implementation will be chunk-by-chunk |
| **RULE 6**: Koi Undocumented Decision | ✅ PASS | All decisions documented in this plan |
| **RULE 7**: RAG-Ready Architecture | ✅ PASS | Not modifying MDX structure |
| **RULE 8**: Build Hamesha Pass | ✅ PASS | Will verify build after each major change |
| **RULE 9**: Branding Sirf Approved Jagahon | ✅ PASS | CSS changes only in `src/css/custom.css` |
| **RULE 10**: Book Content Sirf Course Outline | ✅ PASS | Not modifying book content |

**GATE RESULT**: ✅ PASS - All constitution principles satisfied. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/003-fix-user-flows/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (codebase analysis)
├── data-model.md        # Phase 1 output (not needed - no data model changes)
├── quickstart.md        # Phase 1 output (testing guide)
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (task breakdown)
```

### Source Code (repository root)

```text
backend/
├── routers/
│   ├── chat.py              # FIX: Convert from streaming to non-streaming
│   ├── personalize.py       # FIX: Convert from streaming to non-streaming
│   ├── translate.py         # FIX: Convert from streaming to non-streaming
│   └── auth.py              # VERIFY: Password verification
├── services/
│   └── auth_service.py      # VERIFY: Session validation
└── main.py                  # OK: Root endpoint exists

frontend/
├── src/
│   ├── pages/
│   │   ├── index.tsx        # OK: Root page exists
│   │   ├── login.tsx        # OK: Login page
│   │   ├── signup.tsx       # OK: Signup page
│   │   ├── profile/
│   │   │   └── index.tsx    # OK: Profile page
│   │   └── onboarding.tsx   # OK: Onboarding page
│   ├── components/
│   │   ├── AuthButtons.tsx  # FIX: May need navbar integration
│   │   ├── ChatWidget/
│   │   │   ├── index.tsx    # OK: Widget with text selection
│   │   │   └── TextSelectionPopup.tsx  # OK: Popup for logged-in users
│   │   ├── ChapterPersonalize.tsx  # FIX: Connect to non-streaming API
│   │   └── ChapterTranslate.tsx    # FIX: Connect to non-streaming API
│   ├── hooks/
│   │   └── useSelectedText.ts # OK: Text selection hook
│   ├── utils/
│   │   └── api.ts           # FIX: Add non-streaming fetch method
│   └── theme/
│       └── Root.tsx         # OK: Auth context provider
├── docusaurus.config.ts     # FIX: Add navbar structure
└── sidebars.ts              # OK: Navigation sidebar
```

**Structure Decision**: Web application structure (Option 2) with separate frontend and backend. All directories exist and match the expected structure.

## Phase 0: Research & Codebase Analysis

### Research Summary

**Completed**: Full codebase analysis (frontend + backend)

### Key Findings

#### Frontend Analysis

**Pages Status**:
| Page | Route | File | Status |
|------|-------|------|--------|
| Home | `/` | `src/pages/index.tsx` | ✅ EXISTS |
| Login | `/login` | `src/pages/login.tsx` | ✅ EXISTS |
| Signin | `/signin` | `src/pages/signin.tsx` | ✅ EXISTS (duplicate) |
| Signup | `/signup` | `src/pages/signup.tsx` | ✅ EXISTS |
| Profile | `/profile` | `src/pages/profile/index.tsx` | ✅ EXISTS |
| Onboarding | `/onboarding` | `src/pages/onboarding.tsx` | ✅ EXISTS |

**Auth System**:
- Auth context in `Root.tsx` provides `useAuth()` hook
- Token stored in localStorage (`auth_token`, `auth_user`)
- `apiFetch()` utility handles Bearer token injection
- Protected routes redirect to `/signin`

**Navbar Status**:
- Current navbar in `docusaurus.config.ts` has basic structure
- Shows static "GitHub" link
- **MISSING**: Dynamic Login/Signup or Profile/Logout buttons based on auth state
- `AuthButtons.tsx` component exists but not integrated in navbar

**AI Features Status**:
- `TextSelectionPopup.tsx` - EXISTS, works on `/docs/*` routes for logged-in users
- `useSelectedText.ts` hook - EXISTS, detects text selection
- `ChapterPersonalize.tsx` - EXISTS, but uses streaming API
- `ChapterTranslate.tsx` - EXISTS, but uses streaming API
- `ChatWidget/index.tsx` - EXISTS, integrates all features

**Issue Identified**: Frontend components expect streaming responses (SSE format), need to convert to JSON responses

#### Backend Analysis

**API Endpoints**:
| Endpoint | Method | Auth | Status | Issue |
|----------|--------|------|--------|-------|
| `/` | GET | No | ✅ EXISTS | Returns welcome message |
| `/health` | GET | No | ✅ EXISTS | Health check |
| `/auth/signup` | POST | No | ✅ EXISTS | Creates user + JWT |
| `/auth/signin` | POST | No | ⚠️ ISSUE | Password verification commented out |
| `/auth/signout` | POST | Yes | ✅ EXISTS | Invalidates session |
| `/auth/me` | GET | Yes | ✅ EXISTS | Returns user profile |
| `/user/background` | POST | Yes | ✅ EXISTS | Saves user background |
| `/api/chat` | POST | Optional | ⚠️ STREAMING | Uses `Runner.run_streamed()` |
| `/api/chat/history` | GET | Yes | ✅ EXISTS | Returns chat history |
| `/api/personalize` | POST | Yes | ⚠️ STREAMING | Uses `Runner.run_streamed()` |
| `/api/translate` | POST | Yes | ⚠️ STREAMING | Uses `Runner.run_streamed()` |

**Streaming Code Locations** (to fix):

1. **`backend/routers/chat.py`** (Lines 52-89):
   - `Runner.run_streamed()` → Change to `Runner.run_sync()`
   - Remove `async for event in result.stream_events()` loop
   - Return JSON: `{"response": full_response, "session_id": ...}`

2. **`backend/routers/personalize.py`** (Lines 19-44):
   - `Runner.run_streamed()` → Change to `Runner.run_sync()`
   - Remove streaming loop
   - Return JSON: `{"personalized_content": full_response, ...}`

3. **`backend/routers/translate.py`** (Lines 19-44):
   - `Runner.run_streamed()` → Change to `Runner.run_sync()`
   - Remove streaming loop
   - Return JSON: `{"translated_content": full_response, ...}`

**Auth Issues Identified**:
- Password verification in signin is commented out (security issue)
- Session validation exists in DB but not used in token verification

### Research Conclusions

**No NEEDS CLARIFICATION items** - All unknowns resolved through codebase analysis.

**Decisions Made**:
1. Keep existing page structure (no duplicate removal needed yet)
2. Convert all 3 streaming endpoints to non-streaming
3. Update frontend `apiFetch()` to support both streaming and non-streaming
4. Integrate `AuthButtons` into navbar dynamically
5. Fix logout redirect to `/` root

## Phase 1: Design & Contracts

### API Contracts

#### 1. Chat Endpoint (Non-Streaming)

**Current** (Streaming):
```http
POST /api/chat
Content-Type: application/json
Authorization: Bearer <token> (optional for guest mode)

{"message": "...", "session_id": "..."}

Response: text/event-stream (SSE)
```

**New** (Non-Streaming):
```http
POST /api/chat
Content-Type: application/json
Authorization: Bearer <token> (optional for guest mode)

{"message": "...", "session_id": "..."}

Response: 200 OK
Content-Type: application/json

{
  "response": "Complete AI answer here",
  "session_id": "..."
}
```

#### 2. Personalize Endpoint (Non-Streaming)

**Current** (Streaming):
```http
POST /api/personalize
Authorization: Bearer <token>
Content-Type: application/json

{"chapter_content": "...", "chapter_id": "..."}

Response: text/event-stream (SSE)
```

**New** (Non-Streaming):
```http
POST /api/personalize
Authorization: Bearer <token>
Content-Type: application/json

{"chapter_content": "...", "chapter_id": "..."}

Response: 200 OK
Content-Type: application/json

{
  "personalized_content": "Complete personalized chapter",
  "chapter_id": "..."
}
```

#### 3. Translate Endpoint (Non-Streaming)

**Current** (Streaming):
```http
POST /api/translate
Authorization: Bearer <token>
Content-Type: application/json

{"chapter_content": "...", "chapter_id": "..."}

Response: text/event-stream (SSE)
```

**New** (Non-Streaming):
```http
POST /api/translate
Authorization: Bearer <token>
Content-Type: application/json

{"chapter_content": "...", "chapter_id": "..."}

Response: 200 OK
Content-Type: application/json

{
  "translated_content": "Complete Urdu translation",
  "chapter_id": "..."
}
```

### Frontend Changes

#### 1. API Utility Update

**File**: `frontend/src/utils/api.ts`

**Add** non-streaming fetch method:
```typescript
/**
 * Non-streaming fetch for AI responses
 */
export async function apiFetchComplete(
  endpoint: string,
  body: object,
  auth: boolean = false
): Promise<string> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }, auth);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Request failed');
  }

  const data = await response.json();
  return data.response || data.personalized_content || data.translated_content;
}
```

#### 2. ChapterPersonalize Update

**File**: `frontend/src/components/ChapterPersonalize.tsx`

**Change**: Replace streaming reader with simple JSON response:
```typescript
// OLD: Streaming reader code (remove lines 47-67)
const reader = response.body?.getReader();
// ... streaming loop ...

// NEW: Simple JSON response
const data = await response.json();
const fullContent = data.personalized_content;
```

#### 3. ChapterTranslate Update

**File**: `frontend/src/components/ChapterTranslate.tsx`

**Change**: Same as Personalize - replace streaming with JSON

#### 4. Navbar Integration

**File**: `frontend/docusaurus.config.ts`

**Add** dynamic navbar items using React component:
```typescript
// Need to create custom navbar component
// OR use client-side module injection
```

**Better Approach**: Create `Navbar.tsx` component that uses `useAuth()` hook

#### 5. Logout Redirect Fix

**File**: `frontend/src/theme/Root.tsx`

**Change** logout function:
```typescript
const logout = async () => {
  try {
    await apiFetch('/auth/signout', { method: 'POST' }, true);
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    // Redirect to root
    window.location.href = '/';
  }
};
```

### Testing Guide (Quickstart)

#### Backend Testing

```bash
# Start backend
cd backend
source venv/bin/activate
python main.py

# Test non-streaming chat
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "session_id": "test"}'

# Should return JSON, not SSE stream
```

#### Frontend Testing

```bash
# Start frontend
cd frontend
npm run start

# Test routes
# 1. Navigate to http://localhost:3000/physical-ai-book/
# 2. Test login/signup
# 3. Test logout redirect to /
# 4. Test text selection on /docs/* pages
# 5. Test personalize/translate buttons
```

### Implementation Checklist

**Phase 1A: Backend Streaming Removal**
- [ ] Fix `backend/routers/chat.py` - convert to non-streaming
- [ ] Fix `backend/routers/personalize.py` - convert to non-streaming
- [ ] Fix `backend/routers/translate.py` - convert to non-streaming
- [ ] Test all 3 endpoints return JSON

**Phase 1B: Frontend API Updates**
- [ ] Add `apiFetchComplete()` to `api.ts`
- [ ] Update `ChapterPersonalize.tsx` - remove streaming code
- [ ] Update `ChapterTranslate.tsx` - remove streaming code

**Phase 1C: Navbar & Routing**
- [ ] Create dynamic navbar component
- [ ] Integrate AuthButtons into navbar
- [ ] Fix logout redirect to `/`
- [ ] Audit all links/buttons for correct routes

**Phase 1D: Testing**
- [ ] Test all routes accessible
- [ ] Test navbar shows correct buttons
- [ ] Test text selection popup
- [ ] Test personalize button
- [ ] Test translate button
- [ ] Test logout redirect

---

## Phase 2: Tasks Breakdown

**Note**: Tasks will be created by `/sp.tasks` command. This section is a placeholder.

**Expected Tasks**:
1. Backend: Convert chat endpoint to non-streaming
2. Backend: Convert personalize endpoint to non-streaming
3. Backend: Convert translate endpoint to non-streaming
4. Frontend: Add non-streaming API method
5. Frontend: Update ChapterPersonalize component
6. Frontend: Update ChapterTranslate component
7. Frontend: Create dynamic navbar
8. Frontend: Fix logout redirect
9. Frontend: Audit all route links
10. Testing: Verify all features
