from .models import User, Task

async def get_user_profile(user_id: str) -> dict:
    # Fetch user information from the database
    user = await User.find_one({"id": user_id})
    if not user:
        raise Exception("User not found")

    # Fetch tasks associated with the user
    tasks = await Task.find({"user_id": user_id}).to_list(length=None)
    
    # Calculate total_task and completion_percentage
    total_task = sum(1 for task in tasks if task.status in ["inprogress", "todo"])
    completed_tasks = sum(1 for task in tasks if task.status == "completed")
    total_tasks_ever = len(tasks)
    completion_percentage = (completed_tasks / total_tasks_ever) * 100 if total_tasks_ever > 0 else 0

    # Prepare the response data
    response_data = {
        "username": user.username,
        "total_task": total_task,
        "completion_percentage": completion_percentage,
        "email": user.email,
        "about_me": user.about_me,
        "learning_style": user.learning_style,
        "ava_url": user.ava_url
    }

    return response_data
