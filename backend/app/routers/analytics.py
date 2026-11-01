"""Dashboard statistics, calculated from stored rows only."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import crud
from ..database import get_db

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/analytics")
def analytics(db: Session = Depends(get_db)):
    return crud.analytics(db)
