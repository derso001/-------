from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from database import engine, Base, get_db
from models import TestDB

app = FastAPI(title="OS Explorer Test Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic-схеми для валідації вхідних даних
class TestCreate(BaseModel):
    meta: dict
    modules: list

# Створення таблиць при запуску (для прототипу ок, для продакшену юзають Alembic)
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        # await conn.run_sync(Base.metadata.drop_all) # Розкоментуй, якщо треба очистити БД
        await conn.run_sync(Base.metadata.create_all)

# 1. ЗБЕРЕГТИ НОВИЙ ТЕСТ (Конструктор)
@app.post("/api/tests/")
async def create_test(test_data: TestCreate, db: AsyncSession = Depends(get_db)):
    new_test = TestDB(
        meta_data=test_data.meta,
        modules=test_data.modules
    )
    db.add(new_test)
    await db.commit()
    await db.refresh(new_test)
    return {"status": "success", "test_id": new_test.id}

# 2. ОТРИМАТИ ТЕСТ (Для проходження учнем)
@app.get("/api/tests/{test_id}")
async def get_test(test_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TestDB).where(TestDB.id == test_id))
    test = result.scalars().first()
    
    if not test:
        raise HTTPException(status_code=404, detail="Тест не знайдено")
        
    return {
        "status": "success", 
        "data": {
            "meta": test.meta_data,
            "modules": test.modules
        }
    }