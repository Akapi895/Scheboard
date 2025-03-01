import os
import json
import aiosqlite
import asyncio
import logging
import re
from typing import List, Optional, Dict
from dotenv import load_dotenv
from backend.database import DATABASE
from ai_service.calendar.chatbot import chat_with_gemini

load_dotenv()

instructions_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
    'instructions.json'
)

# In-memory storage for session tasks as a temporary solution
session_storage = {}

async def get_session_tasks(user_id: int):
    """Get tasks for a user from session storage"""
    user_id_str = str(user_id)
    return session_storage.get(user_id_str, [])

async def save_session_tasks(user_id: int, tasks: list):
    """Save tasks for a user to session storage"""
    user_id_str = str(user_id)
    session_storage[user_id_str] = tasks

async def delete_all_session_tasks(user_id: int):
    """Delete all tasks for a user from session storage"""
    user_id_str = str(user_id)
    if user_id_str in session_storage:
        del session_storage[user_id_str]

async def delete_one_session_task(user_id: int, task_name: str):
    """Delete a specific task for a user from session storage"""
    tasks = await get_session_tasks(user_id)
    updated_tasks = [t for t in tasks if t.get("task_name") != task_name]
    await save_session_tasks(user_id, updated_tasks)
    logging.info(f"Deleted session task '{task_name}' for user {user_id}.")

async def save_all_session_tasks(user_id: int, tasks: list = None):
    """Save all tasks for a user to the database and clear from session storage"""
    if tasks is not None:
        if await _save_tasks_to_db(user_id, tasks):
            await delete_all_session_tasks(user_id)
    else:
        tasks_in_session = await get_session_tasks(user_id)
        if await _save_tasks_to_db(user_id, tasks_in_session):
            await delete_all_session_tasks(user_id)

async def save_one_session_task(user_id: int, task_name: str):
    """Save a specific task for a user to the database and remove from session storage"""
    tasks = await get_session_tasks(user_id)
    task_to_save = next((t for t in tasks if t.get("task_name") == task_name), None)
    if not task_to_save:
        logging.error(f"Task '{task_name}' not found in session for user {user_id}.")
        return
    remaining_tasks = [t for t in tasks if t.get("task_name") != task_name]
    if await _save_tasks_to_db(user_id, [task_to_save]):
        await save_session_tasks(user_id, remaining_tasks)

async def _save_tasks_to_db(user_id: int, tasks: list) -> bool:
    """Save tasks to the database"""
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

async def get_calendar_plan_suggestions(prompt: str, tasks: List[dict]) -> str:
    with open(instructions_path, 'r', encoding='utf-8') as f:
        instructions = json.load(f)
    
    instruction = instructions.get('calendar_instruction', "")
    
    tasks_text = ""
    for t in tasks:
        tasks_text += (
            f"- Task ID: {t.get('task_id')}, "
            f"Type: {t.get('task_type', 'unknown')}, "
            f"Description: {t.get('description', 'No description')}, "
            f"Priority: {t.get('priority', 'medium')}, "
            f"Estimated Time: {t.get('estimated_time', 'unknown')}, "
        )
    
    contextualized_prompt = f"{instruction}\n\nUser's tasks:\n{tasks_text}\n\nUser request: {prompt}"
    response = chat_with_gemini(contextualized_prompt, "")
    
    return response

