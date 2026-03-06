# API Contracts: AI Book Assistant RAG Fixes

**Feature**: 002-rag-chatbot-fixes  
**Date**: 2026-03-06  
**Base URL**: `http://localhost:8000` (dev) | `https://your-backend.onrender.com` (prod)

---

## Authentication Endpoints

### POST /auth/signup

Register a new user account.

**Request**:
```json
{
  "name": "string (required, min 2 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)"
}
```

**Response (200 OK)**:
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "created_at": "ISO8601 datetime"
  }
}
```

**Error Responses**:
- `400 Bad Request` — Email already registered
- `500 Internal Server Error` — Database error

**Example**:
```bash
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"securepass123"}'
```

---

### POST /auth/signin

Sign in with email and password.

**Request**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK)**:
```json
{
  "token": "jwt_token_string",
  "user": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "created_at": "ISO8601 datetime"
  }
}
```

**Error Responses**:
- `401 Unauthorized` — Invalid email or password

---

### POST /auth/signout

Sign out and invalidate current session.

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Error Responses**:
- `401 Unauthorized` — Invalid or missing token

---

### GET /auth/me

Get current authenticated user profile.

**Headers**:
```
Authorization: Bearer <token>
```

**Response (200 OK)**:
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "created_at": "ISO8601 datetime",
  "background": {
    "software_experience": "beginner|intermediate|advanced",
    "hardware_background": "basic|advanced",
    "known_languages": ["Python", "JavaScript"],
    "learning_style": "string"
  }
}
```

**Error Responses**:
- `401 Unauthorized` — Invalid or missing token

---

## User Endpoints

### POST /user/background

Save user background information for personalization.

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "software_experience": "beginner|intermediate|advanced",
  "hardware_background": "basic|advanced",
  "known_languages": ["Python", "JavaScript"],
  "learning_style": "hands-on|theoretical|mixed"
}
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Error Responses**:
- `401 Unauthorized` — Invalid or missing token
- `500 Internal Server Error` — Database error

---

## Chat Endpoints

### POST /api/chat

Send a message to the RAG chatbot. **Authorization is OPTIONAL** — guest users can chat.

**Headers** (Optional):
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "message": "string (required, user's question)",
  "session_id": "string (required, chat session identifier)",
  "selected_text": "string (optional, text selected by user)"
}
```

**Response (200 OK)** — Server-Sent Events stream:
```
data: Hello! Based on the book content...
data: 
data: RAG works by retrieving relevant...
```

**Response Behavior**:
- **Guest users** (no token):
  - Receive AI response via RAG
  - Chat history NOT saved
  - `is_guest: true` in metadata
- **Logged-in users** (with token):
  - Receive AI response via RAG
  - Chat history saved to database
  - Personalization applied based on profile
  - Selected text context used if provided

**Error Responses**:
- `400 Bad Request` — Missing required fields
- `500 Internal Server Error` — RAG pipeline error

**Example (Guest)**:
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is RAG?","session_id":"guest-123"}'
```

**Example (Logged-in)**:
```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"message":"Explain ROS2","session_id":"user-456","selected_text":"ROS2 is a middleware..."}'
```

---

### GET /api/chat/history

Get chat history for a session. **Requires authentication**.

**Headers**:
```
Authorization: Bearer <token>
```

**Query Parameters**:
```
session_id=string (required)
```

**Response (200 OK)**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "What is RAG?",
      "timestamp": "ISO8601 datetime"
    },
    {
      "role": "assistant",
      "content": "RAG stands for Retrieval-Augmented Generation...",
      "timestamp": "ISO8601 datetime"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized` — Invalid or missing token
- `404 Not Found` — Session not found

---

## Personalization Endpoints

### POST /api/personalize

Personalize chapter content based on user profile. **Requires authentication**.

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "chapter_title": "string (required)",
  "content": "string (required, original chapter content)"
}
```

**Response (200 OK)**:
```json
{
  "personalized_content": "string (AI-rewritten content based on user profile)"
}
```

**Personalization Logic**:
- Beginner level → Simplified explanations, more examples
- Intermediate level → Standard technical depth
- Advanced level → Advanced concepts, fewer basics
- Preferred language Urdu → Content in Urdu

**Error Responses**:
- `401 Unauthorized` — Invalid or missing token
- `500 Internal Server Error` — AI service error

---

## Translation Endpoints

### POST /api/translate

Translate chapter content to Urdu. **Requires authentication**.

**Headers**:
```
Authorization: Bearer <token>
```

**Request**:
```json
{
  "content": "string (required, text to translate)"
}
```

**Response (200 OK)**:
```json
{
  "translated_content": "string (Urdu translation)"
}
```

**Translation Notes**:
- Urdu text uses RTL (right-to-left) direction
- Font: Noto Nastaliq Urdu
- Translation is AI-powered (not literal)

**Error Responses**:
- `401 Unauthorized` — Invalid or missing token
- `500 Internal Server Error` — Translation service error

---

## Health Check Endpoints

### GET /health

Health check endpoint (public, no auth required).

**Response (200 OK)**:
```json
{
  "status": "ok",
  "model": "nvidia/nemotron-3-nano-30b-a3b:free"
}
```

---

### GET /

Root endpoint (public, no auth required).

**Response (200 OK)**:
```json
{
  "message": "Welcome to Book RAG API",
  "docs": "/docs"
}
```

---

## Error Response Format

All errors follow this format:

```json
{
  "detail": "string (human-readable error message)"
}
```

**HTTP Status Codes**:
- `200 OK` — Success
- `400 Bad Request` — Invalid input
- `401 Unauthorized` — Missing or invalid authentication
- `404 Not Found` — Resource not found
- `500 Internal Server Error` — Server error

---

## Authentication Flow

```
┌─────────────┐
│   Guest     │
│  (No Auth)  │
└──────┬──────┘
       │
       │ /auth/signup or /auth/signin
       ▼
┌─────────────┐
│  Authenticated│
│  (Has Token) │
└──────┬──────┘
       │
       │ Store token in localStorage
       ▼
┌─────────────┐
│  Use Token  │
│ in Headers  │
└─────────────┘
```

**Token Storage** (Frontend):
```typescript
// After login/signup
localStorage.setItem('auth_token', response.token);
localStorage.setItem('auth_user', JSON.stringify(response.user));

// Retrieve for API calls
const token = localStorage.getItem('auth_token');
```

**Token Expiry**:
- Tokens expire after 30 days
- No refresh token mechanism (re-login required)
- Frontend redirects to `/login` on 401 response

---

## Rate Limiting

**Current Status**: Not implemented

**Future Considerations**:
- Guest chat: 10 messages per minute
- Authenticated chat: 60 messages per minute
- Personalization: 10 requests per minute
- Translation: 10 requests per minute

---

## CORS Configuration

**Allowed Origins**:
```
http://localhost:3000
http://localhost:3001
https://furqan2004.github.io
```

**Allowed Methods**:
- GET, POST, PUT, DELETE, OPTIONS

**Allowed Headers**:
- Content-Type, Authorization

**Credentials**:
- Allowed (for potential cookie-based auth in future)
