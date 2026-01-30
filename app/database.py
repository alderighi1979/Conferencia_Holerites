import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Permite sobrescrever via .env."""
    database_url: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

# Sempre usar get_data_dir() para ter um único lugar gravável (projeto ou AppData).
if settings.database_url and settings.database_url.strip():
    database_url = settings.database_url.strip()
else:
    from app.paths import get_data_dir
    data_dir = get_data_dir()
    os.makedirs(data_dir, exist_ok=True)
    db_path = os.path.join(data_dir, "conferencia_folha.db")
    database_url = f"sqlite:///{db_path.replace(os.sep, '/')}"

engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False} if "sqlite" in database_url else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
