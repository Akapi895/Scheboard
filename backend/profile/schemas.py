from pydantic import BaseModel

class UpdateProfileRequest(BaseModel):
    user_id: int
    password: str
    ava_url: str
    about_me: str
    learning_style: str