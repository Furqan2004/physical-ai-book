import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent))

from services.sync_service import sync_docs_to_qdrant

async def main():
    print("🚀 Triggering manual sync...")
    await sync_docs_to_qdrant()
    print("✅ Sync finished.")

if __name__ == "__main__":
    asyncio.run(main())
