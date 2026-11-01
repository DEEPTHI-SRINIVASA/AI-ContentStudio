"""Request validation (pydantic). Invalid input returns HTTP 422 automatically."""
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class Strict(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)


class Brand(Strict):
    name: str = Field(max_length=60)
    tone: str = Field("", max_length=40)
    aud: str = Field("", max_length=120)
    vocab: str = Field("", max_length=160)
    avoid: str = Field("", max_length=160)


class GenerateIn(Strict):
    idea: str = Field(min_length=3, max_length=500)
    platform: str = Field(max_length=40)
    audience: str = Field("General audience", max_length=80)
    tone: str = Field("Friendly", max_length=40)
    language: Literal["English", "Hinglish"] = "English"
    length: Literal["Short", "Medium", "Long"] = "Medium"
    goal: str = Field("", max_length=60)
    keywords: str = Field("", max_length=200)
    cta: str = Field("", max_length=200)
    variations: int = Field(1, ge=1, le=5)
    brand: Optional[Brand] = None


class Variant(Strict):
    label: str = Field(max_length=60)
    prompt: str = Field(min_length=3, max_length=2000)


class ExperimentIn(Strict):
    system: str = Field("", max_length=2000)
    variants: list[Variant] = Field(min_length=1, max_length=6)


class ProjectIn(Strict):
    title: str = Field(min_length=1, max_length=120)
    platform: str = Field(max_length=40)
    text: str = Field(min_length=1, max_length=20000)


class ProjectOut(BaseModel):
    """Shape returned by GET /api/projects (built straight from the ORM row)."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    ts: float
    title: str
    platform: str
    text: str
