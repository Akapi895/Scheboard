import logging
import aiosqlite
import asyncio
from backend.database import DATABASE
from ai_service.gemini import chat_with_gemini
from typing import List, Dict, Any
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

async def delete_session_resources(user_id: int) -> bool:
    """Alias for delete_all_session_resources for backwards compatibility."""
    return await delete_all_session_resources(user_id)

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
    

from typing import List, Dict, Any
from ai_service.chatbot.services import get_chat_response

async def generate_and_save_resource_suggestions(user_id: int, task_id: int):
    try:
        # Get task details from database
        async with aiosqlite.connect(DATABASE) as db:
            cursor = await db.execute('''
                SELECT task_name, description
                FROM tasks
                WHERE task_id = ?
            ''', (task_id,))
            task = await cursor.fetchone()
            
            if not task:
                raise ValueError(f"Task with ID {task_id} not found")
            
            task_name, description = task
        
        # Create prompt with fetched task details
        prompt = (
            f"Vui lòng đề xuất 5 nguồn học tập chất lượng cao cho task sau:\n"
            f"Task: {task_name}\n"
            f"Description: {description or 'No description provided'}\n\n"
            f"Đối với mỗi nguồn tài nguyên, hãy cung cấp thông tin sau theo đúng định dạng này:\n"
            f"Type: [video/article/book/course/tutorial]\n"
            f"Title: [descriptive title]\n"
            f"URL: [working URL to access the resource]\n"
            f"Tag: [primary topic or skill covered]\n\n"
            f"Hãy đảm bảo tất cả các tài nguyên được đề xuất đều có liên quan trực tiếp đến nhiệm vụ."
        )
        ai_response = await get_chat_response(user_id, prompt)
        resources = parse_resources_from_ai_response(ai_response)
        await save_session_resources(user_id, resources)
        
        return {
            "success": True,
            "message": f"Generated {len(resources)} resource suggestions",
            "resources": resources
        }
    except Exception as e:
        logging.error(f"Error generating resource suggestions for user {user_id}, task {task_id}: {e}", exc_info=True)
        return {
            "success": False,
            "message": f"Failed to generate resources: {str(e)}",
            "resources": []
        }

def parse_resources_from_ai_response(response: str) -> List[Dict[str, str]]:
    resources = []
    lines = response.split('\n')
    current_resource = {}
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.lower().startswith("type:"):
            # If we were building a resource, add it to our list
            if current_resource and all(k in current_resource for k in ["type", "title", "url", "tag"]):
                resources.append(current_resource)
                current_resource = {}
            current_resource["type"] = line[5:].strip()
        elif line.lower().startswith("title:"):
            if current_resource:
                current_resource["title"] = line[6:].strip()
        elif line.lower().startswith("url:"):
            if current_resource:
                current_resource["url"] = line[4:].strip()
        elif line.lower().startswith("tag:"):
            if current_resource:
                current_resource["tag"] = line[4:].strip()
    
    if current_resource and all(k in current_resource for k in ["type", "title", "url", "tag"]):
        resources.append(current_resource)
    
    return resources
