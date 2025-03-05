import aiosqlite
from database import DATABASE
from .schemas import UpdateProfileRequest


async def get_user_profile(user_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute('''
            SELECT username, email, about_me, learning_style, ava_url
            FROM users WHERE user_id = ?
        ''', (user_id,))
        user = await cursor.fetchone()
        if not user:
            raise Exception("User not found")

        cursor = await db.execute('''
            SELECT task_id, status FROM tasks WHERE user_id = ?
        ''', (user_id,))
        tasks = await cursor.fetchall()
        await cursor.close()

        total_task = sum(1 for task in tasks if task[1] in ["inprogress", "todo"])
        completed_tasks = sum(1 for task in tasks if task[1] == "completed")
    
        completion_percentage = (completed_tasks / (total_task + completed_tasks)) * 100 if total_task > 0 else 0

    # Prepare the response data
    response_data = {
        "username": user[0],
        "total_task": total_task,
        "completion_percentage": completion_percentage,
        "email": user[1] if user[1] else "",
        "about_me": user[2] if user[2] else "",
        "learning_style": user[3] if user[3] else "",
        "ava_url": user[4] if user[4] else ""
    }

    return response_data

async def update_user_profile(update_request: UpdateProfileRequest) -> dict:
    query_parts = []
    params = []
    
    # Thêm các trường cần cập nhật vào câu lệnh SQL
    if update_request.ava_url is not None:
        query_parts.append("ava_url = ?")
        params.append(update_request.ava_url)
    
    if update_request.about_me is not None:
        query_parts.append("about_me = ?")
        params.append(update_request.about_me)
    
    if update_request.learning_style is not None:
        query_parts.append("learning_style = ?")
        params.append(update_request.learning_style)
    
    if update_request.password is not None and update_request.password != "":
        query_parts.append("password = ?")
        params.append(update_request.password)
    
    if not query_parts:
        # Không có gì để cập nhật
        return await get_user_profile(update_request.user_id)
    
    # Tạo câu lệnh SQL động
    query = f"UPDATE users SET {', '.join(query_parts)} WHERE user_id = ?"
    params.append(update_request.user_id)
    
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute(query, params)
        await db.commit()
        
        return await get_user_profile(update_request.user_id)