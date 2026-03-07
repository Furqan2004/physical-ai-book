import os
from pathlib import Path

def get_doc_content(source_path: str) -> str:
    """
    Reads the actual markdown content from the frontend/docs directory.
    source_path: e.g. '@site/docs/part-1-foundations/intro.md'
    """
    try:
        # Convert @site/docs/... to relative path from backend/
        # backend is at /backend
        # docs are at /frontend/docs
        
        rel_path = source_path.replace('@site/docs/', '')
        # Handle cases where @site/ might not be there
        rel_path = rel_path.replace('docs/', '')
        
        # Absolute path to frontend docs
        docs_base = Path(__file__).parent.parent.parent / 'frontend' / 'docs'
        file_path = docs_base / rel_path
        
        if not file_path.exists():
            print(f"File not found: {file_path}")
            return f"Error: File {source_path} not found on server."
            
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"Error reading doc: {e}")
        return f"Error reading document: {str(e)}"
