import pytest

from app import ai_service, config


def fake_ok(monkeypatch):
    async def chat(system, user):
        return "Hello world", 42
    monkeypatch.setattr(ai_service, "chat", chat)


def fake_down(monkeypatch, msg="down"):
    async def chat(system, user):
        raise ai_service.AIUnavailable(msg)
    monkeypatch.setattr(ai_service, "chat", chat)


BODY = {"idea": "home bakery", "platform": "Instagram caption", "variations": 2}


def test_generate_and_analytics(client, monkeypatch):
    fake_ok(monkeypatch)
    r = client.post("/api/generate", json=BODY)
    assert r.status_code == 200 and len(r.json()["variations"]) == 2
    a = client.get("/api/analytics").json()
    assert a["generations"] == 2 and a["avg_ms"] == 42 and a["platforms"][0]["platform"] == "Instagram caption"


@pytest.mark.parametrize("bad", [{"idea": "hi", "platform": "x"}, {**BODY, "variations": 9}, {**BODY, "language": "French"}, {"platform": "x"}])
def test_invalid_input_is_422(client, bad):
    assert client.post("/api/generate", json=bad).status_code == 422


def test_model_down_is_503_and_nothing_stored(client, monkeypatch):
    fake_down(monkeypatch)
    r = client.post("/api/generate", json=BODY)
    assert r.status_code == 503 and r.json()["detail"]["code"] == "ai_unavailable"
    assert client.get("/api/analytics").json()["generations"] == 0


def test_empty_model_response_is_503(client, monkeypatch):
    fake_down(monkeypatch, "Local model returned an empty response")
    assert client.post("/api/generate", json=BODY).status_code == 503


def test_empty_response_detected_in_service(monkeypatch):
    import asyncio, httpx
    handler = lambda req: httpx.Response(200, json={"message": {"content": "  "}})
    real = httpx.AsyncClient
    monkeypatch.setattr(httpx, "AsyncClient", lambda **k: real(transport=httpx.MockTransport(handler), **k))
    with pytest.raises(ai_service.AIUnavailable):
        asyncio.run(ai_service.chat("s", "u"))


def test_experiment_stored(client, monkeypatch):
    fake_ok(monkeypatch)
    r = client.post("/api/prompts/experiment", json={"system": "s", "variants": [{"label": "A", "prompt": "write x"}, {"label": "B", "prompt": "write y"}]})
    assert r.status_code == 200 and [x["ms"] for x in r.json()["results"]] == [42, 42]
    assert client.get("/api/analytics").json()["experiments"] == 2


def test_projects_persist(client):
    assert client.post("/api/projects", json={"title": "t", "platform": "p", "text": "body"}).status_code == 201
    assert client.get("/api/projects").json()[0]["text"] == "body"
    assert client.post("/api/projects", json={"title": "", "platform": "p", "text": "x"}).status_code == 422


def test_health_when_ollama_missing(client, monkeypatch):
    monkeypatch.setattr(config, "OLLAMA_URL", "http://127.0.0.1:9")
    assert client.get("/api/health").json()["ai"] is False


def test_frontend_is_served(client):
    assert client.get("/").status_code == 200
    assert client.get("/static/app.js").status_code == 200
    assert client.get("/static/style.css").status_code == 200


def test_brand_and_options_reach_the_prompt():
    from app import prompts
    from app.schemas import GenerateIn
    req = GenerateIn(idea="home bakery", platform="Email", keywords="fresh", cta="Order now",
                     brand={"name": "Crumb", "vocab": "warm", "avoid": "cheap"})
    system, user = prompts.build(req, 0)
    assert "Crumb" in system and "cheap" in system and "fresh" in user and "Order now" in user
