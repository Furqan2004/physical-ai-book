import os
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

# Initialize the Gemini Client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# Initialize the Gemini Client
# Note: Ensure GOOGLE_API_KEY is set in your environment
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

async def get_embedding(text: str) -> list[float]:
    if not text.strip():
        # Matching your requested dimension for empty inputs
        return [0.0] * 1024  

    try:
        response = await client.aio.models.embed_content(
            model="gemini-embedding-001", 
            contents=text,
            config=types.EmbedContentConfig(
                task_type="RETRIEVAL_DOCUMENT",
                # This explicitly forces the model to output a 1024-length vector
                output_dimensionality=1024
            )
        )
        
        if response and response.embeddings:
            return response.embeddings[0].values
        return None
            
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return None

def get_vector_dimension() -> int:
    """Explicitly returns 1024 to match your requirement"""
    return 1024