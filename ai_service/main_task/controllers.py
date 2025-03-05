from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

from ai_service.main_task.services import (
    save_all_session_resources,
    get_session_resources,
    generate_and_save_resource_suggestions,
    delete_session_resources
)
router = APIRouter()

class Resource(BaseModel):
    type: str
    title: str
    url: str
    tag: str

class ResourceRequest(BaseModel):
    user_id: int
    task_id: int

class ResourcesResponse(BaseModel):
    status: str
    resources: List[Resource]

class SingleResourceResponse(BaseModel):
    status: str
    resource: Resource

class StatusResponse(BaseModel):
    status: str
    message: str
    count: int = 0

@router.post("/api/main-tasks/resources/generate", response_model=ResourcesResponse)
async def generate_resources(request: ResourceRequest):
    try:
        # Generate resources using the task_id
        result = await generate_and_save_resource_suggestions(request.user_id, request.task_id)
        
        if result["success"]:
            return ResourcesResponse(
                status="success",
                resources=[Resource(**r) for r in result["resources"]]
            )
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except Exception as e:
        logging.error(f"Failed to generate resource suggestions: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate resource suggestions: {str(e)}")

@router.get("/api/main-tasks/resources", response_model=ResourcesResponse)
async def get_resources(user_id: int, task_id: int):
    try:
        resources = await get_session_resources(user_id)
        if not resources:
            return ResourcesResponse(status="success", resources=[])
            
        return ResourcesResponse(
            status="success",
            resources=[Resource(**r) for r in resources]
        )
    except Exception as e:
        logging.error(f"Failed to get resources: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get resources: {str(e)}")

@router.post("/api/main-tasks/resources/accept", response_model=StatusResponse)
async def accept_resources(request: ResourceRequest):
    try:
        result = await save_all_session_resources(request.user_id, request.task_id)
        
        if result["success"]:
            return StatusResponse(
                status="success",
                message=result["message"],
                count=result.get("count", 0)
            )
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except Exception as e:
        logging.error(f"Failed to accept resources: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to accept resources: {str(e)}")

@router.delete("/api/main-tasks/resources/decline", response_model=StatusResponse)
async def decline_resources(request: ResourceRequest):
    try:
        result = await delete_session_resources(request.user_id)
        
        return StatusResponse(
            status="success",
            message="Resources declined successfully"
        )
    except Exception as e:
        logging.error(f"Failed to decline resources: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to decline resources: {str(e)}")