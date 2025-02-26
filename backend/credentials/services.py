import aiosqlite
from database import DATABASE

async def authenticate_user(username: str, password: str) -> str:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT user_id FROM users WHERE username = ? AND password = ?", (username, password))
        user = await cursor.fetchone()
        await cursor.close()
        if not user:
            return None
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
