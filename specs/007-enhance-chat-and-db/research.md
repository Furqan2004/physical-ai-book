# Research: Enhance Chat UI and Database Chapter Storage

## Decisions & Rationale

### 1. Frontend Chat Input Modernization
- **Decision**: Replace the `input type="text"` with a `textarea` in `ChatWindow.tsx`.
- **Rationale**: Standard text inputs do not support multi-line or auto-resize. `textarea` is the industry standard for chatbot interfaces.
- **Implementation**:
    - Use a React `useRef` to track the textarea element.
    - Implement an `adjustHeight` function called on `onChange` that sets `element.style.height = 'auto'` and then `element.style.height = element.scrollHeight + 'px'`.
    - Limit maximum height to ~150px to prevent the input from consuming too much screen space.

### 2. Shift+Enter for Newlines
- **Decision**: Update `handleKeyPress` (renamed to `handleKeyDown`) to distinguish between `Enter` and `Shift+Enter`.
- **Rationale**: Improves UX by allowing users to structure long technical queries.
- **Alternatives considered**: Button-only send. Rejected as it breaks power-user workflows.

### 3. Database-Backed Chapters
- **Decision**: Create a `chapters` table in Neon PostgreSQL.
- **Rationale**: Fetching from the web (crawl4ai) or local filesystem repeatedly is slow and prone to errors. A database provides a stable, indexed source of truth.
- **Table Schema**:
    ```sql
    CREATE TABLE chapters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(255) UNIQUE NOT NULL, -- e.g., "intro"
        title VARCHAR(255),
        content TEXT NOT NULL,
        last_synced TIMESTAMP DEFAULT NOW()
    );
    ```

### 4. Chapter Sync Mechanism
- **Decision**: Update `backend/services/sync_service.py` to read markdown files from `frontend/docs` and upsert them into the `chapters` table.
- **Rationale**: Reuses the existing startup sync infrastructure. Ensures that any changes made to the markdown files in the repository are reflected in the database on startup.

### 5. Error Handling UI
- **Decision**: Return a `500` or custom error code from the API when agents fail, and update the frontend `personalize` and `translate` components to display a "Please try again" message.
- **Rationale**: Current behavior might leave the user with a blank state or a generic error. Explicit "Try again" messaging improves user confidence.

## Best Practices Found
- **Textarea auto-resize**: Setting height to `auto` before calculating `scrollHeight` is critical for shrinking the box when text is deleted.
- **Database Upsert**: Use `ON CONFLICT (slug) DO UPDATE` to ensure content is kept fresh without duplicate records.
