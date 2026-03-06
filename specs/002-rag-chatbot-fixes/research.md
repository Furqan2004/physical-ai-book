# Phase 0 Research: AI Book Assistant RAG Fixes

**Feature**: 002-rag-chatbot-fixes  
**Date**: 2026-03-06  
**Purpose**: Resolve all NEEDS CLARIFICATION items and validate technical unknowns

---

## Research Task 0.1: Qdrant Embedding Dimension

**Question**: Does hardcoded `VECTOR_SIZE = 768` match actual embedding dimension from OpenRouter?

**Investigation**: 
- File: `backend/services/qdrant_service.py`
- Line: `VECTOR_SIZE = 768  # Size for nvidia/llama-nemotron-embed-vl-1b-v2:free`
- Embedding function in `backend/services/openrouter_service.py` uses model `nvidia/llama-nemotron-embed-vl-1b-v2:free`

**Finding**: ⚠️ **POTENTIAL ISSUE** — Hardcoded dimension should be dynamically detected

**Decision**: Change to dynamic dimension detection
```python
# In qdrant_service.py
def get_vector_size() -> int:
    """Get actual embedding dimension dynamically"""
    from services.openrouter_service import get_embedding
    test_embedding = get_embedding("test")
    return len(test_embedding)
```

**Rationale**: Spec requirement FR-016 mandates dynamic detection. If embedding model changes, hardcoded value will break.

**Alternatives Considered**: 
- Keep hardcoded 768 (rejected — violates spec, brittle)
- Store dimension in env var (rejected — still requires manual update)

---

## Research Task 0.2: CORS Configuration for GitHub Pages

**Question**: Is GitHub Pages URL included in CORS_ORIGINS?

**Investigation**:
- File: `backend/main.py`
- Line: `origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")`
- `.env.example` shows: `CORS_ORIGINS=http://localhost:3000,https://yourusername.github.io`

**Finding**: ✅ **CONFIGURATION ISSUE** — Production `.env` file likely missing GitHub Pages URL

**Current docusaurus.config.ts**:
```typescript
url: 'https://Furqan2004.github.io',
baseUrl: '/physical-ai-book/',
```

**Required CORS_ORIGINS**:
```
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://furqan2004.github.io
```

**Note**: URL must be exact — no trailing slash, correct case.

---

## Research Task 0.3: Database Tables Validation

**Question**: Do required tables exist in Neon Postgres?

**Investigation**:
- File: `backend/services/db_service.py`
- Tables referenced:
  - `users` — used in `create_user`, `get_user_by_email`
  - `user_background` — used in `save_user_background`, `get_user_background`
  - `sessions` — used in `create_auth_session`, `get_session_by_token`
  - `chat_sessions` — used in `create_chat_session`
  - `chat_messages` — used in `save_chat_message`, `get_chat_history`
  - `book_chunks` — used in `save_chunk_metadata`

**Finding**: ❓ **UNKNOWN** — Need to verify tables exist via migration script

**Action Required**: Run database validation script:
```bash
python -m backend.scripts.setup_db
```

**Expected Schema**:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_background (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    software_experience VARCHAR(50),
    hardware_background VARCHAR(50),
    known_languages TEXT[],
    learning_style VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(512) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES chat_sessions(id),
    role VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE book_chunks (
    qdrant_id VARCHAR(255) PRIMARY KEY,
    chapter_name VARCHAR(255) NOT NULL,
    heading VARCHAR(512),
    source_file VARCHAR(255) NOT NULL,
    chunk_index INTEGER NOT NULL,
    content_preview TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Research Task 0.4: Qdrant Collection Validation

**Question**: Does Qdrant collection exist and contain data?

**Investigation**:
- File: `backend/services/qdrant_service.py`
- Collection name: `book_content`
- Hardcoded vector size: 768

**Finding**: ❓ **UNKNOWN** — Need to run validation script

**Validation Script Required**:
```python
from backend.services.qdrant_service import get_qdrant_client, COLLECTION_NAME
from backend.services.openrouter_service import get_embedding

client = get_qdrant_client()

# Check collection exists
exists = client.collection_exists(COLLECTION_NAME)
print(f"Collection exists: {exists}")

# Check vector dimension
if exists:
    info = client.get_collection(COLLECTION_NAME)
    stored_dim = info.config.params.vectors.size
    actual_dim = len(get_embedding("test"))
    print(f"Stored dimension: {stored_dim}")
    print(f"Actual dimension: {actual_dim}")
    print(f"Match: {stored_dim == actual_dim}")

# Check point count
count = client.count(COLLECTION_NAME)
print(f"Total points: {count.count}")
```

---

## Research Task 0.5: OpenRouter Embedding Format

**Question**: Does embedding function use correct OpenRouter format?

**Investigation**:
- File: `backend/services/openrouter_service.py`
- Model: `nvidia/llama-nemotron-embed-vl-1b-v2:free`
- Input format: `input=[{"content": [{"type": "text", "text": text}]}]`

**Finding**: ✅ **CORRECT** — Using special OpenRouter format as required

**Code is correct**:
```python
response = embeddings_client.embeddings.create(
    extra_headers={
        "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:3000"),
        "X-OpenRouter-Title": os.getenv("SITE_NAME", "AI Book"),
    },
    model="nvidia/llama-nemotron-embed-vl-1b-v2:free",
    input=[{"content": [{"type": "text", "text": text}]}],  # ← Correct format
    encoding_format="float"
)
```

**Note**: This is NOT standard OpenAI format. Standard would be `input=text`. The nested format is required for this specific model.

---

## Research Task 0.6: Chat Endpoint Authorization

**Question**: Is chat endpoint requiring authentication when it should allow guests?

**Investigation**:
- File: `backend/routers/chat.py`
- Line: `current_user: dict = Depends(get_authenticated_user)`
- Dependency: `get_authenticated_user` from `routers.deps`

**Finding**: ❌ **REQUIRES FIX** — Authorization is currently REQUIRED

**Current code**:
```python
@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: dict = Depends(get_authenticated_user)  # ← REQUIRED
):
```

**Required change**:
```python
from typing import Optional

@router.post("/chat")
async def chat(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_authenticated_user)  # ← OPTIONAL
):
    is_guest = current_user is None
    # ... rest of logic
```

**Also need to fix dependency** in `routers/deps.py`:
```python
async def get_authenticated_user(
    authorization: Optional[str] = Header(None)  # ← Make optional
) -> Optional[dict]:
    if not authorization or not authorization.startswith("Bearer "):
        return None  # ← Return None instead of raising 401
    # ... rest
```

---

## Research Task 0.7: Frontend API URL Configuration

**Question**: Is frontend using environment variable for API URL?

**Investigation**:
- File: `frontend/src/utils/api.ts`
- Line: `const API_URL = (typeof window !== 'undefined' && (window as any).API_URL) || 'http://localhost:8000';`

**Finding**: ⚠️ **PARTIAL ISSUE** — Uses `window.API_URL` fallback, but no env var setup

**Problem**: Docusaurus doesn't support `process.env` directly. Need to inject via build process.

**Solution Options**:

**Option A: Custom webpack config** (recommended)
```javascript
// docusaurus.config.ts
module.exports = {
  // ...
  webpack: {
    define: {
      'window.API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8000'),
    },
  },
};
```

**Option B: Runtime injection via HTML**
```html
<!-- In a custom HTML file or docusaurus.config.ts -->
<script>
  window.API_URL = '{{API_URL}}';
</script>
```

**Option C: Use import.meta.env (Vite-style)**
- Not supported by Docusaurus without ejecting

**Decision**: Use Option A — webpack define plugin in docusaurus.config.ts

---

## Research Task 0.8: Missing Auth Pages

**Question**: What auth pages exist in frontend?

**Investigation**:
- Directory: `frontend/src/pages/`
- Files found: NONE (empty directory)

**Finding**: ❌ **MISSING** — All auth pages need to be created

**Required Pages**:
1. `/login.tsx` — Email/password signin
2. `/signup.tsx` — Registration + background questions
3. `/profile/index.tsx` — User profile/settings
4. `/forgot-password.tsx` — Password reset (optional, nice-to-have)
5. `/verify-email.tsx` — Email verification (optional, depends on Better-Auth flow)

**Auth Flow**:
```
Signup → POST /auth/signup → Store token → Redirect to /profile
Login → POST /auth/signin → Store token → Redirect to /
Profile → GET /auth/me (with token) → Display user info
```

---

## Research Task 0.9: Better-Auth vs Custom JWT

**Question**: Is Better-Auth library used or custom JWT?

**Investigation**:
- File: `backend/services/auth_service.py`
- Imports: `passlib`, `python-jose` (JWT library)
- No Better-Auth imports found

**Finding**: ⚠️ **NAMING MISMATCH** — Spec mentions "Better-Auth" but code uses custom JWT

**Current Implementation**:
- Password hashing: `passlib` (bcrypt)
- JWT tokens: `python-jose`
- Session storage: Custom `sessions` table

**Better-Auth** is a separate library (`better-auth` npm package for Node.js).

**Decision**: 
- **Option A**: Keep custom JWT (simpler, already implemented)
- **Option B**: Migrate to Better-Auth (more features, but requires rewrite)

**Recommendation**: Keep custom JWT implementation. Rename spec references from "Better-Auth" to "JWT Authentication" to avoid confusion.

**Rationale**: 
- Custom JWT is already working
- Migration would require significant changes
- Functionality is equivalent (JWT tokens, session management)

---

## Summary of Findings

| Task | Status | Severity | Action Required |
|------|--------|----------|-----------------|
| 0.1 Vector Dimension | ⚠️ Issue | Medium | Make dynamic |
| 0.2 CORS Config | ⚠️ Issue | High | Add GitHub Pages URL |
| 0.3 DB Tables | ❓ Unknown | High | Run validation |
| 0.4 Qdrant Collection | ❓ Unknown | High | Run validation |
| 0.5 Embedding Format | ✅ Correct | — | No action |
| 0.6 Chat Auth | ❌ Issue | High | Make optional |
| 0.7 Frontend API URL | ⚠️ Issue | Medium | Add webpack define |
| 0.8 Auth Pages | ❌ Missing | High | Create pages |
| 0.9 Better-Auth Name | ⚠️ Mismatch | Low | Rename in spec |

---

## Next Steps

1. **Immediate**: Run database and Qdrant validation scripts
2. **High Priority**: Fix CORS, chat auth, frontend API URL
3. **Medium Priority**: Fix vector dimension detection
4. **Create**: Auth pages (login, signup, profile)
5. **Document**: Update spec to reflect custom JWT (not Better-Auth)
