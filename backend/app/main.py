"""FastAPI app. Run from the backend folder: python -m uvicorn app.main:app --reload"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect

from . import ai_service, config
from .ai_service import AIUnavailable
from .database import engine
from .routers import analytics, generation, projects


@asynccontextmanager
async def lifespan(_):
    # Fail fast with a clear message if migrations have not been applied.
    if not inspect(engine).has_table("alembic_version"):
        raise RuntimeError("Database is not migrated. From the backend folder run: python -m alembic upgrade head")
    yield


app = FastAPI(title="ContentStudio AI", lifespan=lifespan)
app.include_router(generation.router)
app.include_router(projects.router)
app.include_router(analytics.router)


@app.exception_handler(AIUnavailable)
async def ai_down(_, e: AIUnavailable):
    # 503 tells the frontend to show its clearly labeled template fallback.
    return JSONResponse(status_code=503, content={"detail": {"code": "ai_unavailable", "message": str(e)}})


@app.get("/api/health", tags=["system"])
async def health():
    return {"ai": await ai_service.is_up(), "model": config.MODEL}


if config.FRONTEND_DIR.exists():  # mounted last so /api routes win
    app.mount("/", StaticFiles(directory=config.FRONTEND_DIR, html=True), name="frontend")
