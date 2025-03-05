from pydantic import BaseModel
from typing import List, Dict

class MainTasks(BaseModel):
    user_id: int

class MainTaskList(BaseModel):
    status: str
    data: list[str]


class MainTaskRequest(BaseModel):
    user_id: int
    main_task_id: int

class MainTaskResponse(BaseModel):
    status: str
    data: Dict

class SubTaskRequest(BaseModel):
    user_id: int
    main_task_id: int

class SubTaskResponse(BaseModel):
    status: str
    data: Dict

class SubTaskDetailRequest(BaseModel):
    task_id: int

class SubTaskDetailResponse(BaseModel):
    status: str
    data: Dict

class SubTaskCreateRequest(BaseModel):
    user_id: int
    task_name: str
    description: str
    category: str
    priority: str
    status: str
    estimated_time: int
    due_date: str

class SubTaskCreateResponse(BaseModel):
    status: str
    data: Dict

class TaskUpdateRequest(BaseModel):
    user_id: int
    task_id: int
    task_name: str
    description: str
    category: str
    priority: str
    status: str
    estimated_time: int
    due_date: str

class TaskUpdateResponse(BaseModel):
    status: str
    data: Dict

class SubTaskDeleteRequest(BaseModel):
    user_id: int
    task_id: int

class SubTaskDeleteResponse(BaseModel):
    status: str

class StatusUpdateRequest(BaseModel):
    user_id: int
    task_id: int
    status: str

class StatusUpdateResponse(BaseModel):
    status: str

class DeleteResourceRequest(BaseModel):
    task_id: int
    resource_id: int

class DeleteResourceResponse(BaseModel):
    status: str

class ResourceRequest(BaseModel):
    task_id: int

class ResourceResponse(BaseModel):
    status: str
    data: list[Dict]

class UploadResourceRequest(BaseModel):
    task_id: int
    type: str
    title: str
    url: str
    tag: str

class UploadResourceResponse(BaseModel):
    status: str