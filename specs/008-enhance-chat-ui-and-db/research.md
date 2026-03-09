# Research: Enhanced Chatbot UI & Database Chapter Storage

## Findings

### 1. Frontend "Ask about this" Flow
- **Current State**: `TextSelectionPopup.tsx` captures selected text and calls `onAskAboutThis(text)`. `ChatWidget` sets `selectedText` and opens `ChatWindow`. `ChatWindow` has a `useEffect` that pre-fills the `input` state with the context but DOES NOT call `handleSend` automatically.
- **Decision**: The pre-fill logic is already mostly there, but I will ensure it's robust and that no other `useEffect` triggers a send. I will also make the pre-fill format more user-friendly.

### 2. Chatbot UI (Newlines & Auto-resize)
- **Newlines**: The current message display uses standard `div` tags without `white-space: pre-wrap`. This is why newlines aren't rendering.
- **Auto-resize**: `ChatWindow.tsx` has `adjustHeight` logic, but it's limited to 150px. I will increase this and ensure it's responsive to user input.
- **Decision**: Add `white-space: pre-wrap` to user and assistant message bubbles. Increase `maxHeight` of the textarea to 250px.

### 3. Backend Chapter Storage & Retrieval
- **Sync Logic**: `backend/services/sync_service.py` already includes `save_chapter(slug, content, title)` in its sync loop. It is triggered on startup in `backend/main.py`.
- **Doc Service**: `backend/services/doc_service.py` already prioritizes DB fetching using `get_chapter(source_path)`.
- **Decision**: 
    - Create a dedicated `backend/scripts/sync_chapters_to_db.py` to allow manual sync of all `.md` files in `frontend/docs/`.
    - Clean up `doc_service.py` to remove `crawl4ai` dependency as requested.
    - Ensure `source_path` format (@site/docs/...) is consistent between sync and fetch.

### 4. Error Handling in Personalization/Translation
- **Current State**: `PersonalizeButton.tsx` and `TranslateButton.tsx` use `alert()` for errors.
- **Decision**: Add a local `error` state to these components and display a "Please try again" message below the buttons or within the component UI when an error occurs.

## Technical Context
- **Database Table**: `chapters (id, slug, title, content, last_synced, created_at)`.
- **API Endpoints**: `/api/personalize`, `/api/translate`, `/api/chat`.
- **Frontend Components**: `ChatWindow`, `TextSelectionPopup`, `PersonalizeButton`, `TranslateButton`.
