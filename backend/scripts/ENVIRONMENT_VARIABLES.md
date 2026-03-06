# Environment Variables Reference

**Feature**: AI Book Assistant RAG Fixes  
**Last Updated**: 2026-03-06

---

## Backend Environment Variables

### Required Variables

| Variable | Description | Example | Validation |
|----------|-------------|---------|------------|
| `OPENROUTER_API_KEY` | OpenRouter API key for embeddings & LLM | `sk-or-v1-...` | Must start with `sk-or-` |
| `SITE_URL` | Frontend URL for OpenRouter headers | `http://localhost:3000` | Valid URL |
| `SITE_NAME` | Site name for OpenRouter | `AI Book` | Any string |
| `QDRANT_URL` | Qdrant Cloud cluster URL | `https://api.cloud.qdrant.io` | Must start with `https://` |
| `QDRANT_API_KEY` | Qdrant Cloud API key | `uuid\|key` | Contains `\|` separator |
| `NEON_DATABASE_URL` | Neon Postgres connection string | `postgresql://user:pass@host/db?sslmode=require` | Must include `?sslmode=require` |
| `BETTER_AUTH_SECRET` | JWT signing secret | `32+ random characters` | Minimum 32 characters |
| `BETTER_AUTH_URL` | Backend URL for auth | `http://localhost:8000` | Valid URL |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:3000,https://user.github.io` | Comma-separated URLs |

### Optional Variables

| Variable | Description | Default | Notes |
|----------|-------------|---------|-------|
| `ALLOWED_ORIGINS` | Alternative to CORS_ORIGINS | `http://localhost:3000` | Same format |

---

## Frontend Configuration

### API URL Configuration

**Method 1**: Hardcoded in `frontend/src/utils/api.ts`
```typescript
const API_URL = 'https://ai-book-backend.onrender.com';
```

**Method 2**: Via webpack define plugin in `docusaurus.config.ts`
```typescript
const config = {
  webpack: {
    define: {
      'window.API_URL': JSON.stringify(process.env.VITE_API_URL),
    },
  },
};
```

**Method 3**: GitHub Actions secret
- Set `VITE_API_URL` in GitHub repo settings → Secrets

---

## Production Values

### Backend (Render)

```env
OPENROUTER_API_KEY=sk-or-v1-YOUR_ACTUAL_KEY
SITE_URL=https://furqan2004.github.io
SITE_NAME=AI Book
QDRANT_URL=https://your-cluster.cloud.qdrant.io
QDRANT_API_KEY=your-actual-key
NEON_DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
BETTER_AUTH_SECRET=minimum-32-character-random-string-here
BETTER_AUTH_URL=https://your-backend.onrender.com
CORS_ORIGINS=https://furqan2004.github.io,http://localhost:3000
```

### Frontend (GitHub Pages)

Update in `frontend/src/utils/api.ts`:
```typescript
const API_URL = 'https://your-backend.onrender.com';
```

---

## Validation Script

Run to verify all variables are set:

```bash
cd backend
./venv/bin/python -c "
import os
from dotenv import load_dotenv
load_dotenv()

required = [
    'OPENROUTER_API_KEY',
    'QDRANT_URL',
    'QDRANT_API_KEY',
    'NEON_DATABASE_URL',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
    'CORS_ORIGINS',
]

missing = []
for var in required:
    value = os.getenv(var)
    if not value:
        missing.append(var)
    elif var == 'BETTER_AUTH_SECRET' and len(value) < 32:
        print(f'⚠️  {var}: Too short (need 32+ chars)')
    elif var == 'QDRANT_URL' and not value.startswith('https://'):
        print(f'⚠️  {var}: Must start with https://')
    elif var == 'NEON_DATABASE_URL' and '?sslmode=require' not in value:
        print(f'⚠️  {var}: Missing ?sslmode=require')
    else:
        print(f'✅ {var}: Set')

if missing:
    print(f'\n❌ Missing variables: {missing}')
else:
    print('\n✅ All required variables set!')
"
```

---

## Security Notes

### Never Commit `.env` Files

Add to `.gitignore`:
```
.env
.env.local
.env.production
.env.*.local
```

### Use Secure Secrets

- **BETTER_AUTH_SECRET**: Generate with `openssl rand -hex 32`
- **API Keys**: Store in secure vault or secrets manager
- **Database URLs**: Use environment-specific values

### CORS Configuration

Production CORS_ORIGINS must:
- Include exact frontend URL (no trailing slash)
- Include localhost for development
- Be comma-separated (no spaces)

**Correct**:
```
CORS_ORIGINS=https://furqan2004.github.io,http://localhost:3000
```

**Incorrect**:
```
CORS_ORIGINS=https://furqan2004.github.io/  # Trailing slash
CORS_ORIGINS=https://furqan2004.github.io, http://localhost:3000  # Space after comma
```

---

## Troubleshooting

### CORS Errors

**Symptom**: Browser console shows CORS error

**Fix**:
1. Check `CORS_ORIGINS` includes exact frontend URL
2. Restart backend after changing `.env`
3. Verify no trailing slash in URL

### Database Connection Failed

**Symptom**: `cannot connect to database`

**Fix**:
1. Verify `NEON_DATABASE_URL` is correct
2. Ensure `?sslmode=require` is included
3. Check Neon project is active

### Qdrant Connection Timeout

**Symptom**: `Connection timed out`

**Fix**:
1. Verify `QDRANT_URL` is correct (check cluster dashboard)
2. Verify `QDRANT_API_KEY` is valid
3. Test with curl:
   ```bash
   curl -X GET "https://your-cluster.cloud.qdrant.io/" \
     -H "Authorization: Bearer your-api-key"
   ```

### OpenRouter 402 Error

**Symptom**: `Insufficient credits`

**Fix**:
1. Visit https://openrouter.ai/settings/credits
2. Add credits to account
3. Verify API key is from correct account

---

## Environment-Specific Configs

### Development (localhost)

```env
OPENROUTER_API_KEY=sk-or-v1-dev-key
QDRANT_URL=https://dev-cluster.cloud.qdrant.io
NEON_DATABASE_URL=postgresql://dev-db
BETTER_AUTH_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Production (Render + GitHub Pages)

```env
OPENROUTER_API_KEY=sk-or-v1-prod-key
QDRANT_URL=https://prod-cluster.cloud.qdrant.io
NEON_DATABASE_URL=postgresql://prod-db
BETTER_AUTH_URL=https://backend.onrender.com
CORS_ORIGINS=https://furqan2004.github.io
```

---

## Backup & Recovery

### Export Environment Variables

```bash
# Backup .env file
cp backend/.env backend/.env.backup.$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Restore .env file
cp backend/.env.backup.20260306 backend/.env
```

### Rotate Secrets

If secret is compromised:

1. Generate new secret: `openssl rand -hex 32`
2. Update `BETTER_AUTH_SECRET` in `.env`
3. Restart backend
4. All existing sessions will be invalidated (users must re-login)

---

## Quick Reference

**Generate Secret**:
```bash
openssl rand -hex 32
```

**Test Backend**:
```bash
curl http://localhost:8000/health
```

**Test Frontend**:
```bash
cd frontend
npm run start
```

**Validate All**:
```bash
python scripts/validate_backend.py
```
