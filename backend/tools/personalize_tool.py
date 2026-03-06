from ai import function_tool
from services.db_service import get_user_background
from openai import OpenAI
import os
import asyncio

llm_client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:3000"),
        "X-OpenRouter-Title": os.getenv("SITE_NAME", "AI Book"),
    }
)


@function_tool
def personalize_content(chapter_content: str, user_id: str) -> str:
    """
    Personalize chapter content based on user background and experience.
    
    Args:
        chapter_content: Original markdown chapter content
        user_id: User ID to fetch their background profile
        
    Returns:
        Personalized content string
    """
    # Get user background
    background = asyncio.run(get_user_background(user_id))
    
    if not background:
        return "Error: User background not found. Please complete onboarding first."
    
    # Build prompt
    prompt = f"""
Rewrite this technical chapter content based on the user's background:

User Profile:
- Experience Level: {background['software_experience']}
- Known Languages: {', '.join(background['known_languages'])}
- Learning Style: {background['learning_style']}
- Hardware Background: {background['hardware_background'] or 'None'}

Instructions:
- If beginner: use simpler language, more explanations, step-by-step approach
- If intermediate: balance depth with clarity
- If advanced: include technical depth, advanced concepts
- Use code examples in {', '.join(background['known_languages'])} where applicable
- Match learning style: visual (descriptions), reading (detailed text), or hands-on (examples)

Chapter Content:
{chapter_content[:8000]}  # Limit to avoid token limits

Rewrite the content following the user's profile. Keep markdown formatting.
"""

    response = llm_client.chat.completions.create(
        model="nvidia/nemotron-3-nano-30b-a3b:free",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content
