import sys
import os
from fastapi import FastAPI

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chatbot.chatbot import chat_with_gemini

app = FastAPI()


@app.get("/run_ai")
def run_ai():
    return chat_with_gemini

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
