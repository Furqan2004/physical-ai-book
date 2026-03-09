# Research Report: Fix Ask Functionality and AI Prompt Responses

## Decisions & Rationale

### 1. Frontend "Ask about this" Positioning Bug
- **Decision**: Remove `window.scrollY` and `window.scrollX` from the `top` and `left` calculations in `TextSelectionPopup.tsx`.
- **Rationale**: The component uses `position: 'fixed'`, which positions the element relative to the viewport. `range.getBoundingClientRect()` already returns coordinates relative to the viewport. Adding `window.scrollY` causes the popup to be incorrectly offset downwards when the page is scrolled, which matches the user's report that it only works at the start of the page.
- **Alternatives considered**: Using `position: 'absolute'`. This would require keeping the scroll offsets, but `fixed` is generally more reliable for floating UI elements like this to avoid clipping issues with parent containers.

### 2. AI Prompt Professionalization
- **Decision**: 
    - Rewrite `ChatAgent` instructions to allow answering greetings and general "Physical AI/Humanoid Robotics" questions even without book context.
    - Update `Personalization` and `Translation` prompts to use more professional and clear language (Urdu/Roman Urdu as requested).
    - Ensure all prompts explicitly define a high-level "Expert Technical Mentor" persona.
- **Rationale**: The user wants the AI to be more helpful and less restrictive, specifically for greetings and domain-specific knowledge.
- **Alternatives considered**: Keeping the strict boundary. Rejected because it degrades user experience for simple interactions like "Hi".

### 3. Frontend Cleanup
- **Decision**: 
    - Remove `frontend/src/pages/signin.tsx` (redundant with `login.tsx`).
    - Remove `frontend/src/pages/onboarding.tsx` and `frontend/src/components/OnboardingForm.tsx` as `signup.tsx` now handles the multi-step flow including background questions.
- **Rationale**: Reducing duplication improves maintainability and ensures a single source of truth for auth flows.
- **Alternatives considered**: Keeping them for legacy support. Rejected as they are clearly redundant.

### 4. Backend Cleanup & Git Configuration
- **Decision**:
    - Remove any clearly obsolete scripts (none found that were obviously useless, most are validation tools).
    - Create `backend/.gitignore` for separate deployment capability.
    - Update root `.gitignore` to be structured and clean.
- **Rationale**: Requested for repository hygiene and deployment flexibility (GitHub vs Hugging Face).

## Technical Context Findings
- **Frameworks**: Docusaurus v3.9 (Frontend), FastAPI (Backend).
- **AI Integration**: OpenRouter via `openai-agents` SDK.
- **Database**: Postgres (Neon) and Qdrant (Vector).
- **Environment**: Root managed by Git, with sub-projects for Frontend and Backend.
