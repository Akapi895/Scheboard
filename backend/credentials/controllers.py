from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List
from .services import authenticate_user, register_user
import asyncio


router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    status: str
    data: Dict

@router.get("/api/credentials/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    user_id = await authenticate_user(credentials.username, credentials.password)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"status": "success", "data": {"user_id": user_id}}

class RegisterRequest(BaseModel):
    username: str
    password: str
    confirm_password: str
    email: str

class RegisterResponse(BaseModel):
    status: str
    data: Dict

@router.post("/api/credentials/register", response_model=RegisterResponse)
async def register(credentials: RegisterRequest):
    if credentials.password != credentials.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    user_id = await register_user(credentials.username, credentials.password, credentials.email)
    if user_id is None:
        raise HTTPException(status_code=400, detail="Registration failed")
    
    return {"status": "success", "data": {"user_id": user_id}}

# Giả lập lưu session
session_tasks: Dict[int, List] = {}
session_lock = asyncio.Lock()

async def get_session_user_id():
    async with session_lock:
        if session_tasks:
            return list(session_tasks.keys())[0]  # Lấy user đầu tiên
        return None

@router.get("/api/user_id")
async def get_user_id():
    user_id = await get_session_user_id()
    if user_id is None:
        raise HTTPException(status_code=401, detail="User not found in session")
    return {"user_id": user_id}
