from typing import List
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class Resource(BaseModel):
    type: str
    title: str
    url: str
    tag: str

class ResourceRequest(BaseModel):
    user_id: int
    task_id: int

class ResourceResponse(BaseModel):
    status: str
    data: List[Resource]

# @router.get("/api/main-tasks", response_model=ResourceResponse)
# async def suggest_resources(request=ResourceRequest):
