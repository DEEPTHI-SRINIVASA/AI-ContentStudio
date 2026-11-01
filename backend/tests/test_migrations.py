"""Alembic migrations: they must build the schema, keep old data, and match the ORM models."""
import sqlite3
from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, inspect

from app import models  # noqa: F401
from app.database import Base

BACKEND = Path(__file__).resolve().parents[1]


def upgrade(url):
    cfg = Config(str(BACKEND / "alembic.ini"))
    cfg.set_main_option("script_location", str(BACKEND / "alembic"))
    cfg.set_main_option("sqlalchemy.url", url)
    command.upgrade(cfg, "head")


def test_upgrade_builds_schema_matching_models(tmp_path):
    url = f"sqlite:///{(tmp_path / 'm.db').as_posix()}"
    upgrade(url)
    insp = inspect(create_engine(url))
    assert "alembic_version" in insp.get_table_names()
    for table in Base.metadata.sorted_tables:  # guards against models and migrations drifting apart
        assert {c["name"] for c in insp.get_columns(table.name)} == {c.name for c in table.columns}


def test_upgrade_keeps_data_in_legacy_database(tmp_path):
    path = tmp_path / "legacy.db"
    c = sqlite3.connect(path)  # schema exactly as the old hand-written db.py created it
    c.executescript("""CREATE TABLE generations(id INTEGER PRIMARY KEY, ts REAL, platform TEXT, tone TEXT, language TEXT, ms INTEGER, chars INTEGER, model TEXT);
    CREATE TABLE experiments(id INTEGER PRIMARY KEY, ts REAL, label TEXT, prompt TEXT, output TEXT, ms INTEGER, model TEXT);
    CREATE TABLE projects(id INTEGER PRIMARY KEY, ts REAL, title TEXT, platform TEXT, text TEXT);
    INSERT INTO generations(ts,platform,tone,language,ms,chars,model) VALUES(1,'Email','Bold','English',17161,200,'llama3.2');""")
    c.commit(); c.close()
    upgrade(f"sqlite:///{path.as_posix()}")
    c = sqlite3.connect(path)
    assert c.execute("SELECT platform, ms FROM generations").fetchall() == [("Email", 17161)]
    assert c.execute("SELECT version_num FROM alembic_version").fetchone()[0] == "0001"
