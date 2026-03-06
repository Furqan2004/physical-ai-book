# Quickstart: Local Development Setup

**Created**: 2026-03-05
**Feature**: 001-rag-chatbot-auth
**Status**: Complete

---

## Prerequisites

Before starting, ensure you have:

- **Python 3.11** installed (`python --version`)
- **Node.js 20.x LTS** installed (`node --version`)
- **npm** or **yarn** package manager
- **Git** for version control

---

## Step 1: Clone and Navigate

```bash
cd /home/furqan/Hakathon/frontend/my-book
git checkout 001-rag-chatbot-auth
```

---

## Step 2: Get API Keys

### OpenRouter API Key (Required)

1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up / Sign in
3. Go to **Keys** section
4. Create new API key
5. Copy the key (starts with `sk-or-...`)

**Free Models Used**:
- LLM: `nvidia/nemotron-3-nano-30b-a3b:free`
- Embeddings: `nvidia/llama-nemotron-embed-vl-1b-v2:free`

### Qdrant Cloud (Required)

1. Visit [cloud.qdrant.io](https://cloud.qdrant.io)
2. Sign up with GitHub
3. Create new cluster (Free tier)
4. Copy:
   - **Cluster URL** (e.g., `https://xxx-xxx.cloud.qdrant.io`)
   - **API Key** (from API Keys section)

### Neon Postgres (Required)

1. Visit [console.neon.tech](https://console.neon.tech)
2. Sign up with GitHub
3. Create new project
4. Copy **Connection String** (from Connection Details)
   - Format: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/dbname`

---

## Step 3: Backend Setup

### 3.1 Create backend folder structure

```bash
cd /home/furqan/Hakathon/frontend/my-book
mkdir -p backend/{agents,tools,routers,services,models,scripts}
touch backend/agents/__init__.py
touch backend/tools/__init__.py
touch backend/routers/__init__.py
touch backend/services/__init__.py
touch backend/models/__init__.py
```

### 3.2 Create requirements.txt

Create `backend/requirements.txt`:

```txt
fastapi==0.115.0
uvicorn[standard]==0.30.0
openai-agents==0.0.15
openai==1.50.0
qdrant-client==1.11.0
asyncpg==0.29.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pydantic==2.9.0
pydantic-settings==2.5.0
python-dotenv==1.0.1
httpx==0.27.0
python-multipart==0.0.12
```

### 3.3 Create virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3.4 Create .env file

Create `backend/.env` (copy from `.env.example`):

```env
OPENROUTER_API_KEY=sk-or-your-key-here
SITE_URL=http://localhost:3000
SITE_NAME=AI Book
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key
NEON_DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/book-db
BETTER_AUTH_SECRET=your-32-char-random-secret-here
BETTER_AUTH_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000,https://yourusername.github.io
```

**Generate BETTER_AUTH_SECRET**:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3.5 Create Neon Database Tables

1. Go to Neon Console → Your Project → SQL Editor
2. Run the SQL schema from `data-model.md` (copy all CREATE TABLE statements)
3. Verify tables created:
   ```sql
   \dt  -- Should show: users, user_background, sessions, chat_sessions, chat_messages, book_chunks
   ```

### 3.6 Create Qdrant Collection

Create `backend/services/qdrant_service.py` (minimal version for setup):

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
import os

def get_qdrant_client() -> QdrantClient:
    return QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )

def create_collection_if_not_exists() -> None:
    client = get_qdrant_client()
    COLLECTION_NAME = "book_content"
    VECTOR_SIZE = 768  # Confirmed size for nvidia/llama-nemotron-embed-vl-1b-v2
    
    if not client.collection_exists(COLLECTION_NAME):
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE
            )
        )
        print(f"Collection '{COLLECTION_NAME}' created!")
    else:
        print(f"Collection '{COLLECTION_NAME}' already exists.")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    create_collection_if_not_exists()
```

Run it:
```bash
cd backend
source venv/bin/activate
python -c "from services.qdrant_service import create_collection_if_not_exists; create_collection_if_not_exists()"
```

### 3.7 Test Backend Start

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Visit `http://localhost:8000/docs` to see Swagger UI.

---

## Step 4: Frontend Setup

### 4.1 Navigate to frontend

```bash
cd /home/furqan/Hakathon/frontend/my-book
# If frontend folder doesn't exist yet, restructure first:
mkdir frontend
mv docs src docusaurus.config.ts sidebars.ts package.json tsconfig.json frontend/
```

### 4.2 Install dependencies

```bash
cd frontend
npm install
npm install @better-auth/client
```

### 4.3 Create .env file

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:8000
```

### 4.4 Test Frontend Start

```bash
cd frontend
npm run start
```

Expected: Browser opens at `http://localhost:3000` showing book homepage.

---

## Step 5: Verify Setup

### Backend Health Check

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "ok", "model": "nvidia/nemotron-3-nano-30b-a3b:free"}
```

### Frontend Check

1. Visit `http://localhost:3000`
2. Book content should load
3. No chatbot widget yet (not implemented)

### Database Check

```bash
# Connect to Neon
psql "postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/book-db"

# Check tables
\dt

# Should show 6 tables
```

### Qdrant Check

1. Visit Qdrant Cloud Dashboard
2. Collections → `book_content`
3. Should show 0 vectors (until ingestion)

---

## Step 6: Book Ingestion (Test Data)

Create minimal `backend/scripts/ingest_book.py`:

```python
import os, sys, uuid
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from services.openrouter_service import get_embedding
from services.qdrant_service import upsert_vectors
from services.db_service import save_chunk_metadata
from dotenv import load_dotenv
import asyncio

load_dotenv()

DOCS_PATH = Path(__file__).parent.parent.parent / "frontend" / "docs"

def chunk_text(text: str) -> list[str]:
    words = text.split()
    chunks = []
    chunk_size = 400
    overlap = 50
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk)
    
    return chunks

def ingest_all_docs():
    total = 0
    for md_file in DOCS_PATH.rglob("*.md"):
        content = md_file.read_text(encoding="utf-8")
        chunks = chunk_text(content)
        
        ids, vectors, payloads = [], [], []
        for i, chunk in enumerate(chunks):
            chunk_id = str(uuid.uuid4())
            embedding = get_embedding(chunk)
            ids.append(chunk_id)
            vectors.append(embedding)
            payloads.append({
                "content": chunk,
                "chapter_name": md_file.parent.name,
                "heading": md_file.stem,
                "source_file": str(md_file.relative_to(DOCS_PATH)),
                "chunk_index": i,
            })
            asyncio.run(save_chunk_metadata(
                chunk_id, md_file.parent.name, md_file.stem,
                str(md_file.relative_to(DOCS_PATH)), i, chunk[:200]
            ))
        
        upsert_vectors(ids, vectors, payloads)
        total += len(chunks)
        print(f"Processed: {md_file.name} ({len(chunks)} chunks)")
    
    print(f"Ingestion complete! Total chunks: {total}")

if __name__ == "__main__":
    ingest_all_docs()
```

Run ingestion:
```bash
cd backend/scripts
source ../venv/bin/activate
python ingest_book.py
```

Verify:
- Check Neon: `SELECT COUNT(*) FROM book_chunks;` → should return > 0
- Check Qdrant: Dashboard should show vectors count

---

## Common Issues & Solutions

### Issue: `ModuleNotFoundError: No module named 'fastapi'`

**Solution**: Activate virtual environment:
```bash
cd backend
source venv/bin/activate
```

### Issue: `CORS error` in browser console

**Solution**: Update `CORS_ORIGINS` in `backend/.env`:
```env
CORS_ORIGINS=http://localhost:3000,https://yourusername.github.io
```
Then restart backend.

### Issue: `Connection refused` to Qdrant

**Solution**: Check QDRANT_URL format:
```env
QDRANT_URL=https://xxx-xxx.cloud.qdrant.io  # Must include https://
```

### Issue: `Database does not exist`

**Solution**: Create database in Neon Console or use connection string with existing database name.

### Issue: Frontend build fails with TypeScript errors

**Solution**: Check TypeScript version compatibility:
```bash
cd frontend
npm install typescript@5 --save-dev
```

---

## Next Steps

After local setup is working:

1. **Phase 2**: Implement backend services (auth, chat, personalization, translation)
2. **Phase 3**: Create OpenAI Agents SDK agents and tools
3. **Phase 4**: Build FastAPI routers
4. **Phase 5**: Implement frontend auth pages
5. **Phase 6**: Build chatbot widget
6. **Phase 7**: Add chapter buttons (personalize, translate)
7. **Phase 8**: Docker + deployment

---

## Development Workflow

### Running Backend

```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Running Frontend

```bash
cd frontend
npm run start
```

### Hot Reload

- Backend: Auto-reloads on file changes (`--reload` flag)
- Frontend: Auto-reloads with Docusaurus dev server

### Testing API

Use Swagger UI at `http://localhost:8000/docs` for interactive API testing.

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key |
| `SITE_URL` | No | Site URL for OpenRouter headers |
| `SITE_NAME` | No | Site name for OpenRouter headers |
| `QDRANT_URL` | Yes | Qdrant Cloud cluster URL |
| `QDRANT_API_KEY` | Yes | Qdrant Cloud API key |
| `NEON_DATABASE_URL` | Yes | Neon Postgres connection string |
| `BETTER_AUTH_SECRET` | Yes | 32+ char random secret |
| `BETTER_AUTH_URL` | No | Auth callback URL |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |

### Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Yes | Backend API base URL |

---

**Setup Complete!** 🎉

Your local development environment is ready. Proceed to implementation phases.
