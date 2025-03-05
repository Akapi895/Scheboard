import logging
import aiosqlite
import asyncio
from backend.database import DATABASE

# Create a new dictionary for session resources
session_resources = {}
session_lock = asyncio.Lock()
# We can reuse the existing session_lock for thread safety

async def get_session_resources(user_id: int):
    async with session_lock:
        return session_resources.get(user_id, [])

async def save_session_resources(user_id: int, resources: list):
    async with session_lock:
        session_resources[user_id] = resources

async def delete_all_session_resources(user_id: int) -> bool:
    async with session_lock:
        had_resources = user_id in session_resources
        session_resources.pop(user_id, None)
        return had_resources

async def delete_one_session_resource(user_id: int, resource_title: str):
    async with session_lock:
        resources = session_resources.get(user_id, [])
        original_length = len(resources)
        filtered_resources = [r for r in resources if r.get("title") != resource_title]
        
        if len(filtered_resources) == original_length:
            raise ValueError(f"Resource '{resource_title}' not found for user {user_id}")
            
        session_resources[user_id] = filtered_resources
        logging.info(f"Deleted session resource '{resource_title}' for user {user_id}.")

async def _save_resources_to_db(task_id: int, resources: list) -> bool:
    if not resources:
        return False

    try:
        async with aiosqlite.connect(DATABASE) as db:
            await db.executemany(
                """
                INSERT INTO resources (
                    task_id, type, title, url, tag
                )
                VALUES (?, ?, ?, ?, ?)
                """,
                [
                    (
                        task_id,
                        resource.get("type"),
                        resource.get("title"),
                        resource.get("url"),
                        resource.get("tag"),
                    )
                    for resource in resources
                ],
            )
            await db.commit()
            return True
    except Exception as e:
        logging.error(f"Error saving resources to database for task {task_id}: {e}", exc_info=True)
        return False

async def save_all_session_resources(user_id: int, task_id: int):
    try:
        # Get resources from session
        resources_in_session = await get_session_resources(user_id)
        
        if not resources_in_session:
            logging.info(f"No resources in session for user {user_id}")
            return {
                "success": False,
                "message": "No resources found in session",
                "count": 0
            }
            
        # Save to database
        if await _save_resources_to_db(task_id, resources_in_session):
            # Clear session after successful save
            await delete_all_session_resources(user_id)
            resource_count = len(resources_in_session)
            logging.info(f"Successfully saved {resource_count} resources for user {user_id}")
            return {
                "success": True,
                "message": f"Successfully saved {resource_count} resources",
                "count": resource_count
            }
        else:
            logging.error(f"Failed to save session resources for user {user_id}")
            return {
                "success": False,
                "message": "Database error while saving resources",
                "count": 0
            }
            
    except Exception as e:
        error_msg = str(e)
        logging.error(f"Error in save_all_session_resources for user {user_id}: {error_msg}", exc_info=True)
        return {
            "success": False,
            "message": f"Unexpected error: {error_msg}",
            "count": 0
        }