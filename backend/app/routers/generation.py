"""AI endpoints for content generation and prompt experiments."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import ai_service, config, crud, prompts
from ..database import get_db
from ..schemas import ExperimentIn, GenerateIn

router = APIRouter(prefix="/api", tags=["ai"])


@router.post("/generate")
async def generate(
    req: GenerateIn,
    db: Session = Depends(get_db),
):
    """Generate content variations and record their statistics."""

    out = []

    for n in range(req.variations):
        system, user = prompts.build(req, n)

        text, ms = await ai_service.chat(system, user)

        crud.add_generation(
            db,
            platform=req.platform,
            tone=req.tone,
            language=req.language,
            ms=ms,
            chars=len(text),
            model=config.MODEL,
        )

        out.append({
            "text": text,
            "ms": ms,
        })

    return {
        "variations": out,
        "model": config.MODEL,
    }


@router.post("/prompts/experiment")
async def experiment(
    req: ExperimentIn,
    db: Session = Depends(get_db),
):
    """Compare prompt variants and record their results."""

    results = []

    for v in req.variants:
        text, ms = await ai_service.chat(
            req.system,
            v.prompt,
        )

        crud.add_experiment(
            db,
            label=v.label,
            prompt=v.prompt,
            output=text,
            ms=ms,
            model=config.MODEL,
        )

        results.append({
            "label": v.label,
            "output": text,
            "ms": ms,
        })

    return {
        "results": results,
        "model": config.MODEL,
    }
