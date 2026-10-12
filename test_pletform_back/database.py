import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Створюємо асинхронний двигун
engine = create_async_engine(DATABASE_URL, echo=True)

# Фабрика сесій для залежностей у FastAPI
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

# Функція для отримання сесії БД у ендпоінтах
async def get_db():
    async with async_session() as session:
        yield session