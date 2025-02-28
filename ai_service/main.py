import sys
import os
from fastapi import FastAPI

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chatbot.controllers import router as chatbot_router
from ai_service.calendar.calendar_controller import router as calendar_router

app = FastAPI()

app.include_router(chatbot_router)
app.include_router(calendar_router)