# Quickstart Guide: AI Book Assistant RAG Fixes

**Feature**: 002-rag-chatbot-fixes  
**Date**: 2026-03-06  
**Purpose**: Get the development environment running quickly

---

## Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 20.x LTS
- **PostgreSQL**: Neon Serverless Postgres (remote)
- **Qdrant**: Qdrant Cloud Free Tier (remote)
- **OpenRouter**: API key for embeddings and LLM

---

## Step 1: Clone and Setup

```bash
# Clone repository
cd /path/to/physical-ai-book

# Create virtual environment (backend)
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows

# Install Python dependencies
pip install -r requirements.txt

# Install Node dependencies (frontend)
cd ../frontend
npm install
```

---

## Step 2: Environment Variables

### Backend `.env`

Create `backend/.env` file:

```env
# OpenRouter API (LLM + Embeddings)
OPENROUTER_API_KEY=your_openrouter_api_key_here
SITE_URL=http://localhost:3000
SITE_NAME=AI Book

# Qdrant Cloud (Vector Database)
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key_here

# Neon Postgres (Relational Database)
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/book-db?sslmode=require

# JWT Authentication
BETTER_AUTH_SECRET=your-32-char-random-secret-here
BETTER_AUTH_URL=http://localhost:8000

# CORS (Cross-Origin Resource Sharing)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://furqan2004.github.io
```

**Get Your Keys**:
1. **OpenRouter**: https://openrouter.ai/keys
2. **Qdrant Cloud**: https://cloud.qdrant.io/clusters
3. **Neon**: https://neon.tech → Connection details

### Frontend Configuration

Docusaurus doesn't support `.env` files directly. API URL is configured in `frontend/src/utils/api.ts`:

```typescript
const API_URL = (typeof window !== 'undefined' && (window as any).API_URL) || 'http://localhost:8000';
```

For production builds, set `window.API_URL` via webpack define plugin in `docusaurus.config.ts`.

---

## Step 3: Database Setup

### Run Database Migrations

```bash
cd backend
python -m backend.scripts.setup_db
```

This creates the following tables:
- `users`
- `user_background`
- `sessions`
- `chat_sessions`
- `chat_messages`
- `book_chunks`

### Verify Tables Exist

```python
# backend/scripts/validate_db.py
python -c "
from backend.services.db_service import get_connection
import asyncio

async def check():
    pool = await get_connection()
    async with pool.acquire() as conn:
        tables = await conn.fetch('''
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = '\''public'\''
        ''')
        print('Tables:', [t['table_name'] for t in tables])

asyncio.run(check())
"
```

Expected output:
```
Tables: ['users', 'user_background', 'sessions', 'chat_sessions', 'chat_messages', 'book_chunks']
```

---

## Step 4: Qdrant Setup

### Create Collection

```bash
cd backend
python -m backend.scripts.create_qdrant_collection
```

This creates the `book_content` collection with:
- Vector size: Dynamically detected (currently 768)
- Distance: COSINE

### Verify Qdrant Connection

```bash
python -m backend.scripts.validate_qdrant
```

Expected output:
```
=== Qdrant Validation Start ===

1. Connection test...
   ✅ Connected — 1 collections hain

2. Embedding test...
   ✅ Embedding kaam kar rahi hai — dimension: 768

3. Collection check...
   ✅ Collection 'book_content' exist karti hai
   Vector size: 768 (embedding dim: 768)

4. Data check...
   Total points stored: 150
   ✅ Data present hai

5. Search test...
   ✅ Search kaam kar raha hai — 3 results
   Best score: 0.823
   Sample text: RAG stands for Retrieval-Augmented Generation...

=== Validation Complete ===
```

---

## Step 5: Run Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [23045678]
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Verify Backend**:
- Open http://localhost:8000/docs
- You should see FastAPI Swagger UI
- Try `GET /health` → `{"status": "ok"}`

---

## Step 6: Run Frontend

```bash
cd frontend
npm run start
```

**Expected Output**:
```
[SUCCESS] Docusaurus website is open at: http://localhost:3000/
```

**Verify Frontend**:
- Open http://localhost:3000
- You should see the book homepage
- Navigate to a chapter

---

## Step 7: Test Guest Chatbot

**Guest users can chat without login!**

1. **Open the book** at `http://localhost:3000`
2. **Click chat button** (💬) in bottom-right corner
3. **Ask a question**: "What is RAG?"
4. **Expected**: AI response based on book content
5. **Expected**: Guest banner shown: "💡 Login to unlock personalized experience..."
6. **Expected**: Chat history NOT saved after refresh

**Test Guest Flow**:
```bash
# No authentication needed
# Just open browser and click chat button
```

---

## Step 8: Test User Registration

**Create account with background questions**:

1. **Navigate to** `/signup`
2. **Step 1 - Basic Info**:
   - Enter name, email, password
   - Password must be 8+ characters
3. **Step 2 - Background Questions**:
   - Software experience level
   - Hardware background
   - Programming languages (multi-select)
   - Learning style
4. **Submit** → Auto-login and redirect to `/profile`
5. **Expected**: Profile page shows your background

**Test Signup Flow**:
```bash
# Navigate to /signup
# Complete both steps
# Verify redirect to /profile
```

---

## Step 9: Test Logged-in Features

1. **Login** with test account
2. **Navigate to chapter**
3. **Click "Personalize Content"** → Content rewritten for beginner level
4. **Click "Translate to Urdu"** → Content translated with RTL display
5. **Select text** → Ask chatbot about selected text
6. **Check chat history** → Previous messages restored

---

## Common Issues & Solutions

### Issue: CORS Error in Browser Console

**Error**:
```
Access to fetch at 'http://localhost:8000/api/chat' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solution**:
- Check `backend/.env` has `CORS_ORIGINS=http://localhost:3000`
- Restart backend after changing `.env`
- Verify `main.py` CORS middleware is configured

---

### Issue: Database Connection Failed

**Error**:
```
asyncpg.exceptions.PostgresError: connection failed
```

**Solution**:
- Check `NEON_DATABASE_URL` in `.env`
- Ensure `?sslmode=require` is included
- Verify Neon project is active
- Check firewall allows external connections

---

### Issue: Qdrant Connection Failed

**Error**:
```
qdrant_client.http.exceptions.ResponseHandlingException: Connection refused
```

**Solution**:
- Check `QDRANT_URL` starts with `https://`
- Verify `QDRANT_API_KEY` is correct
- Ensure `url=` parameter used (not `host=`)
- Check Qdrant cluster is active

---

### Issue: Embedding Generation Failed

**Error**:
```
openai.APIConnectionError: Connection error
```

**Solution**:
- Check `OPENROUTER_API_KEY` is valid
- Verify internet connection
- Check OpenRouter service status
- Ensure special input format is used: `input=[{"content": [{"type": "text", "text": text}]}]`

---

### Issue: Frontend Can't Reach Backend

**Error**:
```
TypeError: Failed to fetch
```

**Solution**:
- Check `frontend/src/utils/api.ts` has correct API_URL
- Verify backend is running on port 8000
- Check CORS configuration allows frontend URL
- Try `curl http://localhost:8000/health` from terminal

---

### Issue: JWT Token Not Working

**Error**:
```
401 Unauthorized: Invalid or expired token
```

**Solution**:
- Check `BETTER_AUTH_SECRET` is same in all sessions
- Verify token is not expired (30 days)
- Ensure token is sent as `Authorization: Bearer <token>`
- Check frontend stores token correctly in localStorage

---

## Production Deployment

### Backend (Render)

1. **Create Render account**: https://render.com
2. **New Web Service** → Connect GitHub repo
3. **Settings**:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Environment Variables** (all from `.env`)
5. **Deploy** → Get URL like `https://ai-book-backend.onrender.com`

### Frontend (GitHub Pages)

1. **Update `docusaurus.config.ts`**:
   ```typescript
   url: 'https://Furqan2004.github.io',
   baseUrl: '/physical-ai-book/',
   ```
2. **Update API URL** in `frontend/src/utils/api.ts`:
   ```typescript
   const API_URL = 'https://ai-book-backend.onrender.com';
   ```
3. **Build**:
   ```bash
   npm run build
   ```
4. **Deploy**:
   ```bash
   npm run deploy
   ```

### Post-Deployment Validation

1. **Backend health**: `https://your-backend.onrender.com/health`
2. **Frontend**: `https://furqan2004.github.io/physical-ai-book/`
3. **CORS test**: Browser console fetch from frontend to backend
4. **Guest chat**: Ask question without login
5. **User signup**: Create account, save profile
6. **Personalization**: Test chapter personalization
7. **Translation**: Test Urdu translation

---

## Development Workflow

### Making Changes

1. **Backend changes**:
   - Edit Python files
   - Auto-reload with `--reload` flag
   - Test with Swagger UI (`/docs`)

2. **Frontend changes**:
   - Edit TypeScript/MDX files
   - Auto-reload with `npm run start`
   - Test in browser

3. **Database changes**:
   - Update `db_service.py`
   - Run migration script
   - Verify with validation script

4. **Qdrant changes**:
   - Update `qdrant_service.py`
   - Re-run collection setup
   - Validate with test script

### Testing Checklist

Before committing:
- [ ] Backend builds without errors
- [ ] Frontend builds without errors (`npm run build`)
- [ ] All API endpoints respond
- [ ] Guest chat works
- [ ] Logged-in chat works
- [ ] Personalization works
- [ ] Translation works
- [ ] Chat history saves
- [ ] No CORS errors in browser console

---

## Next Steps

After getting everything running:
1. Run full validation suite
2. Test with real book content
3. Verify Qdrant search quality
4. Test personalization accuracy
5. Check translation quality
6. Performance test with concurrent users

---

## Support

**Documentation**: `/docs` folder in backend  
**API Docs**: http://localhost:8000/docs  
**Issues**: Check validation scripts output  
**Logs**: Backend console, browser DevTools
