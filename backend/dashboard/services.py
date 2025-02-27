from datetime import datetime, timedelta
import aiosqlite
from database import DATABASE

async def update_user_mood(user_id: int, mood: str) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute('''
            UPDATE users
            SET mood = ?
            WHERE user_id = ?
        ''', (mood, user_id))
        await db.commit()

        cursor = await db.execute('''
            SELECT mood FROM users WHERE user_id = ?
        ''', (user_id,))
        user = await cursor.fetchone()
        await cursor.close()

        if not user:
            raise Exception("User not found")

        return {"mood": user[0]}
    
async def get_dashboard_data(user_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            SELECT COUNT(*) FROM tasks WHERE user_id = ? AND task_type = 'maintask'
        ''', (user_id,))
        total_main_task = await cursor.fetchone()
        
        now = datetime.now()
        today = now.strftime("%Y-%m-%d")
        cursor = await db.execute('''
            SELECT COUNT(*) FROM tasks WHERE user_id = ? 
            AND DATE(due_date) = DATE(?) AND task_type = 'subtask'
        ''', (user_id, today))
        today_task_cnt = await cursor.fetchone()
        
        cursor = await db.execute('''
            SELECT mood FROM users WHERE user_id = ?
        ''', (user_id,))
        mood = await cursor.fetchone()
        await cursor.close()

        if not total_main_task or not today_task_cnt or not mood:
            raise Exception("User or tasks not found")

        return {
            "total_main_task": total_main_task[0],
            "today_task_cnt": today_task_cnt[0],
            "mood": mood[0]
        }
    
async def get_barchart_data(user_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        today = datetime.now()
        start_of_week = today - timedelta(days=today.weekday())
        end_of_week = start_of_week + timedelta(days=7)

        cursor = await db.execute('''
            SELECT DATE(due_date), COUNT(*) FROM tasks
            WHERE user_id = ? AND status = 'completed' 
            AND DATE(due_date) >= DATE(?) AND DATE(due_date) < DATE(?)
            GROUP BY DATE(due_date)
        ''', (user_id, start_of_week.strftime("%Y-%m-%d"), end_of_week.strftime("%Y-%m-%d")))
        tasks = await cursor.fetchall()
        await cursor.close()

        days_of_week = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        barchart_data = {day: 0 for day in days_of_week}

        for task in tasks:
            task_date = datetime.strptime(task[0], "%Y-%m-%d")
            day_of_week = days_of_week[task_date.weekday()]
            barchart_data[day_of_week] = task[1]

        return barchart_data
    
async def get_piechart_data(user_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            SELECT category, COUNT(*) FROM tasks
            WHERE user_id = ? AND status IS NOT 'completed'
            GROUP BY category
        ''', (user_id,))
        tasks = await cursor.fetchall()
        await cursor.close()

        total_tasks = sum(task[1] for task in tasks)
        print(total_tasks)
        if total_tasks == 0:
            raise Exception("No completed tasks found")

        piechart_data = {
            "study_percent": 0,
            "work_percent": 0,
            "health_percent": 0,
            "leisure_percent": 0
        }

        for task in tasks:
            category = task[0]
            count = task[1]
            percent = (count / total_tasks) * 100
            if category == "study":
                piechart_data["study_percent"] = percent
            elif category == "work":
                piechart_data["work_percent"] = percent
            elif category == "health":
                piechart_data["health_percent"] = percent
            elif category == "leisure":
                piechart_data["leisure_percent"] = percent

        return piechart_data
    
async def get_donutchart_data(user_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor = await db.execute('''
            SELECT status, due_date FROM tasks 
            WHERE user_id = ? 
            AND (status != 'completed' OR DATE(due_date) = DATE('now'))
        ''', (user_id,))
        tasks = await cursor.fetchall()

        total_tasks = len(tasks)
        if total_tasks == 0:
            return {"completed": 0, "inprogress": 0, "todo": 0}

        donutchart_data = {"completed": 0, "inprogress": 0, "todo": 0}

        for status, due_date in tasks:
            if due_date: 
                due_date = datetime.strptime(due_date, "%Y-%m-%d %H:%M:%S")

            if status == "completed":
                donutchart_data["completed"] += 1  # Hoàn thành
            elif status != "completed" and due_date < datetime.now():
                donutchart_data["inprogress"] += 1  # Quá hạn chưa hoàn thành
            elif status != "completed" and due_date >= datetime.now():
                donutchart_data["todo"] += 1  # Chưa đến hạn

        for key in donutchart_data:
            donutchart_data[key] = (donutchart_data[key] / total_tasks) * 100

        return donutchart_data

