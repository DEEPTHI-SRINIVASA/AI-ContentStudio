"""Database engine and session handling (SQLAlchemy 2.0)."""
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from . import config


class Base(DeclarativeBase):
    """All ORM models inherit from this."""


def ensure_sqlite_dir(url: str) -> None:
    u = make_url(url)
    if u.get_backend_name() == "sqlite" and u.database and u.database != ":memory:":
        Path(u.database).parent.mkdir(parents=True, exist_ok=True)


def make_engine(url: str):
    ensure_sqlite_dir(url)
    args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, connect_args=args, pool_pre_ping=True)


engine = make_engine(config.DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db():
    """FastAPI dependency: one session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
