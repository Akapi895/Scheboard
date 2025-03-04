from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Optional
from .services import get_main_task_list, get_sub_task_list, get_subtask_details
from .services import create_sub_task, user_update_task, user_delete_subtask
from .services import update_subtask_status, delete_task_resource
from .services import get_task_resources, upload_task_resources
from .schemas import MainTaskRequest, MainTaskResponse
from .schemas import SubTaskRequest, SubTaskResponse
from .schemas import SubTaskDetailRequest, SubTaskDetailResponse
from .schemas import SubTaskCreateRequest, SubTaskCreateResponse
from .schemas import TaskUpdateRequest, TaskUpdateResponse
from .schemas import SubTaskDeleteRequest, SubTaskDeleteResponse
from .schemas import StatusUpdateRequest, StatusUpdateResponse
from .schemas import DeleteResourceRequest, DeleteResourceResponse
from .schemas import ResourceRequest, ResourceResponse
from .schemas import UploadResourceRequest, UploadResourceResponse

router = APIRouter()

# Task
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
        main_task_list = await get_sub_task_list(main_task_request.user_id, main_task_request.main_task_id)
        return {"status": "success", "data": main_task_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/main-tasks/subtask/detail", response_model=SubTaskDetailResponse)
async def get_subtask_detail(subtask_request: SubTaskDetailRequest):
    try:
        subtask_data = await get_subtask_details(subtask_request.task_id)
        return {"status": "success", "data": subtask_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/api/main-tasks/subtask/create", response_model=SubTaskCreateResponse)
async def create_subtask(subtask_request: SubTaskCreateRequest):
    try:
        subtask_data = await create_sub_task(subtask_request)
        return {"status": "success", "data": subtask_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/api/main-tasks/subtask/update", response_model=TaskUpdateResponse)
async def update_subtask(subtask_request: TaskUpdateRequest):
    try:
        subtask_data = await user_update_task(subtask_request)
        return {"status": "success", "data": subtask_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.delete("/api/main-tasks/subtask/delete", response_model=SubTaskDeleteResponse)
async def delete_subtask(subtask_request: SubTaskDeleteRequest):
    try:
        await user_delete_subtask(subtask_request.user_id, subtask_request.task_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/api/main-tasks/subtask/status", response_model=StatusUpdateResponse)
async def update_task_status(subtask_request: StatusUpdateRequest):
    try:
        await update_subtask_status(subtask_request)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
# Resource
@router.delete("/api/main-tasks/resources/delete", response_model=DeleteResourceResponse)
async def delete_resource(resource_request: DeleteResourceRequest):
    try:
        await delete_task_resource(resource_request.task_id, resource_request.resource_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/api/main-tasks/resources", response_model=ResourceResponse)
async def get_resources(resource_request: ResourceRequest):
    try:
        resource_list = await get_task_resources(resource_request.task_id)
        return {"status": "success", "data": resource_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/api/main-tasks/resources/upload", response_model=UploadResourceResponse)
async def upload_resources(upload_request: List[UploadResourceRequest]):
    try:
        await upload_task_resources(upload_request)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))