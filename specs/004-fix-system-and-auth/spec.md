# Feature Specification: System Overhaul & Authentication Fixes

**Feature Branch**: `004-fix-system-and-auth`  
**Created**: 2026-03-06  
**Status**: Draft  
**Input**: User description: "Roman Urdu Prompt detailing frontend/backend issues (Auth, Chatbot scoping, Agent fixes, Backend reliability)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seamless Authentication Flow (Priority: P1)

Users need to sign up, log in, and reset their passwords without being redirected to broken or incorrect URLs.

**Why this priority**: Authentication is the gateway to the application. Broken redirects and missing pages (Forgot Password) prevent user access entirely.

**Independent Test**: Verify that the Signup button on the Sign-in page leads to `/physical-ai-book/signup`. Verify that "Forgot Password" leads to a functional page at `/physical-ai-book/forgot-password`. Verify login/signup works via Better Auth.

**Acceptance Scenarios**:

1. **Given** a user on the Sign-in page, **When** they click the Signup button, **Then** they are redirected to `http://localhost:3000/physical-ai-book/signup`.
2. **Given** a user on the Sign-in page, **When** they click "Forgot Password", **Then** they are redirected to a functional reset page at `http://localhost:3000/physical-ai-book/forgot-password`.
3. **Given** valid credentials, **When** a user logs in, **Then** Better Auth validates the session and grants access within the Next.js environment.

---

### User Story 2 - Context-Aware Chatbot (Priority: P1)

Users should only see the chatbot when they are in the documentation section of the "Physical AI Book" to avoid cluttering other pages.

**Why this priority**: Proper scoping ensures the UI remains clean and the chatbot is only active where it provides relevant context (documentation).

**Independent Test**: Navigate through various pages (Home, Signup, Login, Docs). Confirm the chatbot is visible *only* on `/physical-ai-book/docs/*` pages.

**Acceptance Scenarios**:

1. **Given** a user is on `http://localhost:3000/physical-ai-book/docs/introduction`, **When** the page loads, **Then** the chatbot is visible and functional.
2. **Given** a user is on `http://localhost:3000/signup`, **When** the page loads, **Then** the chatbot is completely hidden.

---

### User Story 3 - Robust Agent Interactions (Priority: P2)

Users interact with Personalization and Translation agents that should be bug-free and have access to all system tools to provide clear, helpful answers.

**Why this priority**: The agents are the core value proposition for the RAG system. Failure to use tools or provide clear answers degrades the user experience.

**Independent Test**: Ask the chatbot a question requiring personalization (e.g., "Summarize based on my previous interests") and one requiring translation. Verify tools are called correctly and responses are clear.

**Acceptance Scenarios**:

1. **Given** a user query requiring a tool (e.g., search or translate), **When** the agent processes it, **Then** it successfully executes the tool and incorporates the output into a clear response.
2. **Given** a request for translation, **When** the Translation Agent responds, **Then** the output is linguistically correct and maintains the user's personalized context.

---

### User Story 4 - Frontend-Driven Onboarding (Priority: P2)

New users should experience a smooth onboarding flow where initial questions are handled directly in the frontend for better performance and immediate feedback.

**Why this priority**: Moving logic to the frontend reduces backend roundtrips and allows for a more interactive and responsive signup experience.

**Independent Test**: Complete the signup flow and verify that the "Questions" step occurs entirely on the client side before final submission.

**Acceptance Scenarios**:

1. **Given** a user starts the signup flow, **When** they reach the questionnaire, **Then** the logic and state are managed by the frontend without page reloads or interim backend calls.

---

### User Story 5 - Reliable Data Persistence (Priority: P1)

Users expect their history and data to be saved reliably so they can pick up where they left off.

**Why this priority**: Data loss (chat history or vector embeddings) destroys trust in the system.

**Independent Test**: Perform a chat session, refresh, and verify history is retrieved from Neon PostgreSQL. Verify new content is correctly embedded and searchable in Qdrant Cloud.

**Acceptance Scenarios**:

1. **Given** a completed chat session, **When** the user returns later, **Then** their history is correctly pulled from Neon PostgreSQL.
2. **Given** new documentation content, **When** the system processes it, **Then** embeddings are created and stored in Qdrant Cloud without errors.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement **Better Auth** as the primary authentication provider integrated with Next.js.
- **FR-002**: Sign-in page Signup button MUST redirect to `/physical-ai-book/signup`.
- **FR-003**: A "Forgot Password" page MUST exist at `/physical-ai-book/forgot-password` and be reachable from the Login page.
- **FR-004**: Chatbot visibility MUST be restricted to `http://localhost:3000/physical-ai-book/docs/*` using route-based conditional rendering.
- **FR-005**: Signup "Questions" logic MUST be migrated from Python backend to React/Next.js frontend.
- **FR-006**: Personalization Agent MUST have access to all system tools (Search, DB, etc.) and provide tailored responses.
- **FR-007**: Translation Agent MUST have access to all system tools and provide accurate, context-aware translations.
- **FR-008**: Neon PostgreSQL MUST be configured to handle both Better Auth data and general user history/application data reliably.
- **FR-009**: Qdrant Cloud MUST be used for vector storage, with guaranteed successful embedding creation and retrieval operations.
- **FR-010**: All agents MUST generate clear, bug-free responses even when executing multi-tool workflows.

### Key Entities *(include if feature involves data)*

- **User**: Represents the authenticated individual (managed via Better Auth + Neon).
- **Session/History**: Stores the interactions between User and Agents (stored in Neon).
- **Vector Embedding**: High-dimensional representation of documentation and user context (stored in Qdrant Cloud).
- **Agent**: Functional entities (Personalization, Translation) that process user input using Tools.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of authentication attempts (Login/Signup/Reset) use the correct URL paths defined in FR-002/003.
- **SC-002**: Chatbot presence on non-docs pages is 0%.
- **SC-003**: Agent tool execution success rate is 100% (no "tool not found" or "permission denied" errors).
- **SC-004**: Users can complete the signup questionnaire with 0 backend calls during the question phase.
- **SC-005**: Retrieval latency from Qdrant Cloud for vector searches remains under 500ms for 95% of requests.
