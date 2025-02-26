from ..models.user import User
from ..models.task import Task

async def get_user_profile(user_id: str) -> dict:
    # Fetch user information from the database
    user = await User.find_one({"id": user_id})
    if not user:
        raise Exception("User not found")

    # Fetch tasks associated with the user
    tasks = await Task.find({"user_id": user_id}).to_list(length=None)
    total_task = len(tasks)
    completion_percentage = user.completion_percentage

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
