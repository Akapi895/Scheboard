from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

from ai_service.calendar.services import get_calendar_plan_suggestions

router = APIRouter()

class Task(BaseModel):
    task_id: int
    task_type: str
    description: str
    priority: str
    estimated_time: str
    due_date: str
    parent_task_id: Optional[int] = None

class CalendarAIRequest(BaseModel):
    prompt: str
    tasks: List[Task]

@router.post("/api/calendar/ai/generate")
async def generate_calendar_plan(request: CalendarAIRequest):
    try:
        # Chuyển các Task object thành list[dict]
        tasks_as_dict = [t.dict() for t in request.tasks]
        result = await get_calendar_plan_suggestions(request.prompt, tasks_as_dict)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
