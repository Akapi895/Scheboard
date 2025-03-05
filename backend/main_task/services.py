from fastapi import HTTPException
import aiosqlite
from database import DATABASE
from .schemas import SubTaskCreateRequest, TaskUpdateRequest, StatusUpdateRequest, UploadResourceRequest

# Task


async def get_main_tasks_name(user_id: int) -> list[dict]:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            SELECT task_id, task_name
            FROM tasks
            WHERE user_id = ? AND task_type = ?
        ''', (user_id, "maintask"))
        main_tasks = await cursor.fetchall()
        await cursor.close()

        main_task_list = []
        for task in main_tasks:
            main_task_list.append(
                {
                    "task_id": task[0],
                    "task_name": task[1]
                }
            )

        return main_task_list

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

        return {"tasks": task_list}
    
async def get_subtask_details(task_id: int) -> dict:
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
    
async def create_sub_task(subtask_request: SubTaskCreateRequest) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            INSERT INTO tasks (
                user_id, task_name, task_type, 
                description, category, priority, 
                status, estimated_time, due_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            subtask_request.user_id, subtask_request.task_name, "subtask",
            subtask_request.description, subtask_request.category, subtask_request.priority,
            subtask_request.status, subtask_request.estimated_time, subtask_request.due_date
        ))
        await db.commit()
        await cursor.close()

        return {
            "task_id": cursor.lastrowid,
            "task_name": subtask_request.task_name,
            "task_type": "subtask",
            "description": subtask_request.description,
            "category": subtask_request.category,
            "priority": subtask_request.priority,
            "status": subtask_request.status,
            "estimated_time": subtask_request.estimated_time,
            "due_date": subtask_request.due_date
        }
    
async def user_update_task(update_task_request: TaskUpdateRequest) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute('''
            UPDATE tasks
            SET task_name = ?, description = ?, 
            category = ?, priority = ?, status = ?, 
            estimated_time = ?, due_date = ?
            WHERE task_id = ? AND user_id = ?
        ''', (
            update_task_request.task_name,
            update_task_request.description,
            update_task_request.category,
            update_task_request.priority,
            update_task_request.status,
            update_task_request.estimated_time,
            update_task_request.due_date,
            update_task_request.task_id,
            update_task_request.user_id
        ))
        await db.commit()

        cursor = await db.execute('''
            SELECT task_id, task_name, task_type, description, 
            category, priority, status, estimated_time, due_date
            FROM tasks
            WHERE task_id = ? AND user_id = ?
        ''', (update_task_request.task_id, update_task_request.user_id))
        task = await cursor.fetchone()
        await cursor.close()

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        updated_task = {
            "task_id": task[0],
            "task_name": task[1],
            "task_type": task[2],
            "description": task[3],
            "category": task[4],
            "priority": task[5],
            "status": task[6],
            "estimated_time": task[7],
            "due_date": task[8]
        }

        return updated_task
    
async def user_delete_subtask(user_id: int, task_id: int):
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("DELETE FROM tasks WHERE task_id = ? AND user_id = ?", (task_id, user_id))
        await db.commit()
        await cursor.close()

async def update_subtask_status(subtask_request: StatusUpdateRequest):
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute('''
            UPDATE tasks
            SET status = ?
            WHERE task_id = ? AND user_id = ?
        ''', (subtask_request.status, subtask_request.task_id, subtask_request.user_id))
        await db.commit()

# Resource
async def delete_task_resource(task_id: int, resource_id: int):
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("DELETE FROM resources WHERE resource_id = ? AND task_id = ?", (resource_id, task_id))
        await db.commit()
        await cursor.close()

async def get_task_resources(task_id: int) -> list[dict]:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            SELECT resource_id, title, type, url, tag, task_id
            FROM resources
            WHERE task_id = ?
        ''', (task_id,))
        resources = await cursor.fetchall()
        await cursor.close()

        resource_list = []
        for resource in resources:
            resource_list.append({
                "resource_id": resource[0],
                "title": resource[1],
                "type": resource[2],
                "url": resource[3],
                "tag": resource[4],
                "task_id": resource[5]
            })

        return resource_list
    
async def upload_task_resources(upload_request: list[UploadResourceRequest]):
        async with aiosqlite.connect(DATABASE) as db:
            for resource in upload_request:
                await db.execute('''
                    INSERT INTO resources (task_id, type, title, url, tag)
                    VALUES (?, ?, ?, ?, ?)
                ''', (
                    resource.task_id,
                    resource.type,
                    resource.title,
                    resource.url,
                    resource.tag
                ))
            await db.commit()
