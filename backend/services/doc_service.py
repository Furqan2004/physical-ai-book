import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from .db_service import get_chapter

load_dotenv()

async def get_doc_content(source_path: str) -> str:
    """
    Fetches the actual markdown content. 
    Prioritizes Neon PostgreSQL database retrieval.
    source_path: e.g. '@site/docs/part-1-foundations/intro.md'
    """
    try:
        # 1. Try Database Retrieval First (Optimized)
        # slug in DB matches source_path (e.g. @site/docs/...)
        print(f"DEBUG: [SOURCE: DB] Fetching slug: {source_path}")
        chapter = await get_chapter(source_path)
        if chapter and chapter.get('content'):
            print(f"SUCCESS: [SOURCE: DB] Retrieved chapter: {source_path}")
            return chapter['content']
        
        # 2. Local Fallback (if DB misses)
        print(f"WARNING: [SOURCE: DB] Miss for {source_path}. Falling back to LOCAL FS.")
        docs_base = Path(__file__).parent.parent.parent / 'frontend' / 'docs'
        clean_path = source_path.replace('@site/docs/', '').replace('@site/', '')
        file_path = docs_base / clean_path
        
        if file_path.exists():
            print(f"SUCCESS: [SOURCE: LOCAL FS] Retrieved: {file_path}")
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                return content
        
        print(f"ERROR: [SOURCE: NONE] Document source not found in DB or Local FS (Source: {source_path})")
        return f"Error: Document source not found in DB or Local FS (Source: {source_path})"
                
    except Exception as e:
        print(f"ERROR: Fetching doc failed: {e}")
        return f"Error reading document: {str(e)}"
