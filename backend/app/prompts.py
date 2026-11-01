"""Prompt construction, kept separate from the model call so it is easy to study and test."""
from .schemas import GenerateIn

LENGTH = {"Short": "under 60 words", "Medium": "about 100 words", "Long": "about 200 words"}
ANGLES = ["a safe, clear angle", "a bold, attention-grabbing angle", "a playful, humorous angle", "a story-led angle", "a data-led angle"]


def build(req: GenerateIn, n: int) -> tuple[str, str]:
    system = ["You are a marketing copywriter. Output only the finished content, no preamble."]
    if req.brand:
        b = req.brand
        system.append(f"Write as the brand '{b.name}'. Tone: {b.tone or req.tone}. Audience: {b.aud or req.audience}.")
        if b.vocab:
            system.append(f"Prefer these words: {b.vocab}.")
        if b.avoid:
            system.append(f"Never use these words: {b.avoid}.")
    user = [
        f"Write a {req.platform} about: {req.idea}.",
        f"Audience: {req.audience}. Tone: {req.tone}. Language: {req.language}. Length: {LENGTH[req.length]}.",
        f"Use {ANGLES[n % len(ANGLES)]}.",
    ]
    if req.goal:
        user.append(f"Goal: {req.goal}.")
    if req.keywords:
        user.append(f"Include these keywords naturally: {req.keywords}.")
    if req.cta:
        user.append(f"End with this call to action: {req.cta}.")
    return " ".join(system), " ".join(user)
