import os
from dotenv import load_dotenv
import json
from typing import List, Dict
from .chatbot import chat_with_gemini

load_dotenv()

instructions_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instructions.json')
print(instructions_path)

chat_history: Dict[str, List[Dict[str, str]]] = {}

async def get_chat_response(user_id: str, prompt: str) -> str:
    with open(instructions_path, 'r', encoding='utf-8') as f:
        instructions = json.load(f)
    instruction = instructions.get('instruction_1')
    response = chat_with_gemini(prompt, instruction)
    
    # Save the chat message
    save_chat_message(user_id, prompt, response)
    
    return response

def save_chat_message(user_id: str, prompt: str, answer: str):
    if user_id not in chat_history:
        chat_history[user_id] = []
    chat_history[user_id].append({"prompt": prompt, "answer": answer})
    
    # Keep only the last 10 messages
    if len(chat_history[user_id]) > 10:
        chat_history[user_id] = chat_history[user_id][-10:]

def get_chat_history(user_id: str) -> List[Dict[str, str]]:
    return chat_history.get(user_id)