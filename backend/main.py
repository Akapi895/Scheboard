import sys
import os
from fastapi import FastAPI
from credentials.controllers import router as credentials_router
from calendar.controllers import router as calendar_router

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI()

app.include_router(credentials_router, prefix="/api/credentials")
app.include_router(calendar_router, prefix="/api/calendar")

# async def drop_all_tables():
#     async with aiosqlite.connect(DATABASE) as db:
#         async with db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'") as cursor:
#             tables = await cursor.fetchall()
#             for (table_name,) in tables:
#                 await db.execute(f"DROP TABLE IF EXISTS {table_name}")
#         await db.commit()

# @app.on_event("startup")
# async def startup_event():
#     await drop_all_tables()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
