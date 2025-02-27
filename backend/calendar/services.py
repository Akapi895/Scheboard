import aiosqlite
from database import DATABASE

# tested
async def get_tasks(user_id: int) -> list:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT * FROM tasks WHERE user_id = ?", (user_id,))
        tasks = await cursor.fetchall()
        await cursor.close()
        return tasks

# tested
async def get_task_detail(task_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT * FROM tasks WHERE task_id = ?", (task_id,))
        task = await cursor.fetchone()
        await cursor.close()
        return task

# tested
async def create_task(task: dict) -> int:
    async with aiosqlite.connect(DATABASE) as db:
        
        await db.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                task_id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_name TEXT NOT NULL,
                description TEXT,
                category TEXT,
                priority TEXT,
                status TEXT,
                estimated_time REAL,
                due_date DATETIME,
                task_type TEXT,
                user_id INTEGER,
                parent_task_id INTEGER
            )
        ''')
        await db.commit()
    
        cursor = await db.execute(
            '''
            INSERT INTO tasks (task_name, description, category, priority, status, estimated_time, due_date, task_type, user_id, parent_task_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                task["task_name"],
                task["description"],
                task["category"],
                task["priority"],
                task["status"],
                task["estimated_time"],
                task["due_date"],
                task["task_type"],
                task["user_id"],
                task.get("parent_task_id")
            )
        )
        await db.commit()
        
        cursor = await db.execute("SELECT last_insert_rowid()")
        new_task = await cursor.fetchone()
        await cursor.close()
        return new_task[0]
    

async def update_task(task_id: int, task: dict) -> None:
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute(
            '''
            UPDATE tasks
            SET task_name = ?, description = ?, category = ?, priority = ?, status = ?, estimated_time = ?, due_date = ?, task_type = ?, user_id = ?, parent_task_id = ?
            WHERE task_id = ?
            ''',
            (
                task["task_name"],
                task["description"],
                task["category"],
                task["priority"],
                task["status"],
                task["estimated_time"],
                task["due_date"],
                task["task_type"],
                task["user_id"],
                task.get("parent_task_id"),
                task_id
            )
        )
        await db.commit()


async def delete_task(task_id: int) -> None:
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute("DELETE FROM tasks WHERE task_id = ?", (task_id,))
        await db.commit()


async def update_task_status(task_id: int, status: str) -> None:
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute("UPDATE tasks SET status = ? WHERE task_id = ?", (status, task_id))
        await db.commit()