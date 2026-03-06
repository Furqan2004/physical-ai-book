# Quick Start Guide

## ✅ What's Implemented

### Frontend (Docusaurus)
- ✅ Auth pages: `/signup`, `/signin`, `/onboarding`, `/profile`
- ✅ Navbar with auth state (Login/Signup vs Hello {name})
- ✅ ChatWidget with floating button
- ✅ Text selection popup on `/docs/*` routes
- ✅ Auth context provider

### Backend (FastAPI)
- ✅ Auth endpoints: `/auth/signup`, `/auth/signin`, `/auth/me`, `/auth/signout`, `/user/background`
- ✅ Chat endpoint: `/api/chat` (streaming)
- ✅ RAG tools: qdrant_search, db_tool
- ✅ Agents: triage, chat, orchestrator
- ✅ Services: OpenRouter, Qdrant, Neon DB, Auth

## ⚠️ Setup Required

### 1. Get API Keys (Required)

You need these free API keys:

1. **OpenRouter** (LLM + Embeddings): https://openrouter.ai/keys
2. **Qdrant Cloud** (Vector DB): https://cloud.qdrant.io
3. **Neon Postgres** (Database): https://console.neon.tech

### 2. Configure Backend

Edit `backend/.env`:

```bash
OPENROUTER_API_KEY=sk-or-your-actual-key
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-key
NEON_DATABASE_URL=postgresql://user:pass@ep-xxx.aws.neon.tech/db
BETTER_AUTH_SECRET=generate-random-32-char-string
```

### 3. Setup Database

Run the SQL script in Neon Console:

```bash
# Copy contents of backend/scripts/create_tables.sql
# Paste into Neon Console SQL Editor and run
```

### 4. Create Qdrant Collection

```bash
cd backend
source venv/bin/activate
python scripts/create_qdrant_collection.py
```

### 5. Start Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Backend will run at: http://localhost:8000
API Docs: http://localhost:8000/docs

### 6. Start Frontend

```bash
cd frontend
npm run start
```

Frontend will run at: http://localhost:3000

## 🔗 Connection Status

**Frontend → Backend Connection:**
- Frontend uses `REACT_APP_API_URL` from `frontend/.env`
- Currently set to: `http://localhost:8000`
- **They ARE connected** when both are running!

## 🧪 Test Flow

1. Open http://localhost:3000
2. Click "Sign Up" → create account
3. Complete onboarding form
4. You'll see "Hello, {name}" in navbar
5. Click floating 💬 button (bottom-right)
6. Ask a question about the book

**Note:** Chatbot needs book content ingested first (Phase 7 task).

## ❓ Troubleshooting

### Frontend can't connect to backend
- Check `frontend/.env` has `REACT_APP_API_URL=http://localhost:8000`
- Ensure backend is running on port 8000
- Check CORS in `backend/.env` includes `http://localhost:3000`

### Backend import errors
- Run: `cd backend && source venv/bin/activate`
- Verify: `pip list | grep fastapi`

### Database errors
- Check `NEON_DATABASE_URL` in `.env`
- Run create_tables.sql in Neon Console

## 📋 Next Tasks

To make chatbot actually answer questions:

1. **Ingest book content** (Phase 7):
   ```bash
   cd backend/scripts
   source ../venv/bin/activate
   python ingest_book.py
   ```

2. **Complete Personalization** (Phase 5)
3. **Complete Translation** (Phase 6)
4. **Deploy** (Phase 8)
