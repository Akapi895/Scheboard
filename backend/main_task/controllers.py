from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Optional
from .services import get_main_task_with_subtasks

router = APIRouter()

# Request Model
class MainTaskRequest(BaseModel):
    user_id: int
    main_task_id: int

# Response Model
class TaskDetail(BaseModel):
    task_id: int
    task_name: str

class MainTaskResponse(BaseModel):
    status: str
    data: Dict[str, Optional[Dict[str, List[TaskDetail]]]]

# API Endpoint
@router.get("/api/main-tasks", response_model=MainTaskResponse)
async def get_main_tasks_endpoint(request: MainTaskRequest):
    data = await get_main_task_with_subtasks(request.user_id, request.main_task_id)
    return {"status": "success", "data": data}
