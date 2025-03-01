from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from ai_service.chatbot.services import get_chat_response, get_chat_history

router = APIRouter()

class ChatMessage(BaseModel):
    user_id: str
    prompt: str

class ChatResponse(BaseModel):
    status: str
    response: str

@router.get("/api/ai/chat/response/", response_model=ChatResponse)
async def chat(message: ChatMessage):
    response = await get_chat_response(message.user_id, message.prompt)
    history = get_chat_history(message.user_id) or []
    
    return {"status": "success", "response": response}


@router.get("/api/ai/chat/response/{user_id}")
async def get_user_chat_history(user_id: str):
    history = get_chat_history(user_id)
    if history is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user_id": user_id, "history": history}