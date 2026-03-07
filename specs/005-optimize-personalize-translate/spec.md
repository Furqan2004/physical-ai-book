# Feature Specification: Optimize Personalization and Translation Endpoints

**Feature Branch**: `005-optimize-personalize-translate`  
**Created**: 2026-03-07  
**Status**: Draft  
**Input**: User description: "sab sa pahli baat ka backend ma personalize or translation ka endpoints hai wo abhi kuch is tarah work kar raha hai ka unka pass abhi file name aa raha ha or ussa wo file ko local sa pick kar ka extract kar raha hai but hama aasa nahi karna hama kuch you karna ha ka jab bhi personalize ya translation ka buttion press ho backend ma hit aai to backend 1st check kara db ka ka ya pahla is user na kabhi personalize kiya ha agar kiya ha to wahi content dubara la aai bar bar AI ka tokens zaya nahi kara. 2nd agar translation ka button hit ho to translation 1 hi avaliable ha urdu to check karo ka pura data base ma agar kisi bhi user na us page ko translate karwaya ho wahi content la aao or agar nahi karwaya ho tab AI ka pass bhajo. Personalize har user ka alag alag ho ga jabka translation 1 hi hogi all users ki. agar user personalize par click karta ha to check hona ka bad frontend sa directly data fatch kara link usa yaha mil jay gi .env ma CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://furqan2004.github.io pages kuch you hai ya intro page http://localhost:3000/physical-ai-book/docs/intro or agar ispar koi personalize ya translate par click karta ha to data kuch you aata ha chapter_content='@site/docs/intro.md' chapter_id='intro' isko link sa match kar lo or httpx ya koi or chiz use karta hua md file format ma data extract karo. requirements.txt adjust karo or make sure karo ka sab Okay ha or sab sahi chal raha hai."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Personalized Content Retrieval (Priority: P1)

As a returning user, I want my previously personalized content to load instantly without re-processing, so that I can continue learning where I left off without delay.

**Why this priority**: Core optimization to reduce AI costs and improve user experience for returning users.

**Independent Test**: Can be tested by personalizing a page, navigating away, and returning to the same page; the second load should be near-instant and not trigger an AI call.

**Acceptance Scenarios**:

1. **Given** a user has previously personalized "Introduction" chapter, **When** they request personalization for "Introduction" again, **Then** the system MUST return the stored content from the database.
2. **Given** a user has NEVER personalized "Chapter 1", **When** they request personalization for "Chapter 1", **Then** the system MUST fetch the source content from the frontend, process it with AI, store it for that user, and return the result.

---

### User Story 2 - Global Urdu Translation (Priority: P1)

As any user, I want to see a translation of a chapter that was previously translated by someone else, so that the system is efficient and reduces unnecessary AI processing for common languages.

**Why this priority**: Significant cost saving as translations are identical for all users.

**Independent Test**: Can be tested by User A translating a page to Urdu, then User B requesting the same translation; User B should receive the same content without a new AI request.

**Acceptance Scenarios**:

1. **Given** any user has previously translated "Chapter 2" to Urdu, **When** any other user requests Urdu translation for "Chapter 2", **Then** the system MUST return the existing translation from the database.
2. **Given** no one has translated "Chapter 3" to Urdu, **When** a user requests Urdu translation for "Chapter 3", **Then** the system MUST fetch source content, translate via AI, store it globally, and return the result.

---

### User Story 3 - Remote Content Extraction (Priority: P2)

As a developer, I want the system to fetch source content directly from the frontend deployment rather than relying on local files, so that the backend is decoupled from the content storage.

**Why this priority**: Improves maintainability and allows the backend to work with dynamic or remote content.

**Independent Test**: Can be tested by updating a file on the frontend and requesting a personalization; the backend should reflect the updated frontend content.

**Acceptance Scenarios**:

1. **Given** a chapter ID and a content path, **When** the content is not in the database, **Then** the system MUST construct the correct frontend URL and fetch the raw markdown content.

---

### Edge Cases

- **What happens when the frontend URL is unreachable?**: The system should return a clear error message to the user indicating the source content could not be retrieved.
- **How does system handle malformed markdown from the source?**: The extraction process should handle errors gracefully and ensure the AI receives clean text or reports a failure.
- **What if the database store fails?**: The system should still return the AI-generated content to the user but log a warning that caching failed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST query the database for existing personalization records matching both `user_id` and `chapter_id` before invoking AI services.
- **FR-002**: System MUST query the database for existing Urdu translation records matching `chapter_id` (regardless of user) before invoking AI services.
- **FR-003**: System MUST fetch source markdown content from the frontend URL by mapping `@site/` paths to the configured `CORS_ORIGINS` base URLs.
- **FR-004**: System MUST store newly generated personalized content in the database, associated with the specific user.
- **FR-005**: System MUST store newly generated Urdu translations in the database as global records accessible to all users.
- **FR-006**: System MUST use a robust HTTP client to extract content from remote URLs with appropriate timeouts and error handling.
- **FR-007**: System MUST resolve the correct frontend URL based on the environment configuration (local vs production).

### Key Entities *(include if feature involves data)*

- **PersonalizationEntry**: Represents a user's unique version of a chapter. (Attributes: `id`, `user_id`, `chapter_id`, `content`, `created_at`)
- **TranslationEntry**: Represents a global translation of a chapter. (Attributes: `id`, `chapter_id`, `language` (default 'ur'), `content`, `created_at`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI token consumption for personalization/translation is reduced to 0 for all repeated requests of the same content.
- **SC-002**: Average response time for cached content retrieval is under 300ms.
- **SC-003**: 100% of chapters identified by `@site/docs/*.md` patterns are successfully mapped and fetched from the frontend.
- **SC-004**: System successfully handles concurrent translation requests by multiple users by serving the first completed translation to subsequent requesters.

## Assumptions

- **A-001**: The backend has network access to the frontend URLs specified in `.env`.
- **A-002**: The frontend serves raw markdown content or the system can extract it from the provided URLs (e.g., Docusaurus `.md` source).
- **A-003**: A database (PostgreSQL/Neon) is available and initialized for storing these records.
