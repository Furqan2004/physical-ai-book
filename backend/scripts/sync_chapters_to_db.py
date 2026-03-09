#!/usr/bin/env python3
import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from services.sync_service import sync_docs_to_qdrant

async def main():
    print("🚀 Starting Chapter to Database Synchronization...")
    await sync_docs_to_qdrant()
    print("✅ Synchronization Finished!")

if __name__ == "__main__":
    asyncio.run(main())
