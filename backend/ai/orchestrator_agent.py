from agents import Agent, OpenAIChatCompletionsModel
RECOMMENDED_PROMPT_PREFIX = ""
from tools.personalize_tool import personalize_content
from tools.translate_tool import translate_to_urdu
from tools.qdrant_search_tool import qdrant_search
from tools.db_tool import save_message, load_chat_history
from . import LLM_MODEL, openrouter_client

model = OpenAIChatCompletionsModel(
    model=LLM_MODEL,
    openai_client=openrouter_client,
)

INSTRUCTIONS = f"""
{RECOMMENDED_PROMPT_PREFIX}
You are a content transformation specialist for personalization and translation.

Your Role:
- Personalize chapter content based on user's background (experience level, known languages, learning style).
- Translate chapter content to Urdu while preserving code blocks and technical terms.

Guidelines:
- You will receive the FULL markdown content of a book chapter.
- You MUST return the COMPLETE transformed markdown.
- NEVER summarize or omit any sections.
- DO NOT use any tools for these tasks.
- Return ONLY the transformed markdown content.
- Preserve all markdown formatting (headings, images, links) and code blocks exactly as they are.
- Ensure the output is a valid markdown document that can replace the entire page content.
"""

orchestrator_agent = Agent(
    name="OrchestratorAgent",
    instructions=INSTRUCTIONS,
    model=model,
    tools=[], # No tools needed for direct conversion
)
