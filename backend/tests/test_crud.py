"""Database layer tests (no HTTP, no AI)."""
from app import crud


def test_analytics_empty_database(session):
    a = crud.analytics(session)
    assert a == {"generations": 0, "projects": 0, "experiments": 0, "avg_ms": 0, "platforms": []}


def test_analytics_counts_and_average(session):
    for p, ms in [("Email", 100), ("Email", 300), ("Reel script", 200)]:
        crud.add_generation(session, platform=p, tone="Bold", language="English", ms=ms, chars=10, model="m")
    a = crud.analytics(session)
    assert a["generations"] == 3 and a["avg_ms"] == 200
    assert a["platforms"] == [{"platform": "Email", "n": 2}, {"platform": "Reel script", "n": 1}]


def test_projects_newest_first(session):
    crud.add_project(session, title="old", platform="p", text="a")
    crud.add_project(session, title="new", platform="p", text="b")
    assert [p.title for p in crud.list_projects(session)] == ["new", "old"]
