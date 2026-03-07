from qdrant_client import QdrantClient
import os
from dotenv import load_dotenv

load_dotenv()

def verify_qdrant():
    url = os.getenv("QDRANT_URL")
    api_key = os.getenv("QDRANT_API_KEY")
    
    print(f"Connecting to Qdrant at: {url}")
    client = QdrantClient(
        url=url,
        api_key=api_key,
    )
    
    try:
        collections = client.get_collections()
        print(f"✅ Successfully connected to Qdrant!")
        print(f"Collections: {collections}")
    except Exception as e:
        print(f"❌ Failed to connect to Qdrant: {e}")

if __name__ == "__main__":
    verify_qdrant()
