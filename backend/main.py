import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from credentials.controllers import router as credentials_router
from profile.controllers import router as profile_router
from fastapi import FastAPI

app = FastAPI()

app.include_router(credentials_router)
app.include_router(profile_router)
