from typing import Optional
from pydantic import BaseModel

# class UpdateProfileRequest(BaseModel):
#     user_id: int
#     password: str
#     ava_url: str
#     about_me: str
#     learning_style: str

class UpdateProfileRequest(BaseModel):
    user_id: int
    ava_url: Optional[str] = None
    about_me: Optional[str] = None
    learning_style: Optional[str] = None
    password: Optional[str] = None