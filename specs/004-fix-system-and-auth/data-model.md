# Data Model: System Overhaul & Authentication Fixes

## Entity: User (Relational)

**Storage**: Neon PostgreSQL (via Better Auth)

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | string (UUID) | Required, unique | Unique identifier |
| name | string | Required, min 2 chars | Full name |
| email | string | Required, unique, email format | Primary email |
| emailVerified | boolean | Default false | Verification status |
| createdAt | datetime | Automatic | Registration timestamp |

**Relationships**:
- Has one **User Profile** (1:1)
- Has many **Chat Sessions** (1:N)

---

## Entity: User Profile (Relational)

**Storage**: Neon PostgreSQL

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| userId | string (UUID) | Required, foreign key | FK to User |
| software_experience | string | Required, enum | 'beginner', 'intermediate', 'advanced' |
| hardware_background | string | Required, max 500 chars | Brief description |
| known_languages | list[string] | Required, min 1 item | e.g., ["Python", "C++"] |
| learning_style | string | Required, enum | 'visual', 'reading', 'hands-on' |

**State Transitions**:
1. **Unregistered**: User exists but profile is missing.
2. **Onboarding**: User is redirected to the questionnaire.
3. **Registered**: Profile is saved, user can access personalized features.

---

## Entity: Chat Session (Relational)

**Storage**: Neon PostgreSQL

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | string (UUID) | Required, unique | Unique identifier |
| userId | string (UUID) | Optional (for guests) | FK to User |
| topic | string | Max 100 chars | Short summary |
| createdAt | datetime | Automatic | Timestamp |

**Relationships**:
- Belongs to **User** (optional)
- Has many **Messages** (1:N)

---

## Entity: Message (Relational)

**Storage**: Neon PostgreSQL

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | string (UUID) | Required, unique | Unique identifier |
| sessionId | string (UUID) | Required, foreign key | FK to Chat Session |
| role | string | Required, enum | 'user' or 'assistant' |
| content | string | Required | Message text |
| timestamp | datetime | Automatic | Creation timestamp |

---

## Entity: Documentation Chunk (Vector)

**Storage**: Qdrant Cloud

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| id | string (UUID) | Required, unique | Unique identifier |
| vector | list[float] | Size 1536 (OpenAI default) | Embedding |
| payload.text | string | Required | Text chunk |
| payload.metadata | json | Required | chapter, source file, etc. |
