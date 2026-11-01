# ContentStudio AI

Content creation app with a **local-model** backend (FastAPI + SQLite + Ollama) and a single-page frontend. No cloud AI, no API keys, no external network calls.

## What is real and what is not
| Part | Status |
|---|---|
| Text generation and prompt experiments | **Real local model** via Ollama when it is running |
| If Ollama is not reachable | A **template fallback** runs and every output is labeled "Template fallback, not AI" |
| Quality scores (readability, SEO, grammar, engagement, keywords) | **Heuristic estimates**, never model output, never engagement predictions |
| Generations, experiments, projects, timing | Stored in **SQLite** (`data/contentstudio.db`) |
| Browser data (drafts, versions, brand profile, calendar, prompts) | **localStorage** in your browser |
| Image and video generation | Not included. A canvas thumbnail maker works offline |
| Login / multiple users | Not implemented. Single local user |

## Setup (one-time, needs internet only to download)
1. Install **Python 3.10+** and **Ollama** (https://ollama.com).
2. Download a model once: `ollama pull llama3.2` (any model works; set `OLLAMA_MODEL`).
3. In the project folder:
   ```
   python -m venv .venv
   .venv\Scripts\activate        (Windows)   |   source .venv/bin/activate   (macOS/Linux)
   pip install -r requirements.txt
   ```

## Run (fully offline afterwards)
```
ollama serve                      # skip if Ollama already runs as a service
cd backend
python -m alembic upgrade head    # creates/updates the database tables (safe to repeat)
python -m uvicorn app.main:app --reload --port 8000
```
Open http://localhost:8000. In VS Code you can also press F5 (`.vscode/launch.json`).
The banner at the top shows whether the local model is connected.

Settings (optional env vars): `OLLAMA_URL` (default http://localhost:11434), `OLLAMA_MODEL` (default llama3.2), `AI_TIMEOUT` (seconds, default 120), `DATABASE_URL` (default: SQLite file in `data/`), `APP_ENV` (dev or prod).

## Tests
```
cd backend
python -m pytest -q
```
18 tests cover validation (422), model down (503), empty model response, the database layer, Alembic migrations (including upgrading an old database without losing data), analytics, prompt building and static serving. They use a fake model, so a real Ollama run is something you should try yourself.

## Architecture
```
Browser (frontend/)  --fetch-->  FastAPI (backend/app/main.py)
  index.html, static/            |-- routers/       HTTP layer: generation.py, projects.py, analytics.py
  localStorage                   |-- crud.py        all database operations
                                 |-- models.py      SQLAlchemy tables      database.py  engine + sessions
                                 |-- prompts.py     builds system + user prompts (brand profile included)
                                 |-- ai_service.py  ONLY file that calls Ollama (localhost)
                                 `-- schemas.py     request/response validation (Pydantic)
Schema changes: edit models.py, then  python -m alembic revision --autogenerate -m "message"  and  python -m alembic upgrade head
```
Errors: invalid input -> 422. Local model unavailable or empty -> 503 `{"detail":{"code":"ai_unavailable"}}`, and the UI switches to the labeled fallback.

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | `{ai: bool, model}` |
| POST | /api/generate | idea, platform, audience, tone, language, length, goal, keywords, cta, variations (1-5), brand |
| POST | /api/prompts/experiment | system + up to 6 prompt variants, returns output and ms for each |
| GET/POST | /api/projects | saved content |
| GET | /api/analytics | counts, average generation ms, top platforms |

Sample:
```
POST /api/generate {"idea":"home bakery","platform":"Instagram caption","variations":2}
-> {"variations":[{"text":"...","ms":2310},{"text":"...","ms":2190}],"model":"llama3.2"}
```

## Known limits
Versions, calendar, brand profiles and prompt library live in browser localStorage, not SQLite. Average quality score is not tracked server-side. Not hardened for public hosting (no auth, no rate limits).
