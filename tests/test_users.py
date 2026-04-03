import io
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import jwt
import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import settings

TOKEN = jwt.encode({"user_id": 1, "exp": 9999999999}, settings.jwt_secret, algorithm="HS256")


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
async def test_get_user_profile(client):
    with (
        patch("app.routers.users.queries") as mock_q,
        patch("app.routers.users.db") as mock_db,
        patch("app.routers.users.s3"),
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_user_profile = AsyncMock(
            return_value={
                "user_id": 1,
                "username": "alice",
                "name": "Alice",
                "avatar_key": None,
                "created_at": datetime(2024, 1, 1, tzinfo=UTC),
                "post_count": 5,
                "total_likes": 42,
            }
        )

        resp = await client.get("/api/users/alice")

    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "alice"
    assert data["name"] == "Alice"
    assert data["post_count"] == 5
    assert data["total_likes"] == 42


@pytest.mark.asyncio
async def test_get_user_profile_not_found(client):
    with (
        patch("app.routers.users.queries") as mock_q,
        patch("app.routers.users.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_user_profile = AsyncMock(return_value=None)

        resp = await client.get("/api/users/nobody")

    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_upload_avatar_forbidden(client):
    """User 1 cannot change user 2's avatar."""
    with (
        patch("app.routers.users.queries") as mock_q,
        patch("app.routers.users.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_user_by_username = AsyncMock(
            return_value={"user_id": 2, "username": "bob", "name": "Bob", "avatar_key": None}
        )

        fake_image = io.BytesIO(b"\xff\xd8\xff" + b"\x00" * 10)
        resp = await client.put(
            "/api/users/bob/avatar",
            files={"avatar": ("photo.jpg", fake_image, "image/jpeg")},
            cookies={"session": TOKEN},
        )

    assert resp.status_code == 403
