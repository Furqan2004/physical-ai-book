#!/usr/bin/env python3
"""
Script to create Qdrant collection.
Run this after setting up .env file with QDRANT_URL and QDRANT_API_KEY.

Usage:
    cd backend
    python scripts/create_qdrant_collection.py
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from services.qdrant_service import create_collection_if_not_exists
from dotenv import load_dotenv

load_dotenv()

if __name__ == "__main__":
    print("Creating Qdrant collection...")
    create_collection_if_not_exists()
    print("Done!")
