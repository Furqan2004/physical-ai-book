# Data Model: AI Book Assistant RAG Fixes

**Feature**: 002-rag-chatbot-fixes  
**Date**: 2026-03-06  
**Source**: Analysis of `backend/services/db_service.py` and `backend/models/`

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ PK id           │
│    name         │
│    email        │
│    hashed_pw    │
│    created_at   │
│    updated_at   │
└────────┬────────┘
         │
         │ 1:1
         │
         ▼
┌─────────────────┐
│ user_background │
├─────────────────┤
│ PK user_id      │───┐
│    software_exp │   │
│    hardware_exp │   │
│    languages[]  │   │
│    learning_st  │   │
│    created_at   │   │
└─────────────────┘   │
                      │
         ┌────────────┘
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│   chat_sessions │       │    sessions     │
├─────────────────┤       ├─────────────────┤
│ PK id           │       │ PK id           │
│    session_token│       │    user_id      │
│    user_id      │       │    token        │
│    created_at   │       │    expires_at   │
└────────┬────────┘       │    created_at   │
         │ 1:N            └─────────────────┘
         │
         ▼
┌─────────────────┐
│  chat_messages  │
├─────────────────┤
│ PK id           │
│    session_id   │
│    role         │
│    content      │
│    created_at   │
└─────────────────┘

┌─────────────────┐
│   book_chunks   │  (metadata only, actual vectors in Qdrant)
├─────────────────┤
│ PK qdrant_id    │
│    chapter_name │
│    heading      │
│    source_file  │
│    chunk_index  │
│    content_prev │
│    created_at   │
└─────────────────┘
```

---

## Entity Definitions

### User

**Purpose**: Represents a registered user account

**Attributes**:
- `id` (UUID, PK): Unique user identifier
- `name` (VARCHAR 255): User's full name
- `email` (VARCHAR 255, UNIQUE): Login email
- `hashed_password` (VARCHAR 255): Bcrypt-hashed password
- `created_at` (TIMESTAMP): Account creation time
- `updated_at` (TIMESTAMP): Last profile update

**Validation Rules**:
- Email must be unique
- Password must be hashed before storage
- Name cannot be empty

**Relationships**:
- 1:1 with `user_background`
- 1:N with `sessions`
- 1:N with `chat_sessions`

---

### UserBackground

**Purpose**: Stores user's technical background for personalization

**Attributes**:
- `user_id` (UUID, PK, FK → users.id): User reference
- `software_experience` (VARCHAR 50): Experience level (beginner/intermediate/advanced)
- `hardware_background` (VARCHAR 50): Hardware experience level (basic/advanced)
- `known_languages` (TEXT[]): Array of programming languages
- `learning_style` (VARCHAR 50): Preferred learning approach
- `created_at` (TIMESTAMP): Profile creation time

**Validation Rules**:
- Must have valid user_id
- software_experience must be one of: beginner, intermediate, advanced
- Upsert logic: ON CONFLICT (user_id) DO UPDATE

**Relationships**:
- 1:1 with `users`

**Usage**:
- Injected into AI prompts for personalization (FR-011)
- Used to determine content complexity

---

### Session

**Purpose**: Authentication session tracking

**Attributes**:
- `id` (UUID, PK): Session identifier
- `user_id` (UUID, FK → users.id): User reference
- `token` (VARCHAR 512, UNIQUE): JWT token string
- `expires_at` (TIMESTAMP): Token expiration time
- `created_at` (TIMESTAMP): Session creation time

**Validation Rules**:
- Token must be unique
- expires_at must be in the future for valid session
- Token format: JWT (HS256 algorithm)

**Relationships**:
- N:1 with `users`

**Business Logic**:
- Sessions expire after 30 days (ACCESS_TOKEN_EXPIRE_DAYS)
- Deleted on logout
- Validated on every protected API call

---

### ChatSession

**Purpose**: Groups chat messages into conversations

**Attributes**:
- `id` (UUID, PK): Session identifier
- `session_token` (VARCHAR 255, UNIQUE): External token for session access
- `user_id` (UUID, FK → users.id): User reference (NULL for guest sessions)
- `created_at` (TIMESTAMP): Session creation time

**Validation Rules**:
- session_token must be unique
- user_id can be NULL for guest chat sessions

**Relationships**:
- N:1 with `users`
- 1:N with `chat_messages`

**Business Logic**:
- Guest sessions: user_id is NULL
- Logged-in sessions: user_id is required
- Sessions persist indefinitely (no auto-delete)

---

### ChatMessage

**Purpose**: Individual chat message in a conversation

**Attributes**:
- `id` (UUID, PK): Message identifier
- `session_id` (UUID, FK → chat_sessions.id): Parent session
- `role` (VARCHAR 50): Message role (user/assistant)
- `content` (TEXT): Message content
- `created_at` (TIMESTAMP): Message timestamp

**Validation Rules**:
- role must be "user" or "assistant"
- content cannot be empty
- Messages ordered by created_at ASC

**Relationships**:
- N:1 with `chat_sessions`

**Business Logic**:
- Guest messages: NOT saved (FR-004)
- User messages: Saved with session association (FR-010)
- Retrieved in chronological order

---

### BookChunk

**Purpose**: Metadata for book content chunks (actual vectors in Qdrant)

**Attributes**:
- `qdrant_id` (VARCHAR 255, PK): Qdrant vector ID
- `chapter_name` (VARCHAR 255): Chapter title
- `heading` (VARCHAR 512): Section heading within chapter
- `source_file` (VARCHAR 255): Original MDX file path
- `chunk_index` (INTEGER): Chunk sequence number
- `content_preview` (TEXT): First 200 chars of chunk content
- `created_at` (TIMESTAMP): Indexing timestamp

**Validation Rules**:
- qdrant_id must match Qdrant vector ID
- chunk_index must be >= 0
- source_file should be relative path

**Relationships**:
- 1:1 with Qdrant vector (external)

**Business Logic**:
- Metadata only — actual embedding vectors stored in Qdrant
- Used for citation and source tracking
- Helps identify which book section a vector came from

---

## State Transitions

### User Authentication Flow

```
[Anonymous] 
    ↓ (signup)
[Registered] 
    ↓ (signin)
[Authenticated] 
    ↓ (signout/token expire)
[Anonymous]
```

### Chat Session States

```
[New Session]
    ↓ (first message)
[Active]
    ↓ (user adds messages)
[Active]
    ↓ (session abandoned)
[Dormant] (no auto-cleanup)
```

### Personalization State

```
[No Profile]
    ↓ (save background)
[Personalized]
    ↓ (update profile)
[Personalized]
```

---

## Indexes

**Recommended Database Indexes**:

```sql
-- Users
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- User Background
CREATE INDEX idx_user_background_user_id ON user_background(user_id);

-- Sessions
CREATE UNIQUE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Chat Sessions
CREATE UNIQUE INDEX idx_chat_sessions_token ON chat_sessions(session_token);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- Chat Messages
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- Book Chunks
CREATE INDEX idx_book_chunks_chapter ON book_chunks(chapter_name);
CREATE INDEX idx_book_chunks_source ON book_chunks(source_file);
```

---

## Qdrant Vector Collection

**Collection Name**: `book_content`

**Vector Configuration**:
- Dimension: Dynamic (detected from embedding function, currently 768)
- Distance: COSINE
- Collection: Single (Free Tier limit)

**Point Payload Schema**:
```json
{
  "content": "string",           // Full chunk text
  "chapter_name": "string",      // Chapter title
  "heading": "string",           // Section heading
  "source_file": "string",       // MDX file path
  "chunk_index": "number",       // Chunk sequence
  "score": "number"              // Search score (computed)
}
```

**Search Parameters**:
- top_k: 5 (default)
- Score threshold: 0.3 (filter low-relevance results)
- Return format: List of dicts with content + metadata

---

## Validation Rules Summary

| Entity | Field | Rule |
|--------|-------|------|
| User | email | Unique, valid email format |
| User | password | Min 8 chars, hashed before storage |
| UserBackground | software_experience | Enum: beginner/intermediate/advanced |
| UserBackground | known_languages | Array of strings |
| Session | token | Unique, valid JWT, not expired |
| ChatMessage | role | Enum: user/assistant |
| ChatMessage | content | Non-empty text |
| BookChunk | qdrant_id | Must exist in Qdrant |
| BookChunk | chunk_index | Integer >= 0 |

---

## Data Retention

| Entity | Retention Policy |
|--------|------------------|
| users | Indefinite (until user deletion) |
| user_background | Indefinite (updated with profile) |
| sessions | 30 days (expires_at) |
| chat_sessions | Indefinite (no auto-cleanup) |
| chat_messages | Indefinite (tied to session) |
| book_chunks | Indefinite (until re-indexing) |

**Note**: No GDPR deletion flow implemented yet. User data persists indefinitely.
