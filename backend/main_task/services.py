from fastapi import HTTPException
import aiosqlite
from database import DATABASE

async def get_main_task_list(user_id: int, main_task_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            SELECT task_id, task_name
            FROM tasks
            WHERE user_id = ? AND task_id = ?
        ''', (user_id, main_task_id))
        main_task = await cursor.fetchone()

        if not main_task:
            raise HTTPException(status_code=404, detail="Main task not found")

        cursor = await db.execute('''
            SELECT task_id, task_name
            FROM tasks
            WHERE user_id = ? AND parent_task_id = ?
        ''', (user_id, main_task_id))
        tasks = await cursor.fetchall()
        await cursor.close()

        task_list = []
        for task in tasks:
            task_list.append({
                "task_id": task[0],
                "task_name": task[1]
            })

        return {
            "main_task": {
                "task_id": main_task[0],
                "task_name": main_task[1]
            },
            "task": task_list
        }

async def get_sub_task_list(user_id: int, main_task_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            SELECT task_id, task_name
            FROM tasks
            WHERE user_id = ? AND parent_task_id = ?
        ''', (user_id, main_task_id))
        tasks = await cursor.fetchall()
        await cursor.close()

        task_list = []
        for task in tasks:
            task_list.append({
                "task_id": task[0],
                "task_name": task[1]
            })

        return task_list
    
async def detail_subtask(task_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            SELECT 
                task_id, task_name, task_type, 
                description, category, priority, 
                status, estimated_time, due_date, parent_task_id
            FROM tasks
            WHERE task_id = ?
        ''', (task_id,))
        task = await cursor.fetchone()
        await cursor.close()

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        task_detail = {
            "task_id": task[0],
            "task_name": task[1],
            "task_type": task[2],
            "description": task[3],
            "category": task[4],
            "priority": task[5],
            "status": task[6],
            "estimated_time": task[7],
            "due_date": task[8],
            "parent_task_id": task[9]
        }

        return task_detail