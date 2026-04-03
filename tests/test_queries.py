import pytest
from unittest.mock import AsyncMock, MagicMock, patch

import aiomysql


@pytest.mark.asyncio
async def test_get_user_by_id_found(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchone = AsyncMock(return_value={"user_id": 1, "username": "alice"})

    result = await queries.get_user_by_id(conn, 1)

    cursor.execute.assert_called_once_with("SELECT * FROM users WHERE user_id = %s", (1,))
    assert result == {"user_id": 1, "username": "alice"}


@pytest.mark.asyncio
async def test_get_user_by_id_not_found(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchone = AsyncMock(return_value=None)

    result = await queries.get_user_by_id(conn, 999)

    assert result is None


@pytest.mark.asyncio
async def test_insert_user(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.lastrowid = 42

    result = await queries.insert_user(conn, "alice", "alice@example.com", "hashed")

    cursor.execute.assert_called_once_with(
        "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
        ("alice", "alice@example.com", "hashed"),
    )
    assert result == 42


@pytest.mark.asyncio
async def test_list_posts_latest_no_cursor(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(return_value=[{"post_id": 5}, {"post_id": 3}])

    result = await queries.list_posts_latest(conn, None, 20)

    assert len(result) == 2
    assert result[0]["post_id"] == 5


@pytest.mark.asyncio
async def test_list_posts_latest_with_cursor(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(return_value=[{"post_id": 3}])

    result = await queries.list_posts_latest(conn, 5, 20)

    call_args = cursor.execute.call_args
    assert "%s" in call_args[0][0]
    assert 5 in call_args[0][1]


@pytest.mark.asyncio
async def test_get_like_found(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchone = AsyncMock(return_value={"like_id": 7, "user_id": 1, "post_id": 2})

    result = await queries.get_like(conn, 1, 2)

    assert result is not None
    assert result["like_id"] == 7


@pytest.mark.asyncio
async def test_insert_comment_returns_id(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.lastrowid = 99

    result = await queries.insert_comment(conn, 1, 2, "Great post!")

    assert result == 99
