from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenRouter client for embeddings
embeddings_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)


def get_embedding(text: str) -> list[float]:
    """
    Generate embedding vector for text using OpenRouter.
    
    Args:
        text: The text to embed
        
    Returns:
        List of floats representing the embedding vector
    """
    response = embeddings_client.embeddings.create(
        extra_headers={
            "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:3000"),
            "X-OpenRouter-Title": os.getenv("SITE_NAME", "AI Book"),
        },
        model="nvidia/llama-nemotron-embed-vl-1b-v2:free",
        input=[{"content": [{"type": "text", "text": text}]}],
        encoding_format="float"
    )
    return response.data[0].embedding
