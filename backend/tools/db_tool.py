from ai import function_tool
from services.db_service import save_chat_message, get_chat_history
import asyncio


@function_tool
def save_message(session_id: str, role: str, content: str) -> str:
    """
    Save a chat message to the database.
    
    Args:
        session_id: Chat session identifier
        role: 'user' or 'assistant'
        content: Message content
        
    Returns:
        'saved' if successful
    """
    try:
        asyncio.run(save_chat_message(session_id, role, content))
        return "saved"
    except Exception as e:
        return f"error: {str(e)}"


@function_tool
def load_chat_history(session_id: str) -> str:
    """
    Load previous chat history for conversation context.
    
    Args:
        session_id: Chat session identifier
        
    Returns:
        Formatted string with message history
    """
    try:
        messages = asyncio.run(get_chat_history(session_id))
        
        if not messages:
            return "No previous messages in this session."
        
        formatted = []
        for msg in messages:
            formatted.append(f"{msg['role']}: {msg['content']}")
        
        return "\n".join(formatted)
    except Exception as e:
        return f"error: {str(e)}"
