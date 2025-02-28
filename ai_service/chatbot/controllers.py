from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict
from .services import get_chat_response

router = APIRouter()

class ChatRequest(BaseModel):
    user_id: int
    prompt: str

class ChatResponse(BaseModel):
    status: str
    response: str

@router.get("/api/ai/chat/response", response_model=ChatResponse)
async def chat_response(chat_request: ChatRequest):
    try:
        response = await get_chat_response(chat_request.user_id, chat_request.prompt)
        print(response)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))