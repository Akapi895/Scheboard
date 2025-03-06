import logging
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from .services import (
    extract_tasks_from_response,
    extract_tasks_from_response,
    get_calendar_plan_suggestions,
    save_session_tasks,
    save_all_session_tasks,
    save_one_session_task,
    delete_all_session_tasks,
    delete_one_session_task,
    get_mood_from_session,
    get_learning_style_from_session,
    get_session_tasks
)

router = APIRouter()

class AITask(BaseModel):
    task_id: int = None
    task_name: str
    description: str
    priority: str
    estimated_time: int
    due_date: str
    status: str
    category: str
    task_type: str
    parent_task_id: Optional[int]
    user_id: int

# class AITask(BaseModel):
#     task_name: str
#     task_type: str
#     description: str
#     category: str
#     priority: str
#     status: str
#     estimated_time: int
#     due_date: str
#     parent_task_id: Optional[int]


class CalendarAIRequest(BaseModel):
    prompt: str
    tasks: List[AITask]


class DeclineOneTaskRequest(BaseModel):
    user_id: int
    task_name: str

@router.delete("/api/calendar/ai/decline/one")
async def decline_one_task(request: DeclineOneTaskRequest):
    try:
        await delete_one_session_task(request.user_id, request.task_name)
        return {"status": "success", "message": f"Task '{request.task_name}' declined successfully."}
    except ValueError as e:
        logging.error(f"Task not found: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=f"Task '{request.task_name}' not found")
    except Exception as e:
        logging.error(f"Error declining task '{request.task_name}' for user {request.user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to decline task.")
class DeclineAllTasksRequest(BaseModel):
    user_id: int

@router.delete("/api/calendar/ai/decline/all")
async def decline_all_tasks(request: DeclineAllTasksRequest):
    try:
        had_tasks = await delete_all_session_tasks(request.user_id)
        if had_tasks:
            return {"status": "success", "message": "All AI-generated tasks declined successfully."}
        else:
            return {"status": "success", "message": "No tasks found to decline."}
    except Exception as e:
        logging.error(f"Error declining all tasks for user {request.user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to decline all tasks.")

class AcceptOneTaskRequest(BaseModel):
    user_id: int
    task_name: str

@router.post("/api/calendar/ai/accept/one")
async def accept_one_task(request: AcceptOneTaskRequest):
    try:
        await save_one_session_task(request.user_id, request.task_name)
        return {"status": "success", "message": f"Task '{request.task_name}' accepted successfully."}
    except ValueError as e:
        logging.error(f"Task not found: {e}", exc_info=True)
        raise HTTPException(status_code=404, detail=f"Task '{request.task_name}' not found")
    except Exception as e:
        logging.error(f"Error accepting task '{request.task_name}' for user {request.user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to accept task.")
class AcceptAllTasksRequest(BaseModel):
    user_id: int
    task: List[AITask]

@router.post("/api/calendar/ai/accept/all")
async def accept_all_tasks(request: AcceptAllTasksRequest):
    try:
        result = await save_all_session_tasks(request.user_id)
        
        if result["success"]:
            return {"status": "success", "message": f"Successfully saved {result['count']} tasks"}
        else:
            return {"status": "error", "message": result["message"]}
    except Exception as e:
        logging.error(f"Error accepting all tasks for user {request.user_id}: {e}", exc_info=True)
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


# learning_style (from user)
# mood (from session)
# priority (from task) ?????
@router.post("/api/calendar/ai/generate", response_model=CalendarSuggestAndSaveResponse)
async def generate_suggestions_and_save(request: CalendarSuggestAndSaveRequest):
    try:
        # Get user context
        user_mood = await get_mood_from_session(request.user_id) 
        learning_style = await get_learning_style_from_session(request.user_id)    
        
        # Prepare data for AI
        tasks_as_dict = [t.dict() for t in request.tasks]
        for task in tasks_as_dict:
            task['user_id'] = request.user_id  # Add user_id to tasks for session storage
        
        # Build prompt and get AI response
        prompt = f"{request.prompt}\nCurrent mood: {user_mood}\nLearning style: {learning_style}"
        ai_response = await get_calendar_plan_suggestions(prompt, tasks_as_dict)
        
        return CalendarSuggestAndSaveResponse(
            status="success", 
            ai_response=ai_response,
        )
    except Exception as e:
        logging.error(f"Error generating suggestions for user {request.user_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate suggestions.")

from pydantic import BaseModel
from typing import List

class SessionTasksResponse(BaseModel):
    status: str
    tasks: List[AITask]

@router.get("/api/calendar/ai/session-tasks")
async def get_ai_session_tasks(user_id: int):
    try:
        tasks = await get_session_tasks(user_id)
        logging.info(f"Retrieved {len(tasks)} session tasks for user {user_id}")
        
        # Ensure every task has the user_id
        for task in tasks:
            if 'user_id' not in task:
                task['user_id'] = user_id
        
        return SessionTasksResponse(status="success", tasks=tasks)
    except Exception as e:
        logging.error(f"Error retrieving session tasks: {e}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail="Failed to retrieve session tasks"
        )