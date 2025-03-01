import logging
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from .services import (
    extract_tasks_from_response,
    get_calendar_plan_suggestions,
    save_session_tasks,
    save_all_session_tasks,
    save_one_session_task,
    delete_all_session_tasks,
    delete_one_session_task
)

router = APIRouter()

class AITask(BaseModel):
    task_name: str
    task_type: str
    description: str
    category: str
    priority: str
    status: str
    estimated_time: int
    due_date: str
    parent_task_id: Optional[int]


class CalendarAIRequest(BaseModel):
    prompt: str
    tasks: List[AITask]

@router.post("/api/calendar/ai/generate_suggestions")
async def generate_calendar_plan(request: CalendarAIRequest):
    try:
        tasks_as_dict = [t.dict() for t in request.tasks]
        result = await get_calendar_plan_suggestions(request.prompt, tasks_as_dict)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/api/calendar/ai/decline/one")
async def decline_one_task(
    user_id: int = Query(..., description="User ID"),
    task_name: str = Query(..., description="Task name")
):

    try:
        await delete_one_session_task(user_id, task_name)
        return {"status": "success", "message": f"Task '{task_name}' declined successfully."}
    except Exception as e:
        logging.error(f"Error declining task '{task_name}' for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to decline task.")

@router.delete("/api/calendar/ai/decline/all")
async def decline_all_tasks(user_id: int = Query(..., description="User ID")):
    try:
        await delete_all_session_tasks(user_id)
        return {"status": "success", "message": "All AI-generated tasks declined successfully."}
    except Exception as e:
        logging.error(f"Error declining all tasks for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to decline all tasks.")

@router.post("/api/calendar/ai/accept/one")
async def accept_one_task(user_id: int, task: AITask):
    try:
        await save_one_session_task(user_id, task.task_name)
        return {"status": "success", "message": f"Task '{task.task_name}' accepted successfully."}
    except Exception as e:
        logging.error(f"Error accepting task '{task.task_name}' for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to accept task.")

@router.post("/api/calendar/ai/accept/all")
async def accept_all_tasks(user_id: int, tasks: List[AITask]):
    try:
        tasks_as_dict = [t.dict() for t in tasks]
        await save_all_session_tasks(user_id, tasks_as_dict)
        return {"status": "success", "message": "All AI-generated tasks accepted successfully."}
    except Exception as e:
        logging.error(f"Error accepting all tasks for user {user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to accept all tasks.")
  
# New combined request model
class CalendarSuggestAndSaveRequest(BaseModel):
    user_id: int
    prompt: str
    tasks: List[AITask]

# New combined response model
class CalendarSuggestAndSaveResponse(BaseModel):
    status: str
    ai_response: str
    tasks: List[AITask]

@router.post("/api/calendar/ai/generate", response_model=CalendarSuggestAndSaveResponse)
async def generate_suggestions_and_save(request: CalendarSuggestAndSaveRequest):
    try:
        # Step 1: Generate AI suggestions
        tasks_as_dict = [t.dict() for t in request.tasks]
        ai_response = await get_calendar_plan_suggestions(request.prompt, tasks_as_dict)
        
        # Step 2: Extract tasks from the AI response
        extracted_tasks = await extract_tasks_from_response(ai_response)
        
        # Step 3: Save the extracted tasks to the session
        await save_session_tasks(request.user_id, extracted_tasks)
        
        # Step 4: Convert dictionary tasks back to AITask objects for response
        ai_tasks = [AITask(**task) for task in extracted_tasks]
        
        return CalendarSuggestAndSaveResponse(
            status="success", 
            ai_response=ai_response,
            tasks=ai_tasks
        )
    except Exception as e:
        logging.error(f"Error generating suggestions and saving tasks for user {request.user_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="Failed to generate suggestions and save tasks."
        )