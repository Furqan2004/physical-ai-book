from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID

class Chapter(BaseModel):
    id: Optional[UUID] = None
    slug: str
    title: Optional[str] = None
    content: str
    last_synced: Optional[datetime] = None
    created_at: Optional[datetime] = None

class ChapterCreate(BaseModel):
    slug: str
    title: Optional[str] = None
    content: str
