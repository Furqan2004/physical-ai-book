# Data Model: AI Book RAG Chatbot System

**Created**: 2026-03-05
**Feature**: 001-rag-chatbot-auth
**Status**: Complete

---

## Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────────┐
│     users       │         │   user_background    │
├─────────────────┤         ├──────────────────────┤
│ id (UUID, PK)   │◄────────┤ user_id (UUID, FK)   │
│ email (VARCHAR) │         │ software_experience  │
│ name (VARCHAR)  │         │ hardware_background  │
│ hashed_password │         │ known_languages[]    │
│ created_at      │         │ learning_style       │
│ updated_at      │         │ created_at           │
└────────┬────────┘         └──────────────────────┘
         │
         │
         │
    ┌────┴────────────────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────────┐           ┌─────────────────┐
│    sessions     │           │  chat_sessions  │
├─────────────────┤           ├─────────────────┤
│ id (UUID, PK)   │           │ id (UUID, PK)   │
│ user_id (FK)    │           │ user_id (FK)    │
│ token (TEXT)    │           │ session_token   │
│ expires_at      │           │ created_at      │
│ created_at      │           └────────┬────────┘
└─────────────────┘                    │
                                       │
                                       ▼
                               ┌─────────────────┐
                               │  chat_messages  │
                               ├─────────────────┤
                               │ id (UUID, PK)   │
                               │ session_id (FK) │
                               │ role (VARCHAR)  │
                               │ content (TEXT)  │
                               │ created_at      │
                               └─────────────────┘

┌─────────────────┐
│   book_chunks   │  (Qdrant + Neon sync)
├─────────────────┤
│ id (UUID, PK)   │
│ qdrant_id       │  ← Points to Qdrant vector
│ chapter_name    │
│ heading         │
│ source_file     │
│ chunk_index     │
│ content_preview │
│ created_at      │
└─────────────────┘
```

---

## Entity Definitions

### User

**Purpose**: Represents a registered user with authentication credentials.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier for the user
- `email` (VARCHAR 255, Unique): User's email address, used for login
- `name` (VARCHAR 255): User's display name
- `hashed_password` (TEXT): Bcrypt-hashed password
- `created_at` (TIMESTAMP): Account creation timestamp
- `updated_at` (TIMESTAMP): Last update timestamp

**Validation Rules**:
- Email must be valid format (RFC 5322)
- Password must be at least 8 characters (enforced before hashing)
- Email must be unique across all users

**Relationships**:
- One-to-One with `user_background`
- One-to-Many with `sessions`
- One-to-Many with `chat_sessions`

---

### User Background

**Purpose**: Stores user's learning preferences for content personalization.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `user_id` (UUID, Foreign Key → users.id): Reference to user
- `software_experience` (VARCHAR 20): Experience level
  - Allowed values: `beginner`, `intermediate`, `advanced`
- `hardware_background` (TEXT, Optional): Description of hardware experience
- `known_languages` (TEXT Array): Programming languages user knows
  - Examples: `['Python', 'JavaScript', 'TypeScript']`
- `learning_style` (VARCHAR 20): Preferred learning method
  - Allowed values: `visual`, `reading`, `hands-on`
- `created_at` (TIMESTAMP): When background was completed

**Validation Rules**:
- `software_experience` must be one of the three allowed values
- `learning_style` must be one of the three allowed values
- `user_id` must reference an existing user
- Cascade delete: if user is deleted, background is also deleted

**Relationships**:
- Many-to-One with `users`

---

### Auth Session

**Purpose**: Tracks active authentication sessions for token validation.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `user_id` (UUID, Foreign Key → users.id): Reference to authenticated user
- `token` (TEXT, Unique): JWT token string
- `expires_at` (TIMESTAMP): Token expiration time (30 days from creation)
- `created_at` (TIMESTAMP): Session creation timestamp

**Validation Rules**:
- Token must be unique
- `expires_at` must be in the future for valid session
- `user_id` must reference an existing user
- Cascade delete: if user is deleted, sessions are also deleted

**Relationships**:
- Many-to-One with `users`

---

### Chat Session

**Purpose**: Represents a conversation session between user and chatbot.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `user_id` (UUID, Foreign Key → users.id, SET NULL on user delete): Reference to user
- `session_token` (VARCHAR 255, Unique): Client-side session identifier
- `created_at` (TIMESTAMP): When session was created

**Validation Rules**:
- `session_token` must be unique
- `user_id` can be NULL (if user account deleted, chat history preserved)

**Relationships**:
- Many-to-One with `users`
- One-to-Many with `chat_messages`

---

### Chat Message

**Purpose**: Individual messages within a chat conversation.

**Fields**:
- `id` (UUID, Primary Key): Unique identifier
- `session_id` (UUID, Foreign Key → chat_sessions.id): Reference to chat session
- `role` (VARCHAR 10): Message sender type
  - Allowed values: `user`, `assistant`
- `content` (TEXT): Message content
- `created_at` (TIMESTAMP): When message was sent

**Validation Rules**:
- `role` must be either 'user' or 'assistant'
- `content` cannot be empty
- `session_id` must reference an existing chat session
- Cascade delete: if session is deleted, messages are also deleted

**Relationships**:
- Many-to-One with `chat_sessions`

---

### Book Chunk

**Purpose**: Metadata for ingested book content chunks (synced with Qdrant vectors).

**Fields**:
- `id` (UUID, Primary Key): Unique identifier in Neon
- `qdrant_id` (VARCHAR 255, Unique): Corresponding vector ID in Qdrant
- `chapter_name` (VARCHAR 255): Name of the chapter
- `heading` (TEXT): Section heading within chapter
- `source_file` (VARCHAR 255): Relative path to source markdown file
- `chunk_index` (INTEGER): Order of chunk within chapter (0-indexed)
- `content_preview` (TEXT): First 200 characters of chunk content
- `created_at` (TIMESTAMP): When chunk was ingested

**Validation Rules**:
- `qdrant_id` must be unique and correspond to existing Qdrant vector
- `chunk_index` must be non-negative
- `source_file` should be relative path from docs/ folder

**Relationships**:
- None (standalone metadata table)

---

## State Transitions

### User Lifecycle

```
[Signup] → [Onboarding] → [Active] → [Logout]
                ↑              ↓
                └──────────────┘
```

1. **Signup**: User creates account with name, email, password
2. **Onboarding**: User completes background information (required before full access)
3. **Active**: User can access all features (chatbot, personalization, translation)
4. **Logout**: User session ends, but account persists

### Chat Session Lifecycle

```
[Create] → [Message Exchange] → [Close/Timeout]
              ↓
         [History Save]
```

1. **Create**: New session initialized with unique `session_token`
2. **Message Exchange**: User and assistant exchange messages (saved to `chat_messages`)
3. **History Save**: All messages persisted in database
4. **Close/Timeout**: Session ends (history remains accessible)

### Content Transformation Lifecycle

```
[Original Content]
        ↓
    [User Clicks Button]
        ↓
    [Loading State]
        ↓
    [Transformed Content] ←→ [Revert to Original]
```

1. **Original Content**: Chapter displayed in default English
2. **User Clicks Button**: Personalize or Translate requested
3. **Loading State**: Streaming transformation in progress
4. **Transformed Content**: Personalized/translated version displayed
5. **Revert**: User can return to original (session-only, lost on refresh)

---

## Validation Rules Summary

### Authentication

| Rule | Enforcement |
|------|-------------|
| Password minimum 8 characters | Backend validation before hashing |
| Email format | Pydantic EmailStr validator |
| Token expiry (30 days) | JWT claims + session `expires_at` |
| Protected routes | `Authorization: Bearer <token>` header required |

### User Background

| Field | Constraint |
|-------|------------|
| `software_experience` | CHECK IN ('beginner', 'intermediate', 'advanced') |
| `learning_style` | CHECK IN ('visual', 'reading', 'hands-on') |
| `known_languages` | TEXT[] array, no constraint on values |
| `hardware_background` | Optional TEXT, no validation |

### Chat

| Rule | Enforcement |
|------|-------------|
| Message role | CHECK IN ('user', 'assistant') |
| Content not empty | Backend validation |
| Session association | Foreign key constraint |

---

## Indexes (Recommended)

```sql
-- Users
CREATE INDEX idx_users_email ON users(email);

-- Sessions
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- Chat Sessions
CREATE INDEX idx_chat_sessions_token ON chat_sessions(session_token);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

-- Chat Messages
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- User Background
CREATE INDEX idx_user_background_user_id ON user_background(user_id);

-- Book Chunks
CREATE INDEX idx_book_chunks_qdrant_id ON book_chunks(qdrant_id);
CREATE INDEX idx_book_chunks_source_file ON book_chunks(source_file);
```

---

## Qdrant Vector Schema

**Collection Name**: `book_content`

**Vector Parameters**:
- Size: 768 (for `nvidia/llama-nemotron-embed-vl-1b-v2:free`)
- Distance: Cosine

**Payload Schema**:
```json
{
  "content": {"type": "text"},
  "chapter_name": {"type": "keyword"},
  "heading": {"type": "text"},
  "source_file": {"type": "keyword"},
  "chunk_index": {"type": "integer"}
}
```

**Payload Indexes**:
- `chapter_name`: keyword index (for filtering)
- `source_file`: keyword index (for filtering)

---

## Data Retention

| Entity | Retention Policy |
|--------|------------------|
| users | Indefinite (until user deletes account) |
| user_background | Indefinite (deleted with user) |
| sessions | 30 days (token expiry) |
| chat_sessions | Indefinite (until user deletes) |
| chat_messages | Indefinite (deleted with session) |
| book_chunks | Indefinite (until re-ingestion) |

---

## Migration Strategy

**Initial Setup**:
1. Run Neon SQL script to create all tables
2. Create Qdrant collection with correct vector size
3. Run `ingest_book.py` to populate book_chunks and Qdrant vectors

**Future Migrations**:
- Schema changes: Use Alembic or manual SQL scripts
- Vector re-embedding: Re-run `ingest_book.py` (clears existing data first)
