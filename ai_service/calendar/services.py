import aiosqlite
import asyncio
import logging
from database import DATABASE  # type: ignore

session_tasks = {}
session_lock = asyncio.Lock()

async def get_session_tasks(user_id: str):
    async with session_lock:
        return session_tasks.get(user_id, [])

async def save_session_tasks(user_id: str, tasks: list):
    async with session_lock:
        session_tasks[user_id] = tasks

async def delete_all_session_tasks(user_id: str):
    async with session_lock:
        session_tasks.pop(user_id, None)

async def delete_one_session_task(user_id: str, task_name: str):
    async with session_lock:
        tasks = session_tasks.get(user_id, [])
        session_tasks[user_id] = list(filter(lambda t: t.get("task_name") != task_name, tasks))
        logging.info(f"Deleted session task '{task_name}' for user {user_id}.")

async def _save_tasks_to_db(user_id: str, tasks: list) -> bool:
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

async def save_all_session_tasks(user_id: str):
    tasks = await get_session_tasks(user_id)
    if await _save_tasks_to_db(user_id, tasks):
        await delete_all_session_tasks(user_id)

async def save_one_session_task(user_id: str, task_name: str):
    async with session_lock:
        tasks = session_tasks.get(user_id, [])
        task_to_save = next((t for t in tasks if t.get("task_name") == task_name), None)
        if not task_to_save:
            logging.error(f"Task '{task_name}' not found in session for user {user_id}.")
            return

        remaining_tasks = [t for t in tasks if t.get("task_name") != task_name]

    if await _save_tasks_to_db(user_id, [task_to_save]):
        await save_session_tasks(user_id, remaining_tasks)
