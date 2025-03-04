import aiosqlite
from database import DATABASE
import asyncio
from typing import Dict, Optional

session_users = {}
user_session_lock = asyncio.Lock()

async def save_user_session(user_id: int, user_data: dict):
    async with user_session_lock:
        session_users[user_id] = user_data

async def get_user_session(user_id: int) -> Optional[dict]:
    async with user_session_lock:
        return session_users.get(user_id)

async def delete_user_session(user_id: int) -> bool:
    async with user_session_lock:
        if user_id in session_users:
            del session_users[user_id]
            return True
        return False

async def authenticate_user(username: str, password: str) -> str:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            """SELECT user_id, username, email, learning_style, 
            completion_percentage, about_me, ava_url, password 
            FROM users WHERE username = ? AND password = ?""", 
            (username, password)
        )
        user = await cursor.fetchone()
        await cursor.close()
        
        if not user:
            return None
            
        user_data = {
            "user_id": user[0],
            "username": user[1],
            "email": user[2],
            "learning_style": user[3],
            "completion_percentage": user[4],
            "about_me": user[5],
            "ava_url": user[6]
        }
        
        await save_user_session(user[0], user_data)
        
        # Return user ID for backward compatibility
        return user[0]

async def register_user(username: str, password: str, email: str) -> str:
    async with aiosqlite.connect(DATABASE) as db:
        # Create the users table if it does not exist
        await db.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                learning_style TEXT,
                completion_percentage REAL DEFAULT 0,
                password TEXT NOT NULL,
                about_me TEXT,
                ava_url TEXT
            )
        ''')
        await db.commit()

        cursor = await db.execute("SELECT user_id FROM users WHERE username = ?", (username,))
        existing_user = await cursor.fetchone()
        if existing_user:
            await cursor.close()
            return None
        
        await db.execute("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", (username, password, email))
        await db.commit()
        
        cursor = await db.execute("SELECT user_id FROM users WHERE username = ?", (username,))
        new_user = await cursor.fetchone()
        await cursor.close()
        return new_user[0]
