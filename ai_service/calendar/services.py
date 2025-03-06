import os
import json
import aiosqlite
import asyncio
import logging
import re
import json
from typing import List, Optional
from dotenv import load_dotenv
from backend.database import DATABASE
from ai_service.gemini import chat_with_gemini

load_dotenv()

instructions_path = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
    'instructions.json'
)


session_tasks = {}
session_lock = asyncio.Lock()

async def get_calendar_plan_suggestions(prompt: str, tasks: List[dict], user_id: int) -> str:
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
    instruction_a = instructions.get('instruction_2')
    instruction_b = instructions.get('instruction_3')

    instruction = instruction_a + instruction_b

    response = chat_with_gemini(combined_text, instruction)
    
    # Extract tasks from response and save to session
    extracted_tasks = await extract_tasks_from_response(response, user_id)
    print("extracted_tasks: ", extracted_tasks)
    
    # Save extracted tasks to session
    if user_id is not None:
        print(user_id)
        await save_session_tasks(user_id, extracted_tasks)
    await save_all_session_tasks(user_id) #mtran hiện hồn đi 
    
    # Remove JSON blocks from response
    cleaned_response = re.sub(r"```json\s*\{.*?\}\s*```", "", response, flags=re.DOTALL)
    cleaned_response = re.sub(r'\n{3,}', '\n\n', cleaned_response)
    
    return cleaned_response

async def get_session_tasks(user_id: int):
    async with session_lock:
        return session_tasks.get(user_id, [])

async def save_session_tasks(user_id: int, tasks: list):
        async with session_lock:
        # Ensure every task has the user_id
            for task in tasks:
                task['user_id'] = user_id
                
            session_tasks[user_id] = tasks
            logging.info(f"Saved {len(tasks)} tasks to session for user {user_id}")

async def delete_all_session_tasks(user_id: int) -> bool:
    async with session_lock:
        had_tasks = user_id in session_tasks
        session_tasks.pop(user_id, None)
        return had_tasks

async def delete_one_session_task(user_id: int, task_name: str):
    async with session_lock:
        tasks = session_tasks.get(user_id, [])
        original_length = len(tasks)
        filtered_tasks = [t for t in tasks if t.get("task_name") != task_name]
        
        if len(filtered_tasks) == original_length:
            raise ValueError(f"Task '{task_name}' not found for user {user_id}")
            
        session_tasks[user_id] = filtered_tasks
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

async def save_all_session_tasks(user_id: int):
    try:
        # Get tasks from session
        tasks_in_session = await get_session_tasks(user_id)

        # print(tasks_in_session)
        
        if not tasks_in_session:
            logging.info(f"No tasks in session for user {user_id}")
            return {
                "success": False,
                "message": "No tasks found in session",
                "count": 0
            }
            
        # Save to database
        if await _save_tasks_to_db(user_id, tasks_in_session):
            # Clear session after successful save
            await delete_all_session_tasks(user_id)
            task_count = len(tasks_in_session)
            logging.info(f"Successfully saved {task_count} tasks for user {user_id}")
            return {
                "success": True,
                "message": f"Successfully saved {task_count} tasks",
                "count": task_count
            }
        else:
            logging.error(f"Failed to save session tasks for user {user_id}")
            return {
                "success": False,
                "message": "Database error while saving tasks",
                "count": 0
            }
            
    except Exception as e:
        error_msg = str(e)
        logging.error(f"Error in save_all_session_tasks for user {user_id}: {error_msg}", exc_info=True)
        return {
            "success": False,
            "message": f"Unexpected error: {error_msg}",
            "count": 0
        }

async def save_one_session_task(user_id: int, task_name: str):
    async with session_lock:
        tasks = session_tasks.get(user_id, [])
        task_to_save = next((t for t in tasks if t.get("task_name") == task_name), None)
        if not task_to_save:
            error_msg = f"Task '{task_name}' not found in session for user {user_id}."
            logging.error(error_msg)

            raise ValueError(error_msg)

        remaining_tasks = [t for t in tasks if t.get("task_name") != task_name]

    # Lưu xuống DB
    if await _save_tasks_to_db(user_id, [task_to_save]):
        # Xóa task vừa lưu khỏi session
        await save_session_tasks(user_id, remaining_tasks)
        return True
    else:
        raise ValueError(f"Failed to save task '{task_name}' to database")

async def extract_tasks_from_response(response: str, user_id: int = None) -> List[dict]:
    """
    Extracts JSON task objects from an AI response that contains formatted code blocks.
    
    Args:
        response: The AI response string containing JSON task blocks
        user_id: The user ID to add to each task
        
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
                
            # Add user_id if provided
            if user_id is not None:
                task["user_id"] = user_id
                
            tasks.append(task)
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse task JSON: {e}")
            continue
    
    return tasks

# Lay mood va learning style o day
session_moods = {}

async def get_mood_from_session(user_id: int):
    async with session_lock:
        return session_moods.get(user_id)

session_learning_style = {}    

async def get_learning_style_from_session(user_id: int):
    async with session_lock:
        return session_learning_style.get(user_id)