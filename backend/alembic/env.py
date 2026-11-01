"""Alembic environment. The database URL comes from app.config (DATABASE_URL), or from the Alembic config when set (used by tests)."""
from alembic import context
from sqlalchemy import engine_from_config, pool

from app import config as app_config
from app import models  # noqa: F401  (registers tables on Base.metadata)
from app.database import Base, ensure_sqlite_dir

cfg = context.config
url = cfg.get_main_option("sqlalchemy.url") or app_config.DATABASE_URL
cfg.set_main_option("sqlalchemy.url", url.replace("%", "%%"))
target_metadata = Base.metadata


def run_migrations_offline():
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    ensure_sqlite_dir(url)
    engine = engine_from_config(cfg.get_section(cfg.config_ini_section), prefix="sqlalchemy.", poolclass=pool.NullPool)
    with engine.connect() as conn:
        context.configure(connection=conn, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
