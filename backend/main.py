import sys
import os
from fastapi import FastAPI

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.credentials.controllers import router as credentials_router
from backend.profile.controllers import router as profile_router
from backend.calendar.controllers import router as calendar_router
from backend.dashboard.controllers import router as dashboard_router
from backend.main_task.controllers import router as main_task_router

from ai_service.chatbot.controllers import router as chatbot_router 
from ai_service.calendar.controllers import router as ai_calendar_router
from ai_service.main_task.controllers import router as ai_main_task_router

app = FastAPI()

app.include_router(credentials_router)
app.include_router(profile_router)
app.include_router(dashboard_router)
app.include_router(main_task_router)
app.include_router(calendar_router, prefix="/api/calendar")

app.include_router(chatbot_router)
app.include_router(ai_calendar_router)
app.include_router(main_task_router)
app.include_router(ai_main_task_router)