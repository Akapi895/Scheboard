from datetime import datetime, timedelta
import aiosqlite
from database import DATABASE
from .schemas import EditTaskRequest

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
        if total_tasks == 0:
            # Trả về giá trị mặc định nếu không có task
            return {
                "study_percent": 25,
                "work_percent": 25,
                "health_percent": 25,
                "leisure_percent": 25
            }

        piechart_data = {
            "study_percent": 0,
            "work_percent": 0,
            "health_percent": 0,
            "leisure_percent": 0
        }

        # Tính phần trăm cho ba loại đầu tiên
        for task in tasks:
            category = task[0].lower() if task[0] else "other"
            count = task[1]
            percent = round((count / total_tasks) * 100, 1)  # Làm tròn đến 2 chữ số thập phân
            
            if category == "study":
                piechart_data["study_percent"] = percent
            elif category == "work":
                piechart_data["work_percent"] = percent
            elif category == "health":
                piechart_data["health_percent"] = percent
            elif category == "leisure":
                piechart_data["leisure_percent"] = percent

        # Tính leisure bằng phần còn lại để đảm bảo tổng bằng 100%
        total_other_categories = piechart_data["study_percent"] + piechart_data["work_percent"] + piechart_data["health_percent"]
        piechart_data["leisure_percent"] = round(100 - total_other_categories, 2)
        
        # Xử lý trường hợp đặc biệt nếu leisure < 0 do lỗi làm tròn
        if piechart_data["leisure_percent"] < 0:
            piechart_data["leisure_percent"] = 0
            
        # Đảm bảo tổng chính xác là 100% (điều chỉnh giá trị lớn nhất nếu cần)
        total = sum(piechart_data.values())
        if total != 100:
            # Tìm giá trị lớn nhất để điều chỉnh
            max_category = max(piechart_data, key=piechart_data.get)
            piechart_data[max_category] += round(100 - total, 1)

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
            return {"completed": 33, "inprogress": 33, "todo": 34}

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
            donutchart_data[key] = round((donutchart_data[key] / total_tasks) * 100, 1)

        sum_percent = sum(donutchart_data.values())
        if sum_percent != 100:
            max_category = max(donutchart_data, key=donutchart_data.get)
            donutchart_data[max_category] += 100 - sum_percent

        return donutchart_data

async def delete_task(user_id: int, task_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            DELETE FROM tasks WHERE user_id = ? AND task_id = ?
        ''', (user_id, task_id))
        await db.commit()
        return cursor.rowcount > 0

async def complete_task(user_id: int, task_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            UPDATE tasks SET status = 'completed' 
            WHERE user_id = ? AND task_id = ?
        ''', (user_id, task_id))
        await db.commit()
        return cursor.rowcount > 0
    
async def detail_task(user_id: int, task_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            SELECT 
                task_id, task_name, task_type, 
                description, category, priority, 
                status, estimated_time, due_date, parent_task_id
            FROM tasks
            WHERE user_id = ? AND task_id = ?
        ''', (user_id, task_id))
        task = await cursor.fetchone()
        await cursor.close()

        if not task:
            raise Exception("Task not found")

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
    
async def edit_task(edit_task_request: EditTaskRequest) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute('''
            UPDATE tasks
            SET task_name = ?, description = ?, priority = ?, 
            status = ?, estimated_time = ?, due_date = ?
            WHERE task_id = ?
        ''', (
            edit_task_request.task_name,
            edit_task_request.description,
            edit_task_request.priority,
            edit_task_request.status,
            edit_task_request.estimated_time,
            edit_task_request.due_date,
            edit_task_request.task_id
        ))
        await db.commit()

        cursor = await db.execute('''
            SELECT task_id, task_name, description, priority, due_date
            FROM tasks
            WHERE task_id = ?
        ''', (edit_task_request.task_id,))
        task = await cursor.fetchone()
        await cursor.close()

        if not task:
            raise Exception("Task not found")

        edited_task = {
            "task_id": task[0],
            "task_name": task[1],
            "description": task[2],
            "priority": task[3],
            "due_date": task[4]
        }

        return edited_task

async def upcoming_task(user_id: int) -> list[dict]:
    async with aiosqlite.connect(DATABASE) as db:
        today = datetime.now().strftime("%Y-%m-%d")
        cursor = await db.execute('''
            SELECT task_id, task_name, task_type, description, priority, due_date
            FROM tasks
            WHERE user_id = ? AND DATE(due_date) = DATE(?)
            AND status IS NOT 'completed'
        ''', (user_id, today))
        tasks = await cursor.fetchall()
        await cursor.close()

        overall_tasks = []
        for task in tasks:
            overall_tasks.append({
                "task_id": task[0],
                "task_name": task[1],
                "task_type": task[2],
                "description": task[3],
                "priority": task[4],
                "due_date": task[5]
            })

        return overall_tasks