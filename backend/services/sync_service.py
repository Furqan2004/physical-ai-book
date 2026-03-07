import os
import hashlib
from pathlib import Path
from qdrant_client.models import PointStruct, Filter, FieldCondition, MatchValue
import uuid

from .openrouter_service import get_embedding
from .qdrant_service import get_qdrant_client, COLLECTION_NAME, upsert_points, create_collection_if_not_exists, delete_points_by_file

DOCS_DIR = Path(__file__).parent.parent.parent / 'frontend' / 'docs'

def get_file_hash(content: str) -> str:
    """Generate MD5 hash of content to detect changes"""
    return hashlib.md5(content.encode('utf-8')).hexdigest()

async def sync_docs_to_qdrant():
    """
    Scans documentation files and ensures they are embedded in Qdrant.
    Only updates files that have changed or are missing.
    """
    print("🔄 Starting Documentation Sync to Qdrant...")
    
    # 1. Ensure collection exists
    create_collection_if_not_exists()
    client = get_qdrant_client()
    
    # 2. Iterate through all .md files in docs directory
    for doc_path in DOCS_DIR.rglob('*.md'):
        # Skip intro.md if it's just a placeholder in the root
        if doc_path.name == 'intro.md' and doc_path.parent == DOCS_DIR:
            continue
            
        source_file = str(doc_path.relative_to(DOCS_DIR))
        print(f"📄 Checking {source_file}...")
        
        try:
            with open(doc_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ Error reading {doc_path}: {e}")
            continue
            
        file_hash = get_file_hash(content)
        
        # 3. Check if this file already exists in Qdrant with the same hash
        try:
            scroll_result = client.scroll(
                collection_name=COLLECTION_NAME,
                scroll_filter=Filter(
                    must=[
                        FieldCondition(key="source_file", match=MatchValue(value=source_file)),
                        FieldCondition(key="file_hash", match=MatchValue(value=file_hash))
                    ]
                ),
                limit=1
            )
            existing_points = scroll_result[0]
        except Exception as e:
            print(f"⚠️ Error checking scroll for {source_file}: {e}")
            existing_points = []
        
        if existing_points:
            print(f"✅ {source_file} is up to date.")
            continue
            
        print(f"⚡ Updating {source_file} in Qdrant...")
        
        # 4. Remove old points for this file
        try:
            delete_points_by_file(source_file)
        except Exception as e:
            print(f"⚠️ Error deleting old points for {source_file}: {e}")
        
        # 5. Chunk and Embed
        chunks = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        points = []
        for i, chunk in enumerate(chunks):
            if len(chunk) < 50: continue # Skip very small chunks
            
            try:
                vector = await get_embedding(chunk)
                if not vector:
                    print(f"⚠️ Skipping chunk {i} of {source_file}: No embedding received")
                    continue
                    
                point_id = str(uuid.uuid4())
                
                points.append(PointStruct(
                    id=point_id,
                    vector=vector,
                    payload={
                        "content": chunk,
                        "source_file": source_file,
                        "file_hash": file_hash,
                        "chunk_index": i,
                        "chapter_name": doc_path.parent.name,
                        "heading": chunk.split('\n')[0][:100]
                    }
                ))
                
                # Upsert in batches of 10
                if len(points) >= 10:
                    upsert_points(points)
                    points = []
            except Exception as e:
                print(f"❌ Error embedding chunk {i} of {source_file}: {e}")
        
        if points:
            try:
                upsert_points(points)
            except Exception as e:
                print(f"❌ Error upserting final points for {source_file}: {e}")
            
    print("🎉 Documentation Sync Complete!")
