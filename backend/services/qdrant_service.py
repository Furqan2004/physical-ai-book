from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

COLLECTION_NAME = "book_content"

# Dynamic vector dimension detection (FR-016)
def get_vector_dimension() -> int:
    """Get embedding dimension dynamically from actual embedding function"""
    from services.openrouter_service import get_embedding
    test_embedding = get_embedding("test")
    return len(test_embedding)


def get_qdrant_client() -> QdrantClient:
    """Get Qdrant client instance"""
    return QdrantClient(
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
    )


def create_collection_if_not_exists() -> None:
    """Create Qdrant collection if it doesn't exist with dynamic dimension"""
    client = get_qdrant_client()
    
    # Get actual embedding dimension
    vector_size = get_vector_dimension()

    if not client.collection_exists(COLLECTION_NAME):
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
        )
        print(f"Collection '{COLLECTION_NAME}' created with dimension={vector_size}!")
    else:
        # Verify dimension matches
        info = client.get_collection(COLLECTION_NAME)
        stored_dim = info.config.params.vectors.size
        if stored_dim != vector_size:
            print(f"⚠️  WARNING: Collection dimension mismatch!")
            print(f"   Stored: {stored_dim}, Current embedding: {vector_size}")
            print(f"   → Collection needs recreation")
        else:
            print(f"Collection '{COLLECTION_NAME}' already exists (dim={vector_size}).")


def upsert_vectors(ids: List[str], vectors: List[List[float]], payloads: List[dict]) -> bool:
    """
    Upsert vectors into Qdrant collection.
    
    Args:
        ids: List of vector IDs
        vectors: List of embedding vectors
        payloads: List of metadata payloads
        
    Returns:
        True if successful, False otherwise
    """
    client = get_qdrant_client()
    
    points = []
    for id, vector, payload in zip(ids, vectors, payloads):
        point = PointStruct(
            id=id,
            vector=vector,
            payload=payload
        )
        points.append(point)
    
    response = client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    
    return response.status == "completed"


def search_similar(query_vector: List[float], top_k: int = 5) -> List[dict]:
    """
    Search for similar vectors in the collection.
    
    Args:
        query_vector: The query embedding vector
        top_k: Number of results to return
        
    Returns:
        List of dicts with content, chapter_name, heading, and score
    """
    client = get_qdrant_client()
    
    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=top_k
    )
    
    formatted_results = []
    for result in results:
        formatted_results.append({
            "content": result.payload.get("content", ""),
            "chapter_name": result.payload.get("chapter_name", ""),
            "heading": result.payload.get("heading", ""),
            "source_file": result.payload.get("source_file", ""),
            "chunk_index": result.payload.get("chunk_index", 0),
            "score": result.score
        })
    
    return formatted_results
