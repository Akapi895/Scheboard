import sys
import os
from fastapi import FastAPI
from credentials.controllers import router as credentials_router
from calendar.controllers import router as calendar_router

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI()

app.include_router(credentials_router, prefix="/api/credentials")
app.include_router(calendar_router, prefix="/api/calendar")
