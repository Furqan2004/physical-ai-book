#!/usr/bin/env python3
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from services.db_service import get_connection

async def main():
    pool = await get_connection()
    async with pool.acquire() as conn:
        count = await conn.fetchval("SELECT count(*) FROM chapters")
        print(f"📚 Total chapters in database: {count}")
        
        rows = await conn.fetch("SELECT slug, title FROM chapters LIMIT 5")
        print("\n📄 Sample chapters:")
        for row in rows:
            print(f"- {row['slug']} ({row['title']})")

if __name__ == "__main__":
    asyncio.run(main())
