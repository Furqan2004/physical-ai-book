# Quickstart: Fix Ask Functionality and AI Prompt Responses

This feature addresses the following:
1. Fixes the "Ask about this" popup positioning when the page is scrolled.
2. Professionalizes AI system prompts across all agents.
3. Cleans up redundant frontend routes and components.
4. Updates Git configuration for the backend.

## Setup
No special setup is required for this feature, as it primarily involves code fixes and prompt updates.

## Testing
- **Frontend**:
    - Log in to the application.
    - Navigate to any page under `/physical-ai-book/docs`.
    - Scroll down significantly and highlight some text.
    - Verify that the "💬 Ask about this?" popup appears correctly above the selected text.
- **Backend**:
    - Open the chatbot.
    - Send a greeting like "Hello" or "Hi" and verify the AI responds professionally.
    - Ask a general question about Physical AI (e.g., "What is a humanoid robot?") and verify it answers even if the exact phrase isn't in the book.
    - Test personalization and translation and verify the output is professional and formatted correctly.
- **Cleanup**:
    - Verify that `/signin` redirects or links are correctly updated to `/login`.
    - Ensure `backend/.gitignore` is present and correctly excludes temporary files.
