# Feature Specification: Enhance Chat UI and Database Chapter Storage

**Feature Branch**: `007-enhance-chat-and-db`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: User description: "sab sa pahla hamari jo frontend ki logic ha jo hama ya kahti ha ask about this wo directly AI ko prompt send kar dati ha isko set karo ka wo direct send na kara balka AI chatbot open ho or uska promt bar ma hamara contect aa jai taka user usma kuch addition means kuch questions bhi dal kar 1 bar hi AI sa poch la.also chatbox newline abhi support nahi kar raha wo bhi add karo or iska ilawa ya bhi add karo ka prompt box according to the user prompt thora increase ho jay jasa normal chatbots ma hota ha. iska ilawa jitna bhi chapters avaliable hai abhi hamara pass unko neon postgresql ma save karwa do or jab bhi user personalize ya translate karwai to content web sa fatch nahi ho directly db sa pick ho jay. or baki personalize or translate ki logic same raha gi like existing fresh and etc things."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive "Ask about this" (Priority: P1)

As a student reading the book, when I highlight text and click "Ask about this", I want the chatbot to open with the selected text pre-filled in the input box, so that I can add my own question or context before sending it to the AI.

**Why this priority**: It significantly improves user control and reduces redundant AI queries by allowing users to refine their questions.

**Independent Test**: Highlighting a paragraph in the docs, clicking the "Ask" button, verifying the chatbot opens, and confirming the text is in the input box but NOT yet sent.

**Acceptance Scenarios**:

1. **Given** a user is on a book page, **When** they select text and click "Ask about this", **Then** the Chatbot sidebar/modal MUST open.
2. **Given** the Chatbot is open via "Ask about this", **When** the user checks the prompt bar, **Then** it MUST contain the selected text formatted as a quote or reference.

---

### User Story 2 - Modern Chat Interface (Priority: P2)

As a user interacting with the AI, I want the chat input box to support multiple lines (newlines) and automatically grow in size as I type more text, so that I can easily compose and review long questions.

**Why this priority**: Essential for professional UX; currently, users are restricted to single-line prompts which is frustrating for complex technical queries.

**Independent Test**: Typing multiple sentences in the chat input, using `Shift+Enter` for newlines, and observing the box expanding vertically.

**Acceptance Scenarios**:

1. **Given** the chat input is focused, **When** the user types enough text to wrap, **Then** the input box height MUST increase to fit the content.
2. **Given** the chat input has text, **When** the user presses `Shift+Enter`, **Then** a newline MUST be added without sending the message.

---

### User Story 3 - Database-Backed Chapter Content (Priority: P1)

As a system administrator/user, I want all book chapters to be stored in the Neon PostgreSQL database, so that personalization and translation features can retrieve content locally from the database instead of fetching it from external URLs or the filesystem repeatedly.

**Why this priority**: Critical for performance and reliability. It ensures a stable source of truth for all content transformation tasks.

**Independent Test**: Clearing the frontend/backend cache and triggering a "Personalize" request, then verifying (via logs or DB inspection) that the content was retrieved from the `chapters` table in PostgreSQL.

**Acceptance Scenarios**:

1. **Given** a chapter exists in the book outline, **When** it is first accessed or synced, **Then** its full markdown content MUST be saved to the database.
2. **Given** a chapter is already in the database, **When** a user requests "Translate" or "Personalize", **Then** the system MUST use the DB content as the source.

---

### Edge Cases

- **Large Text Selection**: What happens if a user selects the entire page content? The prompt bar should handle large text without breaking the layout.
- **DB Sync Failure**: If the database is unreachable, should the system fallback to web fetch? (Recommended: Yes, with a warning).
- **Prompt Size Limit**: The chat input box should have a maximum height limit after which it becomes scrollable, to prevent it from covering the entire screen.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST intercept the "Ask about this" click and redirect the selected text to the Chatbot input state instead of the API.
- **FR-002**: Chat input box MUST use a multi-line input (textarea) that supports auto-expansion based on content.
- **FR-003**: Chat input MUST support `Shift+Enter` for newlines and `Enter` for sending the message (unless custom settings are applied).
- **FR-004**: System MUST implement a `chapters` table in Neon PostgreSQL to store markdown content, slugs, and titles.
- **FR-005**: Backend MUST provide a mechanism to sync/import book markdown files into the PostgreSQL database.
- **FR-006**: Personalization and Translation endpoints MUST be updated to query the `chapters` table before attempting external fetches.
- **FR-007**: Chapter retrieval MUST handle missing records by either syncing on-demand or returning a clear error if the source is also unavailable.

### Key Entities *(include if feature involves data)*

- **Chapter**: Represents a book section.
  - `id`: UUID / Primary Key
  - `slug`: Unique identifier (e.g., "part-1/foundations")
  - `title`: Chapter title
  - `content`: Full markdown text
  - `last_synced`: Timestamp
- **ChatMessage**: (UI State only) Current text in the prompt bar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: "Ask about this" flow takes 0ms API calls before user hits "Send" (client-side pre-fill).
- **SC-002**: Chat input box supports at least 5 lines of visible text before triggering internal scrolling.
- **SC-003**: 100% of chapter content for Personalize/Translate is retrieved from PostgreSQL after the initial sync.
- **SC-004**: Chapter retrieval from DB is at least 30% faster than external web fetches (reduced network latency).
