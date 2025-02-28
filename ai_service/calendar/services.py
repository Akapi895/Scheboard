import os
from typing import List
import json
from dotenv import load_dotenv

from ai_service.calendar.chatbot import chat_with_gemini

load_dotenv()
instructions_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instructions.json')
async def get_calendar_plan_suggestions(prompt: str, tasks: List[dict]) -> str:
    tasks_text = ""
    for t in tasks:
        tasks_text += (
            f"- Task ID: {t.get('task_id')}, "
            f"Type: {t.get('task_type')}, "
            f"Description: {t.get('description')}, "
            f"Priority: {t.get('priority')}, "
            f"Estimated Time: {t.get('estimated_time')}, "
            f"Due Date: {t.get('due_date')}, "
            f"Parent Task ID: {t.get('parent_task_id')}\n"
        )
    combined_text = (
        f"{prompt}\n\n"
        "Dưới đây là danh sách task:\n"
        f"{tasks_text}\n"
        "Hãy gợi ý cách cải thiện và sắp xếp lịch."
    )

    with open(instructions_path, 'r', encoding='utf-8') as f:
        instructions = json.load(f)
    instruction = instructions.get('instruction_2')
    response = chat_with_gemini(combined_text, instruction)
    return response
