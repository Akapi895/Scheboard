import os
from dotenv import load_dotenv
import json
from .chatbot import chat_with_gemini

load_dotenv()

instructions_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instructions.json')
print(instructions_path)

async def get_chat_response(user_id: int, prompt: str) -> str:
    with open(instructions_path, 'r', encoding='utf-8') as f:
        instructions = json.load(f)
    instruction = instructions.get('instruction_1')
    return chat_with_gemini(prompt, instruction)
