# Research: System Overhaul & Authentication Fixes

## Phase 0: Research & Discovery

### Decision: Better Auth Integration
- **Decision**: Integrate `better-auth` as the primary authentication provider for the Next.js frontend.
- **Rationale**: The existing auth system is reportedly broken. Better Auth offers a modern, type-safe integration that handles common flows (login, signup, session management) reliably.
- **Alternatives considered**: Auth.js, Clerk (rejected due to preference for self-hosted Neon DB integration).

### Decision: Docusaurus Route-Based Chatbot Scoping
- **Decision**: Use a path-based conditional check in a high-level component (e.g., `theme/Root.tsx`) to show/hide the chatbot.
- **Rationale**: Ensures the chatbot is only available on `/physical-ai-book/docs/*` routes, preventing UI clutter on non-docs pages.
- **Alternatives considered**: Adding the component to every single MDX file (too manual, violates DRY).

### Decision: Frontend Onboarding Logic
- **Decision**: Migrate the "Questions" logic from the Python backend to the Next.js frontend.
- **Rationale**: Improves user experience with immediate feedback and reduces backend state management during the onboarding flow.
- **Alternatives considered**: Keeping it in the backend (violates user request for better responsiveness).

### Decision: Neon PostgreSQL Consistency
- **Decision**: Maintain Neon PostgreSQL as the primary database for both application data (history) and auth data.
- **Rationale**: Keeps the architecture simple and avoids multi-DB synchronization issues.
- **Best Practices**: Ensure connection pooling and proper schema management for Neon serverless.

### Decision: Qdrant Cloud Integration
- **Decision**: Use Qdrant Cloud for vector storage and retrieval.
- **Rationale**: Provides a managed, scalable solution for RAG operations.
- **Best Practices**: Use official `qdrant-client` and follow the cloud quickstart for connection security and performance.
