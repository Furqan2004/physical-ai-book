from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from agents import Runner
from ai.orchestrator_agent import orchestrator_agent
from routers.deps import get_authenticated_user
from services.doc_service import get_doc_content

router = APIRouter(prefix="/api", tags=["Translation"])

class TranslateRequest(BaseModel):
    chapter_content: str
    chapter_id: str

@router.post("/translate")
async def translate(
    request: TranslateRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    content = request.chapter_content
    if content.startswith('@site/docs') or content.endswith('.md'):
        content = get_doc_content(content)

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
    return {
        "translated_content": result.final_output,
        "chapter_id": request.chapter_id
    }
