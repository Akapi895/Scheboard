from typing import List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ai_service.main_task.services import save_all_session_resources

router = APIRouter()

class Resource(BaseModel):
    type: str
    title: str
    url: str
    tag: str

class ResourceRequest(BaseModel):
    user_id: int
    task_id: int

class SingleResourceResponse(BaseModel):
    status: str
    resource: Resource

# @router.post("/api/main-tasks", response_model=ResourceResponse)
# async def suggest_resources(request=ResourceRequest):

@router.post("/api/main-tasks/resources/accept")
async def accept_resources(request: ResourceRequest):
    try:
        result = await save_all_session_resources(request.user_id, request.task_id)
        
        if result["success"]:
            return {
                "status": "success",
                "message": result["message"],
                "count": result["count"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/main-tasks/resources/decline")
async def decline_resources(request: ResourceRequest):
    try:
        from ai_service.main_task.services import delete_session_resources
        
        result = await delete_session_resources(request.user_id, request.task_id)
        
        if result["success"]:
            return {
                "status": "success",
                "message": result["message"]
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))