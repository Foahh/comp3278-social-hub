from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import jwt
import pytest
from httpx import ASGITransport, AsyncClient

TOKEN = jwt.encode({"user_id": 1, "exp": 9999999999}, "change-me-in-production", algorithm="HS256")


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


def make_comment_row(comment_id=1, user_id=2, post_id=3):
    return {
        "comment_id": comment_id,
        "user_id": user_id,
        "post_id": post_id,
        "username": "dave",
        "avatar_key": None,
        "content": "Great post!",
        "created_at": datetime(2024, 1, 1, tzinfo=UTC),
    }


@pytest.mark.asyncio
async def test_list_comments(client):
    with (
        patch("app.routers.comments.queries") as mock_q,
        patch("app.routers.comments.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.list_comments = AsyncMock(return_value=[make_comment_row()])

        resp = await client.get("/api/posts/3/comments")

    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["content"] == "Great post!"


@pytest.mark.asyncio
async def test_create_comment(client):
    with (
        patch("app.routers.comments.queries") as mock_q,
        patch("app.routers.comments.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.transaction.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_post = AsyncMock(return_value={"post_id": 3})
        mock_q.insert_comment = AsyncMock(return_value=10)
        mock_q.get_user_by_id = AsyncMock(
            return_value={"user_id": 1, "username": "alice", "avatar_key": None}
        )

        resp = await client.post(
            "/api/posts/3/comments",
            json={"content": "Awesome!"},
            cookies={"session": TOKEN},
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["comment_id"] == 10
    assert data["content"] == "Awesome!"


@pytest.mark.asyncio
async def test_create_comment_post_not_found(client):
    with (
        patch("app.routers.comments.queries") as mock_q,
        patch("app.routers.comments.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.transaction.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_post = AsyncMock(return_value=None)

        resp = await client.post(
            "/api/posts/999/comments",
            json={"content": "Hello?"},
            cookies={"session": TOKEN},
        )

    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_create_comment_unauthenticated(client):
    resp = await client.post("/api/posts/3/comments", json={"content": "Hi"})
    assert resp.status_code == 401
