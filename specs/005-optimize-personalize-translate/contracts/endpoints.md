# API Contract: Personalization and Translation

## `POST /api/personalize`

**Description**: Personalized a chapter's markdown content for a specific user.

### Request Body

```json
{
  "chapter_id": "intro",
  "chapter_content": "@site/docs/intro.md"
}
```

### Response (200 OK)

```json
{
  "personalized_content": "...",
  "chapter_id": "intro",
  "cached": true | false
}
```

---

## `POST /api/translate`

**Description**: Translate a chapter's markdown content into Urdu script (global cache).

### Request Body

```json
{
  "chapter_id": "intro",
  "chapter_content": "@site/docs/intro.md"
}
```

### Response (200 OK)

```json
{
  "translated_content": "...",
  "chapter_id": "intro",
  "cached": true | false
}
```

### Errors

- `401 Unauthorized`: Missing or invalid authentication.
- `404 Not Found`: Frontend document URL is unreachable.
- `500 Internal Server Error`: AI processing failed or database error.
