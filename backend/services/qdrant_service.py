from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, Filter, FieldCondition, MatchValue, PayloadSchemaType
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

COLLECTION_NAME = "book_content"
VECTOR_SIZE = 1024  # Matches nvidia/llama-nemotron-embed-vl-1b-v2

def get_qdrant_client() -> QdrantClient:
    """Initialize Qdrant client with cloud credentials."""
    return QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )

def create_collection_if_not_exists() -> None:
    """Create collection with proper vector dimension and payload indexes."""
    client = get_qdrant_client()

    if not client.collection_exists(COLLECTION_NAME):
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=VECTOR_SIZE,
                distance=Distance.COSINE
            ),
        )
        print(f"✅ Collection '{COLLECTION_NAME}' created.")
    
    # Ensure payload indexes exist (can be called safely even if they already exist)
    try:
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="source_file",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="file_hash",
            field_schema=PayloadSchemaType.KEYWORD,
        )
        print(f"✅ Payload indexes verified for '{COLLECTION_NAME}'.")
    except Exception as e:
        print(f"⚠️ Warning verifying payload indexes: {e}")

def upsert_points(points: List[PointStruct]) -> None:
    """Insert or update points in the collection."""
    client = get_qdrant_client()
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points,
    )
    print(f"✅ Upserted {len(points)} points into '{COLLECTION_NAME}'.")

def delete_points_by_file(source_file: str) -> None:
    """Delete all points associated with a specific source file."""
    client = get_qdrant_client()
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="source_file",
                    match=MatchValue(value=source_file)
                )
            ]
        )
    )

def search_similar(query_vector: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
    """Search for similar chunks using query_points (recommended method)."""
    client = get_qdrant_client()

    # Query using the current recommended method
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=top_k,
        with_payload=True,
    ).points

    formatted_results = []
    for point in results:
        formatted_results.append({
            "content":      point.payload.get("content", ""),
            "chapter_name": point.payload.get("chapter_name", ""),
            "heading":      point.payload.get("heading", ""),
            "source_file":  point.payload.get("source_file", ""),
            "chunk_index":  point.payload.get("chunk_index", 0),
            "score":        point.score,
        })

    return formatted_results
