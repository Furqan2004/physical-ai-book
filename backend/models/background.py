from pydantic import BaseModel
from typing import List


class BackgroundRequest(BaseModel):
    """Request model for user background information"""
    software_experience: str  # 'beginner', 'intermediate', 'advanced'
    hardware_background: str
    known_languages: List[str]
    learning_style: str  # 'visual', 'reading', 'hands-on'
