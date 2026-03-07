# Research: Optimize Personalization and Translation Endpoints

## Docusaurus Remote Content Fetching

### Decision: URL Construction Logic

- **Source Path**: `@site/docs/part-1-foundations/intro.md`
- **Frontend URL Construction**: 
  1. Pick base URL from `.env` `CORS_ORIGINS` (e.g., `http://localhost:3000/physical-ai-book`).
  2. Strip `@site/` from the path.
  3. Prepend the base URL.
  4. Resulting URL: `http://localhost:3000/physical-ai-book/docs/part-1-foundations/intro.md`.

### Rationale

This approach leverages the existing configuration for frontend communication. By using `httpx`, we can perform non-blocking requests to retrieve the raw markdown content from the frontend deployment, ensuring the backend stays decoupled from the frontend's physical file structure.

### Alternatives Considered

- **Reading from Local Repository**: Rejected because the user explicitly stated to fetch directly from the frontend page.
- **Fetching from GitHub Raw**: Rejected as the user pointed to `CORS_ORIGINS` which includes localhost and the GitHub Pages URL, suggesting a focus on the deployed/running instance.

## Database Caching Layer

### Decision: Schema and Storage

- **Personalization Table**: 
  - `user_id`: Links content to a specific user.
  - `chapter_id`: Identifier for the document.
  - `content`: Stored as `TEXT`.
- **Translation Table**:
  - `chapter_id`: Global identifier.
  - `language`: Fixed at `ur` (Urdu).
  - `content`: Stored as `TEXT`.

### Rationale

Storing pre-generated AI content in Neon Postgres (PostgreSQL) provides persistent storage with low latency. Using `chapter_id` as a primary key (combined with `user_id` for personalization) ensures fast lookups.

### Alternatives Considered

- **Redis Caching**: Rejected as Neon Postgres is already the primary database and is suitable for storing large text chunks without introducing another infrastructure component.

## Implementation of HTTP Extraction

### Decision: Use `httpx` with Fallback

- **Library**: `httpx` (already in `requirements.txt`).
- **Logic**: 
  - Construct URL.
  - Execute `GET` request.
  - Handle `404` or `500` errors gracefully by returning a helpful error message to the AI process or user.

### Rationale

`httpx` is standard for modern FastAPI applications, supporting both sync and async calls.
