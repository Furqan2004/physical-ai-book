# Feature Specification: AI Book Assistant RAG Fixes

**Feature Branch**: `002-rag-chatbot-fixes`
**Created**: 2026-03-06
**Status**: Draft
**Input**: Fix connection issues, make chatbot public, validate authentication, and ensure Qdrant pipeline works correctly

## User Scenarios & Testing

### User Story 1 - Guest User Chatbot Access (Priority: P1)

As a visitor to the AI Book, I want to ask questions about the book content without needing to create an account, so that I can quickly get answers and understand if the book is valuable to me.

**Why this priority**: This is the core MVP functionality. Making the chatbot publicly accessible removes barriers to entry and allows immediate value delivery. Without this, the book cannot serve its primary purpose of helping users learn.

**Independent Test**: Can be fully tested by accessing the book as an unauthenticated user, asking a question in the chatbot, and receiving an AI-generated answer based on book content.

**Acceptance Scenarios**:

1. **Given** I am a guest user (not logged in), **When** I open the chatbot and ask "What is RAG?", **Then** I receive an AI-generated answer based on book content without being prompted to log in
2. **Given** I am a guest user, **When** I ask multiple questions, **Then** each question receives a relevant answer but my chat history is not saved after I leave the page
3. **Given** I am a guest user, **When** I interact with the chatbot, **Then** I see a subtle banner suggesting "Login for personalized experience" but it does not block my ability to chat

---

### User Story 2 - User Registration with Background Questions (Priority: P2)

As a new user, I want to create an account and provide information about my technical background, so that the system can personalize content to my skill level and preferences.

**Why this priority**: User registration enables personalized learning experiences and long-term engagement. The background questions are essential for the personalization feature to work effectively.

**Independent Test**: Can be fully tested by navigating to signup, completing registration with background questions, and verifying the account is created with profile data saved.

**Acceptance Scenarios**:

1. **Given** I am on the signup page, **When** I enter my name, email, password, and answer background questions (software level: Intermediate, languages: Python/JavaScript, hardware level: Basic, preferred language: English), **Then** my account is created and I am logged in
2. **Given** I have just signed up, **When** I complete the background questions, **Then** my answers are saved to my user profile and used for future personalization
3. **Given** I am a registered user, **When** I log in, **Then** I am redirected to my profile or the book homepage with full access to personalized features

---

### User Story 3 - Personalized Content for Logged-in Users (Priority: P3)

As a logged-in user with a saved profile, I want to personalize chapter content to match my technical background and preferred language, so that I can learn more effectively with content tailored to my level.

**Why this priority**: Personalization is a key differentiator that enhances learning outcomes. It builds on top of the basic chatbot and authentication features to provide adaptive content.

**Independent Test**: Can be fully tested by logging in, navigating to a chapter, clicking "Personalize Content", and verifying the content is rewritten based on user profile.

**Acceptance Scenarios**:

1. **Given** I am logged in with a profile showing "Beginner" software level, **When** I click "Personalize Content" on a chapter, **Then** the content is rewritten with simpler explanations and beginner-friendly examples
2. **Given** I am logged in with preferred language "Urdu", **When** I click "Translate to Urdu", **Then** the chapter content is translated to Urdu with proper right-to-left text display
3. **Given** I am logged in, **When** I select text in a chapter, **Then** I can ask the chatbot a question specifically about that selected text and receive a focused answer

---

### User Story 4 - Chat History Persistence (Priority: P4)

As a logged-in user, I want my chat history to be saved across sessions, so that I can refer back to previous questions and continue learning where I left off.

**Why this priority**: Chat history enhances the learning experience by providing continuity, but it is not essential for basic functionality. It depends on authentication being working correctly.

**Independent Test**: Can be fully tested by logging in, having a chat conversation, logging out, logging back in, and verifying the chat history is restored.

**Acceptance Scenarios**:

1. **Given** I am logged in, **When** I have a conversation with the chatbot, **Then** my messages and the AI responses are saved to my chat history
2. **Given** I have previous chat history, **When** I log in and open the chatbot, **Then** my previous conversations are loaded and visible
3. **Given** I am a guest user, **When** I use the chatbot, **Then** my chat history is NOT saved and is lost when I close the browser

---

### Edge Cases

- What happens when the backend server is unreachable? The system displays a user-friendly error message "Service temporarily unavailable. Please try again later."
- How does the system handle invalid API URLs? Frontend uses environment variable VITE_API_URL with fallback to localhost for development
- What happens when Qdrant Cloud returns no search results? The chatbot responds with "I don't have enough information about that topic in the book content"
- How does the system handle expired authentication tokens? The system automatically redirects to login page with a message "Your session has expired. Please log in again."
- What happens when a guest user tries to access personalized features? The system shows a login prompt explaining the feature requires authentication
- How does the system handle malformed embedding requests? The embedding function includes error handling and returns an error response to the user

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow guest users to interact with the chatbot without authentication
- **FR-002**: System MUST provide AI-generated answers to guest users based on book content via RAG pipeline
- **FR-003**: System MUST display a subtle login suggestion banner to guest users without blocking chatbot access
- **FR-004**: System MUST NOT save chat history for guest users
- **FR-005**: System MUST provide user registration with email, password, and name collection
- **FR-006**: System MUST collect user background information during signup (software level, programming languages, hardware level, preferred language)
- **FR-007**: System MUST save user profile data to persistent storage (PostgreSQL database)
- **FR-008**: System MUST authenticate users and provide session management via Better-Auth
- **FR-009**: System MUST protect personalized features (content personalization, translation, chat history, selected text questions) behind authentication
- **FR-010**: System MUST save chat history for logged-in users and restore it on subsequent sessions
- **FR-011**: System MUST provide content personalization based on user profile (software level, languages, preferences)
- **FR-012**: System MUST provide Urdu translation for chapter content with proper RTL text display
- **FR-013**: System MUST allow logged-in users to select text and ask questions specifically about that text
- **FR-014**: System MUST establish proper CORS configuration to allow frontend-backend communication
- **FR-015**: System MUST use correct Qdrant Cloud connection (url= parameter, not host=)
- **FR-016**: System MUST dynamically detect vector dimension from embedding function (not hardcoded)
- **FR-017**: System MUST store embeddings with proper payload including text, book_id, chapter, and page fields
- **FR-018**: System MUST retrieve relevant content via Qdrant search with score > 0.4 for relevant queries
- **FR-019**: System MUST configure environment variables correctly for production deployment (Qdrant URL, API keys, database URL)
- **FR-020**: System MUST validate all database tables exist (users, user_profiles, chat_history) before operation

### Key Entities

- **User**: Represents a registered account holder with credentials (email, password hash) and profile information
- **User Profile**: Contains user's technical background (software level, programming languages, hardware level, preferred language) used for personalization
- **Chat Message**: A single message in a conversation between user and AI, includes message content, AI response, timestamp, and user association
- **Book Chapter**: A section of book content that can be personalized or translated, includes original text, chapter metadata
- **Embedding**: Vector representation of text chunks stored in Qdrant for semantic search, includes vector data and payload (text, book_id, chapter, page)

## Success Criteria

### Measurable Outcomes

- **SC-001**: Guest users can ask questions and receive AI answers within 3 seconds of submission
- **SC-002**: 100% of guest user chatbot interactions function without requiring authentication
- **SC-003**: New user signup flow completes successfully with profile data saved in under 30 seconds
- **SC-004**: Logged-in users can access all personalized features (personalization, translation, chat history, selected text) without errors
- **SC-005**: Chat history is restored for logged-in users with 100% accuracy across sessions
- **SC-006**: Qdrant Cloud connection succeeds with no connection errors in production environment
- **SC-007**: Embedding creation and retrieval pipeline returns relevant results (score > 0.4) for 90% of test queries
- **SC-008**: Frontend-backend API calls succeed with no CORS errors in production (GitHub Pages deployment)
- **SC-009**: All required environment variables are properly configured and validated before deployment
- **SC-010**: System handles 100 concurrent users without degradation in chatbot response time
