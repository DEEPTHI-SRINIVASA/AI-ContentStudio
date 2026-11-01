"""Saved content endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db
from ..schemas import ProjectIn, ProjectOut

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    return crud.list_projects(db)


@router.post("", status_code=201)
def create_project(p: ProjectIn, db: Session = Depends(get_db)):
    return {"id": crud.add_project(db, title=p.title, platform=p.platform, text=p.text).id}
