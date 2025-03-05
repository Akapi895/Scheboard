from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
from .schemas import UpdateProfileRequest
from .services import get_user_profile, update_user_profile

router = APIRouter()

class ProfileResponse(BaseModel):
    status: str
    data: Dict

class ProfileRequest(BaseModel):
    user_id: int
 
@router.get("/api/profile", response_model=ProfileResponse)
async def get_profile(user_id: int):
    try:
        profile_data = await get_user_profile(user_id)
        return {"status": "success", "data": profile_data}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/api/profile/update", response_model=ProfileResponse)
async def update_profile(update_request: UpdateProfileRequest):
    try:
        profile_data = await update_user_profile(update_request)
        return {"status": "success", "data": profile_data}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))