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
    try:
        content = request.chapter_content
        if content.startswith('@site/docs') or content.endswith('.md'):
            content = await get_doc_content(content)
        
        if content.startswith("Error:"):
            raise HTTPException(status_code=404, detail=content)

        # POWERFUL PROMPT - DIRECT URDU
        input_text = f"""
# ROLE
You are an EXPERT TECHNICAL TRANSLATOR specializing in Physical AI and Robotics. Your goal is to provide a pure, professional Urdu script translation of technical documentation.

# TASK
Translate the following book chapter into professional PURE URDU (Urdu script / اردو).

# CHAPTER CONTENT
{content}

# CRITICAL RULES
1. LANGUAGE: Use professional, high-quality URDU SCRIPT (اردو). The language should be clear, scholarly, and easy to read.
2. TECHNICAL TERMS: DO NOT translate technical terms or acronyms (e.g., ROS2, Nodes, Topics, Kinematics, Python, API, SDK, Hardware). Keep them in their original English form within the Urdu text.
3. CODE BLOCKS: Do not modify or translate code blocks. Keep all code exactly as it appears in the source.
4. MARKDOWN: Maintain all markdown formatting (Headings, Tables, Lists, Bold, Italic) perfectly.
5. COMPLETENESS: Return the COMPLETE translated chapter. Do not summarize, skip, or omit any section.
6. FORMAT: Return ONLY the raw markdown content.
"""

        result = await Runner.run(orchestrator_agent, input=input_text)
        
        # 3. Save to DB before returning (Global)
        translated_content = result.final_output
        if not translated_content:
            raise Exception("AI Agent returned empty content")
            
        await save_translation(request.chapter_id, translated_content, language='ur')
        
        return {
            "translated_content": translated_content,
            "chapter_id": request.chapter_id,
            "cached": False
        }
    except Exception as e:
        print(f"ERROR in translation: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Translation failed. Please try again."
        )
