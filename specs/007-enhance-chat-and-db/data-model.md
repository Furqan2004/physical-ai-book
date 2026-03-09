# Data Model: Enhance Chat UI and Database Chapter Storage

## Entities

### Chapter
Represents a single document or section of the book stored in the relational database.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary Key |
| slug | String | Unique identifier (e.g., "part-1/foundations") |
| title | String | Human-readable title of the chapter |
| content | Text | Full markdown content |
| last_synced | Timestamp | Last time the content was updated from source |
| created_at | Timestamp | Record creation time |

**Relationships**:
- N/A (Independent content storage)

## State Transitions

### Content Sync
1. Source file read from `frontend/docs/*.md`.
2. Metadata extracted (title from frontmatter or first heading).
3. Record upserted into `chapters` table via `slug`.
4. `last_synced` updated to current time.
