#!/usr/bin/env python3
"""
Qdrant Validation Script
Run: python -m backend.scripts.validate_qdrant
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.qdrant_service import get_qdrant_client, COLLECTION_NAME
from services.openrouter_service import get_embedding

def validate_qdrant():
    print("=== Qdrant Validation Start ===\n")

    # Step 1: Connection test
    print("1. Connection test...")
    try:
        client = get_qdrant_client()
        collections = client.get_collections()
        print(f"   ✅ Connected — {len(collections.collections)} collections")
    except Exception as e:
        print(f"   ❌ Connection FAIL: {e}")
        print("   → Check QDRANT_URL and QDRANT_API_KEY in .env")
        return False

    # Step 2: Embedding test
    print("\n2. Embedding test...")
    try:
        test_vec = get_embedding("Python programming kya hai?")
        dim = len(test_vec)
        print(f"   ✅ Embedding working — dimension: {dim}")
    except Exception as e:
        print(f"   ❌ Embedding FAIL: {e}")
        print("   → Check OPENROUTER_API_KEY")
        return False

    # Step 3: Collection check
    print("\n3. Collection check...")
    try:
        exists = client.collection_exists(COLLECTION_NAME)
        # Get actual embedding dimension
        from services.qdrant_service import get_vector_dimension
        actual_dim = get_vector_dimension()
        
        if exists:
            info = client.get_collection(COLLECTION_NAME)
            stored_dim = info.config.params.vectors.size
            print(f"   ✅ Collection '{COLLECTION_NAME}' exists")
            print(f"   Vector size: {stored_dim} (embedding dim: {actual_dim})")
            if stored_dim != actual_dim:
                print(f"   ⚠️  WARNING: Size mismatch!")
                print(f"   → Collection needs recreation with correct dimension")
            else:
                print(f"   ✅ Dimensions match!")
        else:
            print(f"   ⚠️  Collection '{COLLECTION_NAME}' does not exist")
            print(f"   → Run: python -m backend.scripts.create_qdrant_collection")
    except Exception as e:
        print(f"   ❌ Collection check FAIL: {e}")

    # Step 4: Point count
    print("\n4. Data check...")
    try:
        count = client.count(COLLECTION_NAME)
        print(f"   Total points stored: {count.count}")
        if count.count == 0:
            print("   ⚠️  No data indexed yet — run book indexing")
        else:
            print("   ✅ Data present")
    except Exception as e:
        print(f"   ❌ Count error: {e}")

    # Step 5: Search test
    print("\n5. Search test...")
    try:
        from services.qdrant_service import search_similar
        results = search_similar("Python kya hai?", top_k=3)
        if results:
            print(f"   ✅ Search working — {len(results)} results")
            print(f"   Best score: {results[0]['score']:.3f}")
            print(f"   Sample: {results[0]['content'][:100]}...")
        else:
            print("   ⚠️  No results found — index more content")
    except Exception as e:
        print(f"   ❌ Search FAIL: {e}")

    print("\n=== Validation Complete ===")
    return True

if __name__ == "__main__":
    success = validate_qdrant()
    sys.exit(0 if success else 1)
