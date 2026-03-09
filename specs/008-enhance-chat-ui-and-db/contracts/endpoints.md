# API Contracts: Enhanced Chatbot UI & Database Chapter Storage

## Endpoints

### POST /api/chat
- **Request Body**:
  ```json
  {
    "message": "string",
    "session_id": "string",
    "selected_text": "string | null"
  }
  ```
- **Description**: Handles a chat message from the user. `selected_text` provides context if triggered from "Ask about this".

### POST /api/personalize
- **Request Body**:
  ```json
  {
    "chapter_content": "string (@site/docs/...) or markdown",
    "chapter_id": "string",
    "mode": "existing | fresh"
  }
  ```
- **Description**: Returns personalized markdown content for the user. Uses the database as the source of content based on `chapter_content` (slug).

### POST /api/translate
- **Request Body**:
  ```json
  {
    "chapter_content": "string (@site/docs/...) or markdown",
    "chapter_id": "string",
    "mode": "existing | fresh"
  }
  ```
- **Description**: Returns the Urdu translation for the given chapter. Uses the database as the source.

## Error Response
In case of a failure (AI agent failure, database error):
- **Status Code**: 500
- **Body**:
  ```json
  {
    "detail": "Personalization failed. Please try again."
  }
  ```
- **Action**: Frontend should display this message on the page.
