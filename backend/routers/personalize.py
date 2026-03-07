from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from agents import Runner
from ai.orchestrator_agent import orchestrator_agent
from routers.deps import get_authenticated_user
from services.doc_service import get_doc_content
from services.db_service import get_user_background

router = APIRouter(prefix="/api", tags=["Personalization"])

class PersonalizeRequest(BaseModel):
    chapter_content: str
    chapter_id: str

@router.post("/personalize")
async def personalize(
    request: PersonalizeRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    content = request.chapter_content
    if content.startswith('@site/docs') or content.endswith('.md'):
        content = get_doc_content(content)

    background = await get_user_background(current_user["id"])
    bg_info = f"""
    - Software Level: {background['software_experience']}
    - Hardware Background: {background['hardware_background']}
    - Languages: {', '.join(background['known_languages'])}
    - Style: {background['learning_style']}
    """ if background else "Standard Profile"

    # POWERFUL PROMPT - ROMAN URDU
    input_text = f"""
ACT AS AN EXPERT TECHNICAL TEACHER.
REWRITE THE FOLLOWING CHAPTER IN 'ROMAN URDU' (Urdu written in English alphabets).

USER BACKGROUND:
{bg_info}

CHAPTER CONTENT:
{content}

RULES:
1. USE ROMAN URDU ONLY (e.g., "Aapka swagat hai" instead of "آپ کا استقبال ہے").
2. KEEP ALL TECHNICAL TERMS IN ENGLISH (e.g., ROS2, Nodes, Python, C++).
3. KEEP ALL CODE BLOCKS EXACTLY AS THEY ARE.
4. MAINTAIN ALL MARKDOWN FORMATTING (Headings, Tables, Lists).
5. MAKE IT EASY TO UNDERSTAND ACCORDING TO THE USER'S BACKGROUND.
6. RETURN THE FULL TRANSFORMED CHAPTER. DO NOT MISS ANY SECTION.
"""

    result = await Runner.run(orchestrator_agent, input=input_text)
    return {
        "personalized_content": result.final_output,
        "chapter_id": request.chapter_id
    }
