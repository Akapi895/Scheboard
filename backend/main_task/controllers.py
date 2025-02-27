from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Optional
from .services import get_main_task_list, get_sub_task_list, detail_subtask
from .schemas import MainTaskRequest, MainTaskResponse, SubTaskRequest, SubTaskResponse, SubTaskDetailRequest, SubTaskDetailResponse

router = APIRouter()

@router.get("/api/main-tasks", response_model=MainTaskResponse)
async def get_main_tasks(main_task_request: MainTaskRequest):
    try:
        main_task_list = await get_main_task_list(main_task_request.user_id, main_task_request.main_task_id)
        return {"status": "success", "data": main_task_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/main-tasks/subtasks", response_model=SubTaskResponse)
async def get_subtasks(main_task_request: SubTaskRequest):
    try:
        main_task_list = await get_main_task_list(main_task_request.user_id, main_task_request.main_task_id)
        return {"status": "success", "data": main_task_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/api/main-tasks/subtask/detail", response_model=SubTaskDetailResponse)
async def detail_subtask(subtask_request: SubTaskDetailRequest):
    try:
        subtask_data = await detail_subtask(subtask_request.task_id)
        return {"status": "success", "data": subtask_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))