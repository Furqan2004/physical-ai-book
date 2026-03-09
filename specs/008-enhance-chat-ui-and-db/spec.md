# Feature Specification: Enhanced Chatbot UI & Database Chapter Storage

**Feature Branch**: `008-enhance-chat-ui-and-db`  
**Created**: 2025-03-10  
**Status**: Draft  
**Input**: User description: "sab sa pahla hamari jo frontend ki logic ha jo hama ya kahti ha ask about this wo directly AI ko prompt send kar dati ha isko set karo ka wo direct send na kara balka AI chatbot open ho or uska promt bar ma hamara contect aa jai taka user usma kuch addition means kuch questions bhi dal kar 1 bar hi AI sa poch la.also chatbox newline abhi support nahi kar raha wo bhi add karo or iska ilawa ya bhi add karo ka prompt box according to the user prompt thora increase ho jay jasa normal chatbots ma hota ha. iska ilawa jitna bhi chapters avaliable hai abhi hamara pass unko neon postgresql ma save karwa do or jab bhi user personalize ya translate karwai to content web sa fatch nahi ho directly db sa pick ho jay. or baki personalize or translate ki logic same raha gi like existing fresh and etc things."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Contextual Inquiry (Priority: P1)

As a reader, I want to be able to add my own questions to the "Ask about this" context so that I can get more specific answers from the AI without sending multiple messages.

**Why this priority**: This is the core request for improving user interaction and reducing unnecessary AI turns.

**Independent Test**: User clicks "Ask about this" on a specific section. The chatbot opens, the prompt bar contains the context, but NO message is sent. User types "How does this apply to autonomous vehicles?" and clicks send. The AI responds to both the context and the user's specific question.

**Acceptance Scenarios**:

1. **Given** a user is reading a chapter, **When** they click "Ask about this", **Then** the chatbot UI opens and the input field is pre-filled with the relevant context.
2. **Given** the pre-filled prompt bar, **When** the user clicks outside or waits, **Then** no message is sent until the user explicitly triggers it.

---

### User Story 2 - Fluid Chat Input (Priority: P2)

As a user, I want to type multi-line messages and see my entire input clearly so that I can compose complex questions easily.

**Why this priority**: Improves usability and brings the chatbot interface to modern standards.

**Independent Test**: User types a 5-line paragraph into the prompt box. The prompt box expands vertically to show all 5 lines without a scrollbar appearing until a maximum height is reached.

**Acceptance Scenarios**:

1. **Given** the chat input field, **When** the user presses "Enter" (or Shift+Enter), **Then** a newline is added and the cursor moves to the next line.
2. **Given** the chat input field, **When** the text exceeds the current height, **Then** the input field increases in height automatically.

---

### User Story 3 - Database-Driven Personalization (Priority: P1)

As a user, I want personalization and translation to be fast and reliable by using stored chapter data instead of fetching it from the web every time.

**Why this priority**: Critical for performance and reliability of the AI features.

**Independent Test**: User requests to "Translate to Urdu" for a chapter. The system retrieves the source text from the PostgreSQL database and processes the translation.

**Acceptance Scenarios**:

1. **Given** a chapter exists in the database, **When** a user triggers "Personalize", **Then** the system uses the database content as the source.
2. **Given** a new chapter is added to the book, **When** the sync is triggered, **Then** it is saved to the Neon PostgreSQL database.

---

### Edge Cases

- **Empty Database**: If a chapter is requested for personalization but is not found in the database, the system should have a graceful fallback (e.g., attempt a one-time fetch and store).
- **Large Context**: If "Ask about this" involves a very large section of text, the prompt box should handle the overflow gracefully (perhaps truncated or scrollable if it exceeds max-height).
- **Network Failure**: If the database is unreachable, the system should inform the user or attempt a direct web fetch if possible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Ask about this" button MUST NOT trigger an immediate AI request.
- **FR-002**: The system MUST open the chatbot component and set the input field's initial value to the provided context when "Ask about this" is clicked.
- **FR-003**: The chat input component MUST support newline characters and multi-line display.
- **FR-004**: The chat input component MUST implement auto-resizing logic to expand vertically based on content.
- **FR-005**: All available book chapters MUST be stored in the `chapters` table in Neon PostgreSQL.
- **FR-006**: The backend personalization and translation endpoints MUST prioritize the database as the source of chapter content.
- **FR-007**: The system MUST maintain existing logic for "fresh" content (e.g., checking if a cached version exists before regenerating) but use the DB-stored source text.

### Key Entities *(include if feature involves data)*

- **Chapter**: Represents a section of the book. Attributes: `id`, `title`, `slug`, `content`, `last_updated`.
- **ChatSession**: Represents the state of the current conversation, including the pending prompt context.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of "Ask about this" interactions result in a pre-filled, un-sent prompt in the chatbot.
- **SC-002**: Chat input box supports at least 10 lines of visible text before requiring internal scrolling.
- **SC-003**: Personalization/Translation requests retrieve source content from the database in under 100ms.
- **SC-004**: All existing chapters are successfully migrated to the PostgreSQL database.
