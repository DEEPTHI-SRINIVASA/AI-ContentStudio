"""ORM models = the database tables. Change these, then create a migration (see README)."""
import time

from sqlalchemy import Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Generation(Base):
    __tablename__ = "generations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ts: Mapped[float] = mapped_column(Float, default=time.time)
    platform: Mapped[str] = mapped_column(String(40))
    tone: Mapped[str] = mapped_column(String(40))
    language: Mapped[str] = mapped_column(String(20))
    ms: Mapped[int] = mapped_column(Integer)
    chars: Mapped[int] = mapped_column(Integer)
    model: Mapped[str] = mapped_column(String(80))


class Experiment(Base):
    __tablename__ = "experiments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ts: Mapped[float] = mapped_column(Float, default=time.time)
    label: Mapped[str] = mapped_column(String(60))
    prompt: Mapped[str] = mapped_column(Text)
    output: Mapped[str] = mapped_column(Text)
    ms: Mapped[int] = mapped_column(Integer)
    model: Mapped[str] = mapped_column(String(80))


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ts: Mapped[float] = mapped_column(Float, default=time.time)
    title: Mapped[str] = mapped_column(String(120))
    platform: Mapped[str] = mapped_column(String(40))
    text: Mapped[str] = mapped_column(Text)
