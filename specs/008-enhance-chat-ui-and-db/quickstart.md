# Quickstart: Enhanced Chatbot UI & Database Chapter Storage

## Setup

1. **Verify Database Configuration**: Ensure `.env` has a valid `NEON_DATABASE_URL`.
2. **Synchronize Content**: Run the new sync script to ensure all book content is in PostgreSQL.
   ```bash
   python backend/scripts/sync_chapters_to_db.py
   ```
3. **Frontend Check**: Start the Docusaurus frontend.
   ```bash
   cd frontend
   npm start
   ```

## Verification Steps

### 1. "Ask about this" Flow
1. Navigate to `/physical-ai-book/docs/intro`.
2. Highlight a sentence and click "💬 Ask about this?".
3. **EXPECTED**: Chatbot opens, input field has pre-filled context, NO message is sent automatically.
4. Type a custom question after the pre-filled text and click Send.
5. **EXPECTED**: AI responds correctly to both the context and your question.

### 2. Chat UI Improvements
1. In the chatbot, type a multi-line message (use Shift+Enter).
2. **EXPECTED**: The input box grows vertically as you type more lines.
3. Send the message and verify the assistant's response.
4. **EXPECTED**: Newlines in the assistant's response are rendered correctly (visible line breaks).

### 3. Database-Driven Personalization/Translation
1. In the backend console, monitor logs for `DEBUG: Fetching from DB for slug: @site/docs/...`.
2. Click "Personalize" or "Urdu Mein" on any chapter page.
3. **EXPECTED**: The content is fetched from the database, not via a web crawler or local filesystem (unless DB miss).
4. Verify the transformed content is displayed on the page.

### 4. Error Handling
1. Temporarily disconnect the internet or simulate an API failure.
2. Click "Personalize" or "Urdu Mein".
3. **EXPECTED**: A "Please try again" message appears on the page instead of an alert.
