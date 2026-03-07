# Quickstart: System Overhaul & Authentication Fixes

## Frontend Setup (Next.js/Docusaurus)

1. **Better Auth Configuration**:
   - Install dependencies: `npm install better-auth` in `frontend/`.
   - Setup environment variables in `frontend/.env.local`.

2. **Redirect Fixes**:
   - Locate the Sign-in page and update the Signup button href.
   - Implement the Forgot Password page at `/physical-ai-book/forgot-password`.

3. **Chatbot Scoping**:
   - Update `frontend/src/theme/Root.tsx` or similar to only render the chatbot on `/physical-ai-book/docs/*` routes.

## Backend Setup (FastAPI)

1. **Agent Overhaul**:
   - Ensure all tools are registered in `backend/ai/orchestrator_agent.py`.
   - Verify connection to Qdrant Cloud and Neon PostgreSQL.

2. **Database Migrations**:
   - Run `python backend/scripts/setup_db.py` to ensure all history and user tables exist.

3. **Vector Embeddings**:
   - Run the embedding creation scripts to populate Qdrant Cloud.

## Verification Steps

1. **Authentication**:
   - Navigate to `http://localhost:3000/physical-ai-book/signup`.
   - Create an account.
   - You should be redirected to `http://localhost:3000/physical-ai-book/onboarding`.
   - Complete the questionnaire.
   - You should be redirected to the book introduction.

2. **Chatbot Scoping**:
   - Go to `http://localhost:3000/physical-ai-book/`. The chatbot should NOT be visible.
   - Go to `http://localhost:3000/physical-ai-book/docs/intro`. The chatbot SHOULD be visible.

3. **Agent Tools**:
   - Ask the chatbot: "Summarize this chapter for me" (Personalization).
   - Ask the chatbot: "Translate the last paragraph to Urdu" (Translation).
   - Both should work seamlessly without tool execution errors.

4. **Data Persistence**:
   - Refresh the page during a chat session. Your message history should remain visible.
   - Check Neon PostgreSQL `user` and `user_background` tables to ensure data was saved.
