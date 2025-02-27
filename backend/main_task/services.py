from fastapi import HTTPException
import aiosqlite
from database import DATABASE

async def get_main_task_with_subtasks(user_id: int, main_task_id: int):
    async with aiosqlite.connect(DATABASE) as db:
        
        cursor = await db.execute(
            "SELECT task_id, task_name FROM tasks WHERE task_id = ? AND user_id = ?",
            (main_task_id, user_id),
        )
        main_task = await cursor.fetchone()
        await cursor.close()

        if not main_task:
            raise HTTPException(status_code=404, detail="Main task not found")

        main_task_data = {"task_id": main_task[0], "task_name": main_task[1]}

        cursor = await db.execute(
            "SELECT task_id, task_name FROM tasks WHERE parent_task_id IS NOT NULL",
            (main_task_id,),
        )
        tasks = await cursor.fetchall()
        await cursor.close()

        task_list = [{"task_id": row[0], "task_name": row[1]} for row in tasks]

        return {
            "main_task": main_task_data,
            "task": task_list
        }
