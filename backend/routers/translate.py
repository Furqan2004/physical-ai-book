from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from agents import Runner
from ai.orchestrator_agent import orchestrator_agent
from routers.deps import get_authenticated_user
from services.doc_service import get_doc_content
from services.db_service import get_translation, save_translation

router = APIRouter(prefix="/api", tags=["Translation"])

class TranslateRequest(BaseModel):
    chapter_content: str
    chapter_id: str
    mode: str = "existing" # "existing" or "fresh"

@router.post("/translate")
async def translate(
    request: TranslateRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    # 1. Check Global DB Cache First (Only if mode is "existing")
    if request.mode == "existing":
        cached_content = await get_translation(request.chapter_id, language='ur')
        if cached_content:
            return {
                "translated_content": cached_content,
                "chapter_id": request.chapter_id,
                "cached": True
            }

    # 2. Get Source Content (Either mode is fresh or cache missed)
    content = request.chapter_content
    if content.startswith('@site/docs') or content.endswith('.md'):
        content = await get_doc_content(content)

    # POWERFUL PROMPT - DIRECT URDU
    input_text = f"""
ACT AS AN EXPERT TECHNICAL TRANSLATOR.
TRANSLATE THE FOLLOWING CHAPTER INTO PURE URDU (Urdu script).

CHAPTER CONTENT:
{content}

RULES:
1. USE CLEAR AND PROFESSIONAL URDU SCRIPT (اردو).
2. DO NOT TRANSLATE CODE BLOCKS. KEEP THEM AS IS.
3. DO NOT TRANSLATE TECHNICAL TERMS (e.g., API, Function, Database, Node, ROS2).
4. MAINTAIN ALL MARKDOWN FORMATTING (Headings, Tables, Lists).
5. RETURN THE COMPLETE TRANSLATED CHAPTER. DO NOT SUMMARIZE OR OMIT ANY PART.
"""

    result = await Runner.run(orchestrator_agent, input=input_text)
    
    # 3. Save to DB before returning (Global)
    translated_content = result.final_output
    await save_translation(request.chapter_id, translated_content, language='ur')
    
    return {
        "translated_content": translated_content,
        "chapter_id": request.chapter_id,
        "cached": False
    }
