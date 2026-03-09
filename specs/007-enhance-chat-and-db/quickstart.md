# Quickstart: Enhance Chat UI and Database Chapter Storage

## Verification Scenarios

### 1. Interactive "Ask about this"
1. Log in to the application.
2. Navigate to a doc page (e.g., `/physical-ai-book/docs/intro`).
3. Highlight a sentence.
4. Click "💬 Ask about this?".
5. **Expected**: The chatbot opens, and the input box contains the quoted text. The message should NOT be sent automatically.

### 2. Multi-line Chat Input
1. Open the chatbot.
2. Type a long paragraph.
3. **Expected**: The input box grows in height to fit the text.
4. Press `Shift+Enter`.
5. **Expected**: A new line is created in the input box.
6. Press `Enter`.
7. **Expected**: The message is sent.

### 3. Database Chapter Sync
1. Start the backend.
2. Observe logs for "Syncing chapters to PostgreSQL".
3. Check the `chapters` table in Neon.
4. **Expected**: Records exist for all markdown files in `frontend/docs`.

### 4. Personalization Error Handling
1. (Simulate failure) Temporarily change the agent endpoint or disconnect the internet.
2. Click "Personalize" on a chapter.
3. **Expected**: A "Please try again" message appears on the page instead of a generic error or hang.
