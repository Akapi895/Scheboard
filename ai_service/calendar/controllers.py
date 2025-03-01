import logging
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from .services import (
    save_session_tasks,
    save_all_session_tasks,
    save_one_session_task,
    delete_all_session_tasks,
    delete_one_session_task, 
)

router = APIRouter()

class AITask(BaseModel):
    task_id: int
    task_name: str
    task_type: str
    description: str
    category: str
    priority: str
    status: str
    estimated_time: str
    due_date: str
    parent_task_id: Optional[int]

class AIRequest(BaseModel):  # For AI-gen ?
    user_id: int
    prompt: str
    tasks: List[AITask]

class AIResponse(BaseModel):  # For AI-gen ?
    status: str
    tasks: List[AITask]

@router.post("/api/calendar/ai/generate", response_model=AIResponse)
async def generate_ai_tasks(user_id: str, request: AIRequest):
    try:
        await save_session_tasks(user_id, request.tasks)  # Fixed missing user_id
        return AIResponse(status="success", tasks=request.tasks)
    except Exception as e:
        logging.error(f"Error generating AI tasks for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate AI tasks.")

@router.delete("/api/calendar/ai/decline/one")
async def decline_one_task(user_id: str = Query(..., description="User ID"),
                           task_name: str = Query(..., description="Task name")):
    try:
        await delete_one_session_task(user_id, task_name)
        return {"status": "success", "message": f"Task '{task_name}' declined successfully."}
    except Exception as e:
        logging.error(f"Error declining task '{task_name}' for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to decline task.")

@router.delete("/api/calendar/ai/decline/all")
async def decline_all_tasks(user_id: str = Query(..., description="User ID")):
    try:
        await delete_all_session_tasks(user_id)
        return {"status": "success", "message": "All AI-generated tasks declined successfully."}
    except Exception as e:
        logging.error(f"Error declining all tasks for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to decline all tasks.")

@router.post("/api/calendar/ai/accept/one")
async def accept_one_task(user_id: str, task: AITask):
    try:
        await save_one_session_task(user_id, task.task_name)
        return {"status": "success", "message": f"Task '{task.task_name}' accepted successfully."}
    except Exception as e:
        logging.error(f"Error accepting task '{task.task_name}' for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to accept task.")

@router.post("/api/calendar/ai/accept/all")
async def accept_all_tasks(user_id: str, request: AIRequest):
    try:
        await save_all_session_tasks(user_id, request.tasks)
        return {"status": "success", "message": "All AI-generated tasks accepted successfully."}
    except Exception as e:
        logging.error(f"Error accepting all tasks for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to accept all tasks.")
