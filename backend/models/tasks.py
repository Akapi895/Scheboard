from pydantic import BaseModel
from typing import Optional

class Task(BaseModel):
    id: Optional[int] = None  # Changed from str to int for SQLite
    task_name: str
    description: str
    category: str
    priority: int
    status: str
    estimated_time: float
    due_date: str
    task_type: str
    user_id: str
    parent_task_id: Optional[int] = None  # Changed from str to int for SQLite

    class Config:
        orm_mode = True