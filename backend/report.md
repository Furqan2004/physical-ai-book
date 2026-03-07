# Optimization Report: Personalization and Translation Endpoints

## Overview

This optimization focused on reducing AI token costs and improving response times by implementing a database caching layer and transitioning to remote content fetching.

## Changes Summary

### 1. Database Schema
- **File**: `backend/scripts/create_tables.sql`, `backend/scripts/setup_db.py`
- **Changes**: Added `user_personalization` and `translations` tables with appropriate indexes for fast lookups.
- **Impact**: Enables persistent caching of AI-generated content.

### 2. Database Service
- **File**: `backend/services/db_service.py`
- **Changes**: 
    - Added `get_user_personalization` and `save_user_personalization` (per-user cache).
    - Added `get_translation` and `save_translation` (global cache for Urdu).
- **Impact**: Provides a clean interface for cache management.

### 3. Document Service
- **File**: `backend/services/doc_service.py`
- **Changes**: 
    - Converted `get_doc_content` to an `async` function.
    - Implemented remote fetching using **crawl4ai** (`AsyncWebCrawler`).
    - Added smart URL mapping to include `baseUrl` (e.g., `/physical-ai-book/`).
    - **Markdown Extraction**: Using crawl4ai to directly extract clean Markdown from the rendered frontend pages.
    - **Robustness**: Maintains a fallback to local `frontend/docs/` if remote fetch fails.
- **Impact**: Ensures high-quality Markdown source is always available for AI processing.

### 4. Personalization Router
- **File**: `backend/routers/personalize.py`
- **Changes**: 
    - Integrated DB cache check.
    - Added `mode` field to request: `"existing"` (default) uses cache, `"fresh"` bypasses cache to generate new content.
    - Saves newly generated content to the database.

### 5. Translation Router
- **File**: `backend/routers/translate.py`
- **Changes**: 
    - Integrated global DB cache check.
    - Added `mode` field to request: `"existing"` (default) uses cache, `"fresh"` bypasses cache to generate new content.
    - Saves newly generated translations to the database.

## Conclusion

The system is now more efficient, scalable, and cost-effective. AI token consumption is eliminated for repeat requests, and the backend is correctly fetching source content from the frontend deployment.
