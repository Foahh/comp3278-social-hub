from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.constants import APP_CONSTANTS


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


def make_post_row(post_id=1, user_id=2, like_count=0, comment_count=0):
    return {
        "post_id": post_id,
        "user_id": user_id,
        "username": "bob",
        "name": "Bob",
        "avatar_key": None,
        "text_content": "Hello world",
        "like_count": like_count,
        "comment_count": comment_count,
        "created_at": datetime(2024, 1, 1, tzinfo=UTC),
    }


@pytest.mark.asyncio
async def test_list_posts_latest(client):
    post = make_post_row()
    with (
        patch("app.routers.posts.queries") as mock_q,
        patch("app.routers.posts.db") as mock_db,
        patch("app.routers.posts.s3"),
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.list_posts_latest = AsyncMock(return_value=[post])
        mock_q.get_images_for_post = AsyncMock(return_value=[])
        mock_q.get_like = AsyncMock(return_value=None)

        resp = await client.get("/api/posts?sort=latest")

    assert resp.status_code == 200
    data = resp.json()
    assert len(data["posts"]) == 1
    assert data["posts"][0]["post_id"] == 1
    assert data["next_cursor"] is None


@pytest.mark.asyncio
async def test_list_posts_returns_next_cursor(client):
    posts = [make_post_row(post_id=i) for i in range(APP_CONSTANTS.feed_page_size, 0, -1)]
    with (
        patch("app.routers.posts.queries") as mock_q,
        patch("app.routers.posts.db") as mock_db,
        patch("app.routers.posts.s3"),
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.list_posts_latest = AsyncMock(return_value=posts)
        mock_q.get_images_for_post = AsyncMock(return_value=[])
        mock_q.get_like = AsyncMock(return_value=None)

        resp = await client.get("/api/posts?sort=latest")

    assert resp.status_code == 200
    data = resp.json()
    assert data["next_cursor"] == 1  # last post_id in page


@pytest.mark.asyncio
async def test_get_single_post(client):
    post = make_post_row(post_id=5)
    with (
        patch("app.routers.posts.queries") as mock_q,
        patch("app.routers.posts.db") as mock_db,
        patch("app.routers.posts.s3"),
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_post = AsyncMock(return_value=post)
        mock_q.get_images_for_post = AsyncMock(return_value=[])
        mock_q.get_like = AsyncMock(return_value=None)

        resp = await client.get("/api/posts/5")

    assert resp.status_code == 200
    assert resp.json()["post_id"] == 5


@pytest.mark.asyncio
async def test_get_single_post_not_found(client):
    with (
        patch("app.routers.posts.queries") as mock_q,
        patch("app.routers.posts.db") as mock_db,
    ):
        mock_conn = AsyncMock()
        mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
        mock_q.get_post = AsyncMock(return_value=None)

        resp = await client.get("/api/posts/999")

    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_delete_post_forbidden(client):
    """Authenticated as user 1, post belongs to user 2 — expect 403."""
    from app.core import auth
    from app.main import app

    with (
        patch("app.routers.posts.queries") as mock_q,
        patch("app.routers.posts.db") as mock_db,
    ):
        app.dependency_overrides[auth.get_current_user] = lambda: 1
        try:
            mock_conn = AsyncMock()
            mock_db.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
            mock_db.transaction.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_q.get_post = AsyncMock(return_value=make_post_row(post_id=7, user_id=2))
            mock_q.get_images_for_post = AsyncMock(return_value=[])

            resp = await client.delete("/api/posts/7")
        finally:
            app.dependency_overrides.pop(auth.get_current_user, None)

    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_create_post_text_only(client):
    from app.core import auth
    from app.main import app

    post_row = make_post_row(post_id=10, user_id=1)
    with (
        patch("app.routers.posts.queries") as mock_q,
        patch("app.routers.posts.db") as mock_db,
        patch("app.routers.posts.s3"),
    ):
        app.dependency_overrides[auth.get_current_user] = lambda: 1
        try:
            mock_conn = AsyncMock()
            mock_db.transaction.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
            mock_db.transaction.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_db.get_conn.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
            mock_db.get_conn.return_value.__aexit__ = AsyncMock(return_value=False)
            mock_q.insert_post = AsyncMock(return_value=10)
            mock_q.get_post = AsyncMock(return_value=post_row)
            mock_q.get_images_for_post = AsyncMock(return_value=[])
            mock_q.get_like = AsyncMock(return_value=None)

            resp = await client.post(
                "/api/posts",
                data={"text_content": "Hello world"},
            )
        finally:
            app.dependency_overrides.pop(auth.get_current_user, None)

    assert resp.status_code == 200
    assert resp.json()["post_id"] == 10


@pytest.mark.asyncio
async def test_create_post_text_too_long(client):
    from app.core import auth
    from app.core.constants import APP_CONSTANTS
    from app.main import app

    app.dependency_overrides[auth.get_current_user] = lambda: 1
    try:
        resp = await client.post(
            "/api/posts",
            data={"text_content": "x" * (APP_CONSTANTS.max_post_text_length + 1)},
        )
    finally:
        app.dependency_overrides.pop(auth.get_current_user, None)

    assert resp.status_code == 422
    assert str(APP_CONSTANTS.max_post_text_length) in resp.json()["detail"]
