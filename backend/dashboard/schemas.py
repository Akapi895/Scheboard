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

class DelComTaskRequest(BaseModel):
    user_id: int
    task_id: int

class DelComTaskResponse(BaseModel):
    status: str

class EditTaskRequest(BaseModel):
    task_id: int
    task_name: str
    description: str
    priority: str
    status: str
    estimated_time: int
    due_date: str

class EditTaskResponse(BaseModel):
    status: str
    data: Dict

class UpcomingTaskResponse(BaseModel):
    status: str
    data: list[Dict]