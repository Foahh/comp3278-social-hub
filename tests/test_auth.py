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


@pytest.mark.asyncio
async def test_register_success(client):
    with (
        patch("app.routers.auth.queries") as mock_q,
        patch("app.routers.auth.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.transaction.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_user_by_email = AsyncMock(return_value=None)
        mock_q.get_user_by_username = AsyncMock(return_value=None)
        mock_q.insert_user = AsyncMock(return_value=1)
        mock_q.get_user_by_id = AsyncMock(
            return_value={
                "user_id": 1,
                "username": "alice",
                "email": "alice@test.com",
                "avatar_key": None,
            }
        )

        resp = await client.post(
            "/api/auth/register",
            json={
                "username": "alice",
                "email": "alice@test.com",
                "password": "password123",
            },
        )

    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "alice"
    assert "Set-Cookie" in resp.headers


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    with (
        patch("app.routers.auth.queries") as mock_q,
        patch("app.routers.auth.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.transaction.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_user_by_email = AsyncMock(return_value={"user_id": 99})

        resp = await client.post(
            "/api/auth/register",
            json={
                "username": "alice2",
                "email": "taken@test.com",
                "password": "password123",
            },
        )

    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    import bcrypt

    hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()

    with (
        patch("app.routers.auth.queries") as mock_q,
        patch("app.routers.auth.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_user_by_email = AsyncMock(
            return_value={
                "user_id": 1,
                "username": "alice",
                "email": "alice@test.com",
                "password_hash": hashed,
                "avatar_key": None,
            }
        )

        resp = await client.post(
            "/api/auth/login",
            json={
                "email": "alice@test.com",
                "password": "password123",
            },
        )

    assert resp.status_code == 200
    assert "Set-Cookie" in resp.headers


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    import bcrypt

    hashed = bcrypt.hashpw(b"correctpass", bcrypt.gensalt()).decode()

    with (
        patch("app.routers.auth.queries") as mock_q,
        patch("app.routers.auth.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_user_by_email = AsyncMock(
            return_value={
                "user_id": 1,
                "username": "alice",
                "email": "alice@test.com",
                "password_hash": hashed,
                "avatar_key": None,
            }
        )

        resp = await client.post(
            "/api/auth/login",
            json={
                "email": "alice@test.com",
                "password": "wrongpass",
            },
        )

    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
