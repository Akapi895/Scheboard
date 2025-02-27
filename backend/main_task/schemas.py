from pydantic import BaseModel
from typing import List, Dict

class MainTaskRequest(BaseModel):
    user_id: int
    main_task_id: int

class MainTaskResponse(BaseModel):
    status: str
    data: Dict

class SubTaskRequest(BaseModel):
    user_id: int
    main_task_id: int

class SubTaskResponse(BaseModel):
    status: str
    data: Dict

class SubTaskDetailRequest(BaseModel):
    task_id: int

class SubTaskDetailResponse(BaseModel):
    status: str
    data: Dict