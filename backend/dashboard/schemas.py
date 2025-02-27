from pydantic import BaseModel
from typing import Dict

class MoodChangeRequest(BaseModel):
    user_id: int
    mood: str

class MoodChangeResponse(BaseModel):
    status: str
    data: Dict

class DashboardRequest(BaseModel):
    user_id: int

class DashboardResponse(BaseModel):
    status: str
    data: Dict

class ChartRequest(BaseModel):
    user_id: int

class ChartResponse(BaseModel):
    status: str
    data: Dict