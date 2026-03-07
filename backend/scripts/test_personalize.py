import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from services.doc_service import get_doc_content
from services.db_service import get_user_personalization, save_user_personalization, get_translation, save_translation
import os
from dotenv import load_dotenv

load_dotenv()

async def test_logic():
    print("--- Testing Remote Doc Fetching Logic ---")
    source_path = "@site/docs/intro.md"
    content = await get_doc_content(source_path)
    print(f"Fetch Result (first 100 chars): {content[:100]}...")
    
    print("\n--- Testing DB Caching Logic ---")
    # Use real user ID (from list_users.py)
    user_id = "dc8df474-a31e-4d4a-b928-7aaecbdf2142" # Furqan
    chapter_id = "intro"
    
    # Clean up previous tests
    from services.db_service import get_connection
    pool = await get_connection()
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM user_personalization WHERE user_id = $1 AND chapter_id = $2", user_id, chapter_id)
        await conn.execute("DELETE FROM translations WHERE chapter_id = $1", chapter_id)

    # Test Personalization Cache
    cached = await get_user_personalization(user_id, chapter_id)
    print(f"Initial personalization cache (should be None): {cached}")
    
    test_content = "This is personalized content."
    await save_user_personalization(user_id, chapter_id, test_content)
    print("Saved personalization content.")
    
    cached = await get_user_personalization(user_id, chapter_id)
    print(f"Retrieved personalization cache: {cached}")
    
    # Test Translation Cache
    cached_trans = await get_translation(chapter_id)
    print(f"Initial translation cache (should be None): {cached_trans}")
    
    test_trans = "Yeh translated content hai."
    await save_translation(chapter_id, test_trans)
    print("Saved translation content.")
    
    cached_trans = await get_translation(chapter_id)
    print(f"Retrieved translation cache: {cached_trans}")

if __name__ == "__main__":
    asyncio.run(test_logic())
