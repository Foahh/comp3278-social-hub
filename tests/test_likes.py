import pytest
import jwt
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock, MagicMock, patch


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


@pytest.mark.asyncio
async def test_like_post_not_liked_yet(client):
    with (
        patch("app.routers.likes.queries") as mock_q,
        patch("app.routers.likes.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.transaction.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_post = AsyncMock(return_value={"post_id": 3, "like_count": 4})
        mock_q.get_like = AsyncMock(return_value=None)
        mock_q.insert_like = AsyncMock()

        resp = await client.post("/api/posts/3/like", cookies={"session": TOKEN})

    assert resp.status_code == 200
    data = resp.json()
    assert data["liked"] is True
    assert data["like_count"] == 5


@pytest.mark.asyncio
async def test_unlike_post(client):
    with (
        patch("app.routers.likes.queries") as mock_q,
        patch("app.routers.likes.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.transaction.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_post = AsyncMock(return_value={"post_id": 3, "like_count": 5})
        mock_q.get_like = AsyncMock(return_value={"like_id": 7})
        mock_q.delete_like = AsyncMock()

        resp = await client.post("/api/posts/3/like", cookies={"session": TOKEN})

    assert resp.status_code == 200
    data = resp.json()
    assert data["liked"] is False
    assert data["like_count"] == 4


@pytest.mark.asyncio
async def test_like_post_not_found(client):
    with (
        patch("app.routers.likes.queries") as mock_q,
        patch("app.routers.likes.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.transaction.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_post = AsyncMock(return_value=None)

        resp = await client.post("/api/posts/999/like", cookies={"session": TOKEN})

    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_like_unauthenticated(client):
    resp = await client.post("/api/posts/3/like")
    assert resp.status_code == 401
