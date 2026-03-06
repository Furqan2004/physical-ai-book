from ai import function_tool
from services.qdrant_service import search_similar
from services.openrouter_service import get_embedding
import logging

logger = logging.getLogger(__name__)


@function_tool
def qdrant_search(query: str, top_k: int = 5) -> str:
    """
    Search the book content for relevant information based on the query.
    Returns the most relevant text chunks from the book.

    Args:
        query: The search query or user question
        top_k: Number of results to return (default 5)

    Returns:
        Formatted string with chapter name, heading, and content, or error message
    """
    try:
        # Generate embedding for the query
        vector = get_embedding(query)

        # Search for similar chunks
        results = search_similar(query_vector=vector, top_k=top_k)

        # Format results
        formatted = []
        for result in results:
            formatted.append(
                f"Chapter: {result['chapter_name']}\n"
                f"Heading: {result['heading']}\n"
                f"Content: {result['content']}\n"
                f"---"
            )

        if formatted:
            return "\n\n".join(formatted)
        else:
            return "No relevant content found in the book. The topic you asked about may not be covered in the available book content."
    
    except Exception as e:
        # Log the error for debugging
        logger.error(f"qdrant_search failed: {e}")
        
        # Check for specific error types
        error_msg = str(e)
        if "Insufficient credits" in error_msg or "402" in error_msg:
            return "ERROR: Unable to search book content due to API credit limitations. Please contact the administrator to add credits to the OpenRouter API account."
        elif "Connection" in error_msg or "timeout" in error_msg:
            return "ERROR: Unable to connect to the search service. Please check your internet connection or try again later."
        else:
            return f"ERROR: Search failed due to technical issue: {error_msg}. Please try again or contact support if the problem persists."
