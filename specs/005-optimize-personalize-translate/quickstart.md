# Quickstart: Optimize Personalization and Translation Endpoints

## Setup Database

Run the following SQL in your Neon Console or via `inspect_db.py`:

```sql
-- Personalization Cache
CREATE TABLE IF NOT EXISTS user_personalization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, chapter_id)
);

-- Global Translation Cache
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id TEXT NOT NULL,
    language VARCHAR(10) DEFAULT 'ur',
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(chapter_id, language)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_personalization_lookup ON user_personalization(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations(chapter_id, language);
```

## Run the Backend

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Verify Configuration

Check `.env`:
- `CORS_ORIGINS`: Should contain the frontend URL (e.g., `http://localhost:3000`).
- `NEON_DATABASE_URL`: Must be configured correctly.

## Test the Endpoints

1. **Personalization**:
   - Call `POST /api/personalize` with a `chapter_id`.
   - First call: Should perform AI transformation and save to DB.
   - Second call: Should return the content from DB (check response time).

2. **Translation**:
   - Call `POST /api/translate` with a `chapter_id`.
   - First call: Should perform AI transformation and save to DB globally.
   - Second call (same or different user): Should return content from DB.
