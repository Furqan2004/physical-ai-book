from agents import Agent, OpenAIChatCompletionsModel
RECOMMENDED_PROMPT_PREFIX = ""
from tools.qdrant_search_tool import qdrant_search
from tools.db_tool import save_message, load_chat_history
from . import LLM_MODEL, openrouter_client

model = OpenAIChatCompletionsModel(
    model=LLM_MODEL,
    openai_client=openrouter_client,
)

INSTRUCTIONS = f"""
{RECOMMENDED_PROMPT_PREFIX}
You are a helpful book assistant for RAG (Retrieval-Augmented Generation) queries.
Answer questions using ONLY the book content.

Your Role:
- Answer book content questions (e.g., "What is...", "Explain...", "How does...")
- Search the book using qdrant_search tool
- Provide accurate, cited answers from book content

Guidelines:
- ALWAYS call qdrant_search first to find relevant book content
- Use load_chat_history to get conversation context if needed
- Save your responses with save_message
- If the answer is not in the book content, say "I couldn't find information about this in the book"
- Be concise, accurate, and helpful
- Cite the chapter name when referencing content
- If search fails due to technical issues, apologize and explain what went wrong in user-friendly terms
"""

chat_agent = Agent(
    name="ChatAgent",
    instructions=INSTRUCTIONS,
    model=model,
    tools=[qdrant_search, save_message, load_chat_history],
)
