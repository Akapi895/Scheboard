from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

class Resource(BaseModel):
    id: Optional[str] = None
    type: str
    title: str
    url: Optional[str] = None  # Đã đổi từ HttpUrl thành str
    tags: str
    ai_summary: Optional[str] = None
    task_id: str

    class Config:
        orm_mode = True
        json_encoders = {ObjectId: str}
