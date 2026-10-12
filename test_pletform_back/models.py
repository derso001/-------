from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from database import Base
import datetime
import uuid

class TestDB(Base):
    __tablename__ = "tests"

    # Згенеруємо унікальний ID типу "test_8f7d9a"
    id = Column(String, primary_key=True, default=lambda: f"test_{uuid.uuid4().hex[:6]}")
    teacher_id = Column(String, index=True, nullable=True) # Поки що без авторизації
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Використовуємо JSONB - суперсила Postgres!
    meta_data = Column(JSONB, nullable=False)
    modules = Column(JSONB, nullable=False)