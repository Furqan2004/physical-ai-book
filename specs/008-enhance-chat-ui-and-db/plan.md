# Implementation Plan: Enhanced Chatbot UI & Database Chapter Storage

**Feature Branch**: `008-enhance-chat-ui-and-db`  
**Created**: 2025-03-10  
**Status**: Draft  
**Input**: User description: "sab sa pahla hamari jo frontend ki logic ha jo hama ya kahti ha ask about this wo directly AI ko prompt send kar dati ha isko set karo ka wo direct send na kara balka AI chatbot open ho or uska promt bar ma hamara contect aa jai taka user usma kuch addition means kuch questions bhi dal kar 1 bar hi AI sa poch la.also chatbox newline abhi support nahi kar raha wo bhi add karo or iska ilawa ya bhi add karo ka prompt box according to the user prompt thora increase ho jay jasa normal chatbots ma hota ha. iska ilawa jitna bhi chapters avaliable hai abhi hamara pass unko neon postgresql ma save karwa do or jab bhi user personalize ya translate karwai to content web sa fatch nahi ho directly db sa pick ho jay. or baki personalize or translate ki logic same raha gi like existing fresh and etc things."

## Technical Context

### Existing State
- **Frontend**: "Ask about this" triggers the chatbot. Pre-fill logic is present but might have auto-send or formatting issues. Chat messages don't render newlines properly. Textarea auto-resize is limited to 150px.
- **Backend**: `doc_service.py` fetches from DB first but has `crawl4ai` as a fallback. Sync is automatic on startup but may be incomplete.
- **Database**: PostgreSQL `chapters` table exists but may not be fully populated.

### Proposed Changes
- **Frontend**:
    - Update `ChatWindow.tsx`: Add `white-space: pre-wrap`, improve `adjustHeight` (250px max), and ensure Enter key logic is clean.
    - Update `PersonalizeButton.tsx` and `TranslateButton.tsx`: Add local `error` state and display "Please try again" on failure.
- **Backend**:
    - Create `backend/scripts/sync_chapters_to_db.py` for manual/explicit sync of all book content.
    - Update `doc_service.py`: Remove `crawl4ai` fallback and prioritize DB only (with local fallback).
    - Ensure all book chapters are stored in DB.

## Constitution Check

| Principle | Adherence Plan |
|-----------|----------------|
| RULE 1: Apni Taraf Se Kuch Nahi | No new content or facts will be added. Only existing book content is being stored. |
| RULE 2: Source-Verified-Researcher Mandatory | The core book content is already verified. No new research is needed for this feature. |
| RULE 3: Docusaurus Template First | Changes follow Docusaurus/React conventions. |
| RULE 4: Code Structured | Files will be kept in `backend/scripts/`, `backend/services/`, and `frontend/src/components/`. |
| RULE 5: Ek Kaam Ek Waqt Mein | Plan follows a phased approach: Frontend UI, then Backend Storage, then Error Handling. |
| RULE 8: Build Hamesha Pass | `npm run build` and `npm run typecheck` will be run after frontend changes. |

## Implementation Phases

### Phase 1: Frontend - Chat UI & "Ask about this"
- **Goal**: Professionalize the chatbot UI and fix the contextual inquiry flow.
- **Tasks**:
    - Update `ChatWindow.tsx`:
        - Set `white-space: pre-wrap` for message content.
        - Increase `maxHeight` for textarea to 250px.
        - Refine Enter key logic.
    - Verify "Ask about this" pre-fill format.
    - Test that no message is auto-sent.

### Phase 2: Backend - Storage & Retrieval
- **Goal**: Migrate all chapter content to PostgreSQL and optimize retrieval.
- **Tasks**:
    - Create `backend/scripts/sync_chapters_to_db.py`:
        - Walk through `frontend/docs/`.
        - Extract slugs and titles.
        - Save to `chapters` table in Neon PostgreSQL.
    - Run the sync script.
    - Update `backend/services/doc_service.py`:
        - Remove `crawl4ai` logic.
        - Log DB fetch success/failure clearly.
    - Verify `personalize.py` and `translate.py` use DB content.

### Phase 3: Error Handling & UX
- **Goal**: Improve user feedback for personalization and translation failures.
- **Tasks**:
    - Update `PersonalizeButton.tsx`:
        - Add `error` state.
        - Display "Please try again" on the page if API fails.
    - Update `TranslateButton.tsx`:
        - Add `error` state.
        - Display "Please try again" on the page if API fails.
    - Final verification of the entire flow.
