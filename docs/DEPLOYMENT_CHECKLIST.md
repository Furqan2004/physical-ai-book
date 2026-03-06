# Production Deployment Checklist

**Feature**: AI Book Assistant RAG Fixes  
**Date**: 2026-03-06  
**Version**: 1.0.0

---

## Pre-Deployment Validation

### Backend Checks

- [ ] **Environment Variables**: All variables set in production `.env`
  - [ ] `OPENROUTER_API_KEY` - Valid API key with credits
  - [ ] `QDRANT_URL` - Correct cluster URL (https://...)
  - [ ] `QDRANT_API_KEY` - Valid API key
  - [ ] `NEON_DATABASE_URL` - Production database URL with `?sslmode=require`
  - [ ] `BETTER_AUTH_SECRET` - 32+ character random string
  - [ ] `BETTER_AUTH_URL` - Production backend URL
  - [ ] `CORS_ORIGINS` - Includes production frontend URL

- [ ] **Database Tables**: All tables exist
  ```sql
  SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
  -- Should show: users, user_background, sessions, chat_sessions, chat_messages, book_chunks
  ```

- [ ] **Qdrant Collection**: Collection exists with correct dimension
  ```bash
  python scripts/validate_qdrant.py
  ```

- [ ] **Backend Tests**: Run validation script
  ```bash
  python scripts/validate_backend.py
  ```

### Frontend Checks

- [ ] **API URL**: Production backend URL configured
  - Check `frontend/src/utils/api.ts`
  - Or set via webpack define plugin

- [ ] **Build Test**: Build succeeds
  ```bash
  cd frontend
  npm run build
  ```

- [ ] **No Console Errors**: Check browser console
  - No CORS errors
  - No 404 errors
  - No JavaScript errors

---

## Backend Deployment (Render)

### 1. Create Render Account

- [ ] Sign up at https://render.com
- [ ] Connect GitHub account

### 2. Create Web Service

- [ ] Click "New Web Service"
- [ ] Connect repository: `physical-ai-book`
- [ ] Configure:
  - **Name**: `ai-book-backend`
  - **Region**: Choose closest to users
  - **Branch**: `main`
  - **Root Directory**: `backend`
  - **Runtime**: `Python 3`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 3. Set Environment Variables

In Render dashboard → Environment:

- [ ] `OPENROUTER_API_KEY`
- [ ] `SITE_URL=https://furqan2004.github.io`
- [ ] `SITE_NAME=AI Book`
- [ ] `QDRANT_URL` (your cluster URL)
- [ ] `QDRANT_API_KEY`
- [ ] `NEON_DATABASE_URL`
- [ ] `BETTER_AUTH_SECRET`
- [ ] `BETTER_AUTH_URL=https://ai-book-backend.onrender.com`
- [ ] `CORS_ORIGINS=https://furqan2004.github.io,http://localhost:3000`

### 4. Deploy

- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 minutes)
- [ ] Note the deployment URL: `https://ai-book-backend.onrender.com`

---

## Frontend Deployment (GitHub Pages)

### 1. Update Configuration

**File**: `frontend/docusaurus.config.ts`

```typescript
const config = {
  url: 'https://Furqan2004.github.io',
  baseUrl: '/physical-ai-book/',
  organizationName: 'Furqan2004',
  projectName: 'physical-ai-book',
  deploymentBranch: 'gh-pages',
  // ...
};
```

### 2. Update API URL

**Option A**: Update `frontend/src/utils/api.ts`
```typescript
const API_URL = 'https://ai-book-backend.onrender.com';
```

**Option B**: Set GitHub Secret
- Go to repo → Settings → Secrets and variables → Actions
- Add secret: `VITE_API_URL` = `https://ai-book-backend.onrender.com`

### 3. Deploy to GitHub Pages

```bash
cd frontend
npm run build
npm run deploy
```

Or use GitHub Actions (auto-deploy on push to main).

---

## Post-Deployment Validation

### 1. Backend Health Check

```bash
curl https://ai-book-backend.onrender.com/health
# Expected: {"status": "ok", "model": "..."}
```

### 2. CORS Test

In browser console on production site:
```javascript
fetch('https://ai-book-backend.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
// Should work without CORS errors
```

### 3. Guest Chat Test

- [ ] Open production site
- [ ] Click chat button
- [ ] Ask question without login
- [ ] Verify AI response received
- [ ] Verify guest banner shown

### 4. Authentication Test

- [ ] Click signup
- [ ] Create account
- [ ] Complete background questions
- [ ] Verify redirect to profile
- [ ] Verify background saved

### 5. Personalization Test

- [ ] Login
- [ ] Navigate to chapter
- [ ] Click "Personalize Content"
- [ ] Verify content adapted to profile

### 6. Translation Test

- [ ] Login
- [ ] Navigate to chapter
- [ ] Click "Translate to Urdu"
- [ ] Verify Urdu text with RTL display

### 7. Chat History Test

- [ ] Login
- [ ] Have chat conversation
- [ ] Logout
- [ ] Login again
- [ ] Verify chat history restored

---

## Monitoring Setup

### Logs

- [ ] **Render Logs**: Dashboard → Logs tab
  - Monitor for errors
  - Check guest vs logged-in chat logs

- [ ] **Browser Console**: Check for frontend errors
  - CORS errors
  - API errors
  - JavaScript errors

### Metrics to Track

- [ ] Chatbot usage (guest vs logged-in)
- [ ] Personalization usage
- [ ] Translation usage
- [ ] API response times
- [ ] Error rates

---

## Rollback Plan

If deployment fails:

1. **Backend**:
   - Go to Render dashboard
   - Click "Deployments"
   - Select previous successful deployment
   - Click "Rollback"

2. **Frontend**:
   ```bash
   git revert <commit-hash>
   git push
   npm run deploy
   ```

---

## Support Contacts

- **Render Support**: https://render.com/support
- **GitHub Pages**: https://docs.github.com/pages
- **Qdrant Cloud**: https://cloud.qdrant.io/support
- **Neon Database**: https://neon.tech/docs

---

## Deployment Sign-Off

- [ ] Backend deployed and healthy
- [ ] Frontend deployed and accessible
- [ ] All 7 post-deployment tests passed
- [ ] No critical errors in logs
- [ ] Monitoring configured
- [ ] Rollback plan documented

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Version**: 1.0.0  
**Status**: ✅ SUCCESS / ❌ FAILED
