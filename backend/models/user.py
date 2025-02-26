from pydantic import BaseModel
from typing import Optional
from bson import ObjectId

class User(BaseModel):
    id: Optional[str] = None
    username: str
    email: str  # Đã đổi từ EmailStr thành str
    learning_style: Optional[str] = None
    completion_percentage: Optional[float] = 0.0
    password: str
    about_me: Optional[str] = None
    ava_url: Optional[str] = None  # Đã đổi từ HttpUrl thành str

    class Config:
        orm_mode = True
        json_encoders = {ObjectId: str}
