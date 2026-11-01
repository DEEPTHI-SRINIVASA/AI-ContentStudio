"""The ONLY module that talks to the local model (Ollama on localhost). No cloud calls."""
import time

import httpx

from . import config


class AIUnavailable(Exception):
    """Local model not reachable, errored, or returned nothing."""


async def is_up() -> bool:
    try:
        async with httpx.AsyncClient(timeout=2) as c:
            return (await c.get(f"{config.OLLAMA_URL}/api/tags")).status_code == 200
    except httpx.HTTPError:
        return False


async def chat(system: str, user: str) -> tuple[str, int]:
    """Return (text, milliseconds). Raises AIUnavailable on any failure."""
    msgs = ([{"role": "system", "content": system}] if system else []) + [{"role": "user", "content": user}]
    start = time.perf_counter()
    try:
        async with httpx.AsyncClient(timeout=config.TIMEOUT) as c:
            r = await c.post(f"{config.OLLAMA_URL}/api/chat", json={"model": config.MODEL, "messages": msgs, "stream": False})
            r.raise_for_status()
            text = (r.json().get("message", {}).get("content") or "").strip()
    except (httpx.HTTPError, ValueError) as e:
        raise AIUnavailable(f"Local model error: {e}") from e
    if not text:
        raise AIUnavailable("Local model returned an empty response")
    return text, int((time.perf_counter() - start) * 1000)
