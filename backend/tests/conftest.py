"""Shared fixtures: every test gets its own throwaway SQLite database."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app import database
from app.main import app


@pytest.fixture()
def db_engine(tmp_path):
    engine = database.make_engine(f"sqlite:///{(tmp_path / 'test.db').as_posix()}")
    database.Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture()
def session(db_engine):
    s = sessionmaker(bind=db_engine, expire_on_commit=False)()
    yield s
    s.close()


@pytest.fixture()
def client(db_engine):
    factory = sessionmaker(bind=db_engine, autoflush=False, expire_on_commit=False)

    def override():
        s = factory()
        try:
            yield s
        finally:
            s.close()

    app.dependency_overrides[database.get_db] = override
    yield TestClient(app)  # no "with": skips the startup migration check
    app.dependency_overrides.clear()
