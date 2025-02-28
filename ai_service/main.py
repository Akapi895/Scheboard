import sys
import os
from fastapi import FastAPI

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chatbot.controllers import router as chatbot_router

app = FastAPI()

app.include_router(chatbot_router)