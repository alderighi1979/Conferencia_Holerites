import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings

from app.paths import DATA_DIR


class Settings(BaseSettings):
    """Permite sobrescrever via .env; em exe usa DATA_DIR."""
    database_url: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()

# Banco na pasta de dados (mesma do exe ou AppData) para evitar permissão negada
if settings.database_url:
    database_url = settings.database_url
else:
    db_path = os.path.join(DATA_DIR, "conferencia_folha.db")
    database_url = f"sqlite:///{db_path}"

engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False} if "sqlite" in database_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
