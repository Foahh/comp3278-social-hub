from unittest.mock import AsyncMock, patch
import pytest
from httpx import ASGITransport, AsyncClient


@pytest.fixture
async def client():
    from app.main import app

    with (
        patch("app.core.db.init_pool", new_callable=AsyncMock),
        patch("app.core.s3.init_s3"),
        patch("app.core.s3.ensure_bucket", new_callable=AsyncMock),
        patch("app.core.db.close_pool", new_callable=AsyncMock),
    ):
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            yield ac


def make_analytics_mocks():
    top_posts = [
        {"post_id": 1, "username": "alice", "text_content": "Hello world", "like_count": 42},
        {"post_id": 2, "username": "bob", "text_content": None, "like_count": 10},
    ]
    top_users = [
        {"username": "alice", "name": "Alice", "post_count": 15, "total_likes": 99},
    ]
    posts_per_day = [{"date": "2026-03-05", "count": 3}]
    likes_per_day = [{"date": "2026-03-05", "count": 7}]
    return top_posts, top_users, posts_per_day, likes_per_day


@pytest.mark.asyncio
async def test_get_analytics_returns_200(client):
    top_posts, top_users, posts_per_day, likes_per_day = make_analytics_mocks()
    with (
        patch("app.routers.analytics.queries") as mock_q,
        patch("app.routers.analytics.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_top_posts_by_likes = AsyncMock(return_value=top_posts)
        mock_q.get_top_users_by_activity = AsyncMock(return_value=top_users)
        mock_q.get_posts_per_day = AsyncMock(return_value=posts_per_day)
        mock_q.get_likes_per_day = AsyncMock(return_value=likes_per_day)

        resp = await client.get("/api/analytics")

    assert resp.status_code == 200
    data = resp.json()
    assert len(data["top_posts"]) == 2
    assert data["top_posts"][0]["post_id"] == 1
    assert data["top_posts"][0]["excerpt"] == "Hello world"
    assert data["top_posts"][1]["excerpt"] == ""  # None text_content becomes ""
    assert len(data["top_users"]) == 1
    assert data["top_users"][0]["username"] == "alice"
    assert len(data["posts_over_time"]) == 1
    assert data["posts_over_time"][0]["date"] == "2026-03-05"
    assert data["posts_over_time"][0]["count"] == 3
    assert data["likes_over_time"][0]["count"] == 7


@pytest.mark.asyncio
async def test_get_analytics_empty(client):
    with (
        patch("app.routers.analytics.queries") as mock_q,
        patch("app.routers.analytics.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_top_posts_by_likes = AsyncMock(return_value=[])
        mock_q.get_top_users_by_activity = AsyncMock(return_value=[])
        mock_q.get_posts_per_day = AsyncMock(return_value=[])
        mock_q.get_likes_per_day = AsyncMock(return_value=[])

        resp = await client.get("/api/analytics")

    assert resp.status_code == 200
    data = resp.json()
    assert data["top_posts"] == []
    assert data["top_users"] == []
    assert data["posts_over_time"] == []
    assert data["likes_over_time"] == []
