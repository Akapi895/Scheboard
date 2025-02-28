from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Optional
from .services import get_tasks, get_task_detail, create_task, update_task, delete_task, update_task_status

router = APIRouter()

class TaskRequest(BaseModel):
    user_id: int

class TaskResponse(BaseModel):
    status: str
    data: Dict

#tested
@router.get("/tasks", response_model=TaskResponse)
async def get_tasks_endpoint(request: TaskRequest):
    tasks = await get_tasks(request.user_id)
    return {"status": "success", "data": {"tasks": tasks}}


class TaskDetailRequest(BaseModel):
    user_id: int
    task_id: int

class TaskDetailResponse(BaseModel):
    status: str
    data: Dict

# tested
@router.get("/tasks/detail", response_model=TaskDetailResponse)
async def get_task_detail_endpoint(request: TaskDetailRequest):  
    task = await get_task_detail(request.task_id)
    return {"status": "success", "data": {"task": task}} 

class TaskCreateRequest(BaseModel):
    task_name: str
    task_type: str
    description: str
    category: str
    priority: str
    status: str
    estimated_time: int
    due_date: str
    user_id: int
    parent_task_id: Optional[int] = None

class TaskCreateResponse(BaseModel):
    status: str
    data: Dict

# tested
@router.post("/tasks/create", response_model=TaskCreateResponse)
async def create_task_endpoint(task: TaskCreateRequest):
    task_id = await create_task(task.model_dump())  # Ensure it's converted to a dict
    return {"status": "success", "data": {
        "task_id": task_id,
        "task_name": task.task_name,
        "task_type": task.task_type,
        "priority": task.priority,
        "due_date": task.due_date
    }}


class TaskUpdateRequest(BaseModel):
    task_id: int
    task_name: str
    task_type: str
    description: str
    category: str
    priority: str
    status: str
    estimated_time: int
    due_date: str
    user_id: int
    parent_task_id: Optional[int] = None

class TaskUpdateResponse(BaseModel):
    status: str
    data: Dict

# tested
@router.put("/tasks/update", response_model=TaskUpdateResponse)
async def update_task_endpoint(task: TaskUpdateRequest):
    await update_task(task.task_id, task.model_dump())
    return {"status": "success", "data": {
        "task_id": task.task_id,
        "task_name": task.task_name,
        "task_type": task.task_type,
        "priority": task.priority,
        "due_date": task.due_date
    }}


class TaskDeleteRequest(BaseModel):
    task_id: int

# tested
@router.delete("/tasks/delete")
async def delete_task_endpoint(task: TaskDeleteRequest):
    await delete_task(task.task_id)
    return {"status": "success", "data": {}}


class TaskStatusUpdateRequest(BaseModel):
    task_id: int
    status: str

# tested
@router.patch("/tasks/status")
async def update_task_status_endpoint(task: TaskStatusUpdateRequest):
    await update_task_status(task.task_id, task.status)
    return {"status": "success", "data": {}}
