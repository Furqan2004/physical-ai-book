# Feature Specification: Fix Ask Functionality and AI Prompt Responses

**Feature Branch**: `006-fix-ask-ai-prompts`  
**Created**: 2026-03-09  
**Status**: Draft  
**Input**: User description: "mera project ma sab kuch Alhamdulillah Okay ha just kuch changes karni hai like 1st frontend ma login users ka liya 1 functionality ha called Ask about this jo sirif book ma ha matlab http//localhost:3000/physical-ai-book/docs sirif is page or iska andat jitna page hai sab ma ya functionality ha but issue ya ha ka har page ma ya satrt ka content ma work kar raha ha but mid or end ma work nahi kar raha. Ma ya chah raha hu ka ya har http//localhost:3000/physical-ai-book/docs isma or iska andar jitna page hai unma har jaga har 1 chiz ma work kara. Backend ma tumha just AI ka prompts sahi karna hai ka wo in sab ka answer kara like greeting messages or koi bhi question Physical AI & Humanoid Robotics sa related even koi wi content verctor db ma find kar pai ya nahi lakin agar greeting message ha ya isi book sa related koi answer ha to wo lazmi answer kara."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent "Ask about this" across pages (Priority: P1)

As a logged-in user, I want to be able to use the "Ask about this" functionality for any piece of content on a book page, regardless of whether it is at the beginning, middle, or end of the page, so that I can get context-aware help throughout my reading.

**Why this priority**: Core feature functionality is currently broken for a large portion of the page content, significantly degrading the user experience for the main product (the book).

**Independent Test**: Can be tested by navigating to various pages under `/physical-ai-book/docs`, selecting text or clicking "Ask about this" at the top, middle, and bottom of the pages, and verifying the AI receives the correct context.

**Acceptance Scenarios**:

1. **Given** a logged-in user is on a page under `/physical-ai-book/docs`, **When** they use "Ask about this" for content at the very beginning of the page, **Then** the AI provides a relevant response based on that content.
2. **Given** a logged-in user is on a page under `/physical-ai-book/docs`, **When** they use "Ask about this" for content in the middle or at the end of the page, **Then** the AI provides a relevant response based on that specific content.

---

### User Story 2 - Intelligent AI Prompt Responses (Priority: P2)

As a user, I want the AI to respond naturally to greetings and provide accurate information about Physical AI and Humanoid Robotics even if the specific query isn't directly matched in the vector database, so that the interaction feels helpful and knowledgeable.

**Why this priority**: Improves the perceived intelligence and helpfulness of the AI, making it more than just a search tool.

**Independent Test**: Can be tested by sending greetings ("Hi", "Hello") and domain-specific questions (e.g., "What is a humanoid robot?") to the chatbot and verifying the quality of the responses.

**Acceptance Scenarios**:

1. **Given** a user sends a greeting like "Hello", **When** the AI processes the message, **Then** it responds with a polite and appropriate greeting.
2. **Given** a user asks a question about Physical AI or Humanoid Robotics, **When** the content is not explicitly found in the vector database, **Then** the AI provides a technically accurate answer based on its internal knowledge of the subject.

---

### Edge Cases

- **Large Content Selection**: What happens when a user selects an extremely large block of text for "Ask about this"?
- **Disconnected Backend**: How does the "Ask about this" UI handle scenarios where the AI backend is unreachable?
- **Ambiguous Queries**: How does the AI respond to queries that are neither greetings nor related to Physical AI/Humanoid Robotics?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The "Ask about this" functionality MUST be available for all document content under the `/physical-ai-book/docs` path and its sub-directories.
- **FR-002**: The frontend MUST capture and send the correct text context to the backend regardless of its position on the page (start, middle, or end).
- **FR-003**: The AI system MUST detect and respond to common greeting messages appropriately.
- **FR-004**: The AI system MUST prioritize its persona as an expert in Physical AI and Humanoid Robotics.
- **FR-005**: The AI system MUST provide answers to domain-related questions even if no high-confidence match is found in the vector database, utilizing its general knowledge as a fallback.
- **FR-006**: The system MUST ensure that "Ask about this" only functions for authenticated (logged-in) users.

### Key Entities *(include if feature involves data)*

- **Document Context**: Represents the specific text or section of the book the user is currently inquiring about.
- **AI Response**: The generated answer from the backend, including context from the vector DB or internal knowledge.
- **User Session**: Used to verify authentication status before allowing "Ask about this" interactions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of "Ask about this" triggers on valid book pages result in the correct context being sent to the backend, regardless of scroll position.
- **SC-002**: 100% of standard greeting messages receive a polite, non-error response.
- **SC-003**: 95% of questions related to Physical AI or Humanoid Robotics receive a technically relevant answer, either from the vector DB or fallback internal knowledge.
- **SC-004**: Zero "Ask about this" triggers fail due to "content not found" if the content is clearly visible on the page.
