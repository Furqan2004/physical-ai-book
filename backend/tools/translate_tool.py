from ai import function_tool
from openai import AsyncOpenAI
import os

llm_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:3000"),
        "X-OpenRouter-Title": os.getenv("SITE_NAME", "AI Book"),
    }
)


@function_tool
async def translate_to_urdu(chapter_content: str) -> str:
    """
    Translate chapter content to Urdu. Keeps code blocks and
    technical terms in English. Maintains markdown formatting.
    
    Args:
        chapter_content: Original markdown content to translate
        
    Returns:
        Translated Urdu string
    """
    prompt = f"""
Translate the following technical content to Urdu.

Rules:
- Code blocks must remain EXACTLY as they are (do not translate code)
- Technical terms (API, function, variable, class, etc.) should stay in English
- Translate headings and regular text to Urdu
- Maintain all markdown formatting (headings, lists, bold, italic, etc.)
- Use Urdu script (اردو) for translations

Chapter Content:
{chapter_content[:8000]}  # Limit to avoid token limits

Translate to Urdu following the rules above:
"""

    response = await llm_client.chat.completions.create(
        model="nvidia/nemotron-3-nano-30b-a3b:free",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content
