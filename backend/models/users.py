from pydantic import BaseModel
from typing import Optional

class User(BaseModel):
    id: Optional[int] = None  # Changed from str to int for SQLite
    username: str
    email: str  # Đã đổi từ EmailStr thành str
    learning_style: Optional[str] = None
    completion_percentage: Optional[float] = 0.0
    password: str
    about_me: Optional[str] = None
    ava_url: Optional[str] = None  # Đã đổi từ HttpUrl thành str

    class Config:
        orm_mode = True
