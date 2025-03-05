import sys
import os
from fastapi import FastAPI

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from credentials.controllers import router as credentials_router
from backend.profile.controllers import router as profile_router
from backend.chatbot.controllers import router as chatbot_router
from backend.calendar.controllers import router as calendar_router
from backend.dashboard.controllers import router as dashboard_router
from backend.main_task.controllers import router as main_task_router
from ai_service.chatbot.controllers import router as chatbot_router_ai
# from ai_service.main_task.controllers import router as main_task_router_ai
from ai_service.calendar.controllers import router as calendar_router_ai

from fastapi import FastAPI

app = FastAPI()

app.include_router(credentials_router)
app.include_router(profile_router)
app.include_router(chatbot_router)
app.include_router(dashboard_router)
app.include_router(main_task_router)
app.include_router(calendar_router, prefix="/api/calendar")
app.include_router(chatbot_router_ai)
# app.include_router(main_task_router_ai)
app.include_router(calendar_router_ai)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc thay "*" bằng frontend URL như "http://localhost:3000"
    allow_credentials=True,
    allow_methods=["*"],  # Cho phép tất cả phương thức (GET, POST, OPTIONS, v.v.)
    allow_headers=["*"],
)
