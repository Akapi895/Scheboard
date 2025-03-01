import os
from dotenv import load_dotenv
import json
from typing import List, Dict
from .chatbot import chat_with_gemini

load_dotenv()

instructions_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'instructions.json'
)

chat_history: Dict[int, List[Dict[str, str]]] = {}

async def get_chat_response(user_id: int, prompt: str) -> str:
    with open(instructions_path, 'r', encoding='utf-8') as f:
        instructions = json.load(f)
    instruction = instructions.get('instruction_1')
    history = chat_history.get(user_id, [])
    conversation_context = ""
    if history:
        recent_history = history[-8:] if len(history) > 8 else history
        for message in recent_history:
            conversation_context += f"User: {message['prompt']}\n"
            conversation_context += f"Assistant: {message['answer']}\n"
    contextualized_prompt = f"{instruction}\n\nPrevious conversation:\n{conversation_context}\nUser: {prompt}"
    response = chat_with_gemini(contextualized_prompt, "")
    save_chat_message(user_id, prompt, response)
    
    return response

def save_chat_message(user_id: int, prompt: str, answer: str):
    if user_id not in chat_history:
        chat_history[user_id] = []
    chat_history[user_id].append({"prompt": prompt, "answer": answer})
    
    # Keep only the last 15 messages
    if len(chat_history[user_id]) > 15:
        chat_history[user_id] = chat_history[user_id][-15:]

def get_chat_history(user_id: int) -> List[Dict[str, str]]:
    return chat_history.get(user_id)