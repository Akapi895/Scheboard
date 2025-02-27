from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
from .services import get_user_profile

router = APIRouter()

class ProfileResponse(BaseModel):
    status: str
    data: Dict

@router.get("/api/profile", response_model=ProfileResponse)
async def get_profile(user_id: str):
    try:
        profile_data = await get_user_profile(user_id)
        return {"status": "success", "data": profile_data}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))