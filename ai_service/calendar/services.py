import os
import json
import aiosqlite
import asyncio
import logging
from typing import List, Optional
from dotenv import load_dotenv
from backend.database import DATABASE
from ai_service.calendar.chatbot import chat_with_gemini

load_dotenv()

instructions_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
    'instructions.json'
)


session_tasks = {}
session_lock = asyncio.Lock()

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

async def get_session_tasks(user_id: int):
    async with session_lock:
        return session_tasks.get(user_id, [])

async def save_session_tasks(user_id: int, tasks: list):
    async with session_lock:
        session_tasks[user_id] = tasks

async def delete_all_session_tasks(user_id: int):
    async with session_lock:
        session_tasks.pop(user_id, None)

async def delete_one_session_task(user_id: int, task_name: str):
    async with session_lock:
        tasks = session_tasks.get(user_id, [])
        session_tasks[user_id] = [
            t for t in tasks if t.get("task_name") != task_name
        ]
        logging.info(f"Deleted session task '{task_name}' for user {user_id}.")

async def _save_tasks_to_db(user_id: int, tasks: list) -> bool:
    if not tasks:
        return False

    try:
        async with aiosqlite.connect(DATABASE) as db:
            await db.executemany(
                """
                INSERT INTO tasks (
                    task_name, description, category, priority,
                    status, estimated_time, due_date, task_type,
                    user_id, parent_task_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        task.get("task_name"),
                        task.get("description"),
                        task.get("category"),
                        task.get("priority"),
                        task.get("status"),
                        task.get("estimated_time"),
                        task.get("due_date"),
                        task.get("task_type"),
                        user_id,
                        task.get("parent_task_id"),
                    )
                    for task in tasks
                ],
            )
            await db.commit()
            return True
    except Exception as e:
        logging.error(f"Error saving tasks to database for user {user_id}: {e}", exc_info=True)
        return False

async def save_all_session_tasks(user_id: int, tasks: list = None):
    if tasks is not None:
        # Nếu có truyền tasks trực tiếp, lưu luôn
        if await _save_tasks_to_db(user_id, tasks):
            await delete_all_session_tasks(user_id)
    else:
        # Nếu không truyền, thì lấy tasks từ session
        tasks_in_session = await get_session_tasks(user_id)
        if await _save_tasks_to_db(user_id, tasks_in_session):
            await delete_all_session_tasks(user_id)

async def save_one_session_task(user_id: int, task_name: str):
    async with session_lock:
        tasks = session_tasks.get(user_id, [])
        task_to_save = next((t for t in tasks if t.get("task_name") == task_name), None)
        if not task_to_save:
            logging.error(f"Task '{task_name}' not found in session for user {user_id}.")
            return

        remaining_tasks = [t for t in tasks if t.get("task_name") != task_name]

    # Lưu xuống DB
    if await _save_tasks_to_db(user_id, [task_to_save]):
        # Xóa task vừa lưu khỏi session
        await save_session_tasks(user_id, remaining_tasks)

# Language: Python
import re
import json

async def extract_tasks_from_response(response: str) -> List[dict]:
    """
    Extracts JSON task objects from an AI response that contains formatted code blocks.
    
    Args:
        response: The AI response string containing JSON task blocks
        
    Returns:
        A list of parsed task dictionaries
    """
    tasks = []
    
    # Regular expression to find JSON code blocks
    json_pattern = r"```json\s*(\{.*?\})\s*```"
    matches = re.findall(json_pattern, response, re.DOTALL)
    
    for json_str in matches:
        try:
            task = json.loads(json_str)
            
            # Add default values for category and status if they don't exist
            if "category" not in task:
                task["category"] = "study"  # Default category
            if "status" not in task:
                task["status"] = "todo"  # Default status
                
            tasks.append(task)
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse task JSON: {e}")
            continue
    
    return tasks