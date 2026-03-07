# Data Model: Personalization and Translation Cache

## Entities

### `user_personalization`

Stores AI-generated personalized content for each user.

- **id**: `UUID` (Primary Key, default `gen_random_uuid()`)
- **user_id**: `TEXT` (Foreign Key -> `user.id`, `ON DELETE CASCADE`)
- **chapter_id**: `TEXT` (Identifier for the book chapter)
- **content**: `TEXT` (The personalized markdown content)
- **created_at**: `TIMESTAMP` (default `NOW()`)

**Constraints**:
- `UNIQUE(user_id, chapter_id)` - Ensures only one version per user per chapter.

### `translations`

Stores global AI-generated translations (Urdu script).

- **id**: `UUID` (Primary Key, default `gen_random_uuid()`)
- **chapter_id**: `TEXT` (Identifier for the book chapter)
- **language**: `VARCHAR(10)` (default `'ur'`)
- **content**: `TEXT` (The translated markdown content)
- **created_at**: `TIMESTAMP` (default `NOW()`)

**Constraints**:
- `UNIQUE(chapter_id, language)` - Ensures only one translation per chapter for each language.

## Relationships

- `user_personalization` belongs to `user` (1:N).
- `translations` is a global entity (not linked to users).

## State Transitions

1. **Request**: User requests personalized content.
2. **Check**: Backend queries `user_personalization` for `(user_id, chapter_id)`.
3. **Hit**: Return content from database.
4. **Miss**:
   - Fetch source from frontend URL.
   - Run AI transformation.
   - Store result in `user_personalization`.
   - Return to user.
