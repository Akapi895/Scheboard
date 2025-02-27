from pydantic import BaseModel
from typing import Optional

class Resource(BaseModel):
    id: Optional[int] = None  # Changed from str to int for SQLite
    type: str
    title: str
    url: Optional[str] = None  # Đã đổi từ HttpUrl thành str
    tags: str
    ai_summary: Optional[str] = None
    task_id: str

    class Config:
        orm_mode = True
