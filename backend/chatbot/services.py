import json
from ai_service.chatbot.chatbot import chat_with_gemini

async def get_chat_response(prompt: str) -> str:
    with open("../../instructions.json", "r") as file:
        instructions = json.load(file)
    instruction = instructions.get('instruction_1')
    return chat_with_gemini(prompt, instruction)