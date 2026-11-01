"""Database operations. Routers call these; they never write SQL themselves."""
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from .models import Experiment, Generation, Project


def add(db: Session, row):
    db.add(row)
    db.commit()
    return row


def add_generation(db: Session, **fields) -> Generation:
    return add(db, Generation(**fields))


def add_experiment(db: Session, **fields) -> Experiment:
    return add(db, Experiment(**fields))


def add_project(db: Session, **fields) -> Project:
    return add(db, Project(**fields))


def list_projects(db: Session) -> list[Project]:
    return list(db.scalars(select(Project).order_by(desc(Project.ts), desc(Project.id))))


def analytics(db: Session) -> dict:
    count = lambda model: db.scalar(select(func.count(model.id))) or 0
    rows = db.execute(
        select(Generation.platform, func.count().label("n")).group_by(Generation.platform).order_by(desc("n"), Generation.platform).limit(5)
    ).all()
    return {
        "generations": count(Generation),
        "projects": count(Project),
        "experiments": count(Experiment),
        "avg_ms": round(db.scalar(select(func.avg(Generation.ms))) or 0),
        "platforms": [{"platform": p, "n": n} for p, n in rows],
    }
