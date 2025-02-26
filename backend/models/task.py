from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

class Task(BaseModel):
    id: Optional[str] = None
    task_name: str
    description: str
    category: str
    priority: int
    status: str
    estimated_time: float
    due_date: str
    task_type: str
    user_id: str
    parent_task_id: Optional[str] = None

    class Config:
        orm_mode = True
        json_encoders = {ObjectId: str}