"""Settings. Everything is overridable with environment variables (no secrets in code)."""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]  # project root
ENV = os.getenv("APP_ENV", "dev")  # dev | prod
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")  # local runtime only
MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
TIMEOUT = float(os.getenv("AI_TIMEOUT", "120"))
# SQLite for local development. For PostgreSQL use e.g. postgresql+psycopg://user:pass@host:5432/dbname
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{(ROOT / 'data' / 'contentstudio.db').as_posix()}")
FRONTEND_DIR = ROOT / "frontend"
