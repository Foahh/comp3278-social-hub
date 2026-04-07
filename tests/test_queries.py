from unittest.mock import AsyncMock

import pytest

from app.core.constants import APP_CONSTANTS


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

    result = await queries.insert_user(conn, "alice", "hashed", "Alice")

    cursor.execute.assert_called_once_with(
        "INSERT INTO users (username, name, password_hash) VALUES (%s, %s, %s)",
        ("alice", "Alice", "hashed"),
    )
    assert result == 42


@pytest.mark.asyncio
async def test_list_posts_latest_no_cursor(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(return_value=[{"post_id": 5}, {"post_id": 3}])

    result = await queries.list_posts_latest(conn, None, None, APP_CONSTANTS.feed_page_size)

    assert len(result) == 2
    assert result[0]["post_id"] == 5


@pytest.mark.asyncio
async def test_list_posts_latest_with_cursor(mock_conn):
    from datetime import UTC, datetime

    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(return_value=[{"post_id": 3}])
    t = datetime(2024, 6, 1, 12, 0, 0, tzinfo=UTC)

    await queries.list_posts_latest(conn, t, 5, APP_CONSTANTS.feed_page_size)

    call_args = cursor.execute.call_args
    sql, params = call_args[0][0], call_args[0][1]
    assert "(p.created_at, p.post_id) < (%s, %s)" in sql
    assert params[0] == t
    assert params[1] == 5


@pytest.mark.asyncio
async def test_list_posts_latest_for_user_no_cursor(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(return_value=[{"post_id": 2, "user_id": 1}])

    result = await queries.list_posts_latest_for_user(
        conn, 1, None, None, APP_CONSTANTS.feed_page_size
    )

    assert len(result) == 1
    call_args = cursor.execute.call_args
    assert "p.user_id = %s" in call_args[0][0]
    assert 1 in call_args[0][1]


@pytest.mark.asyncio
async def test_get_images_for_posts_uses_single_sql_statement(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(
        return_value=[
            {"image_id": 11, "post_id": 2, "value": "a", "position": 0},
            {"image_id": 12, "post_id": 2, "value": "b", "position": 1},
            {"image_id": 13, "post_id": 5, "value": "c", "position": 0},
        ]
    )

    result = await queries.get_images_for_posts(conn, [2, 5])

    cursor.execute.assert_called_once_with(
        "SELECT * FROM images WHERE post_id IN (%s,%s) ORDER BY post_id ASC, position ASC",
        [2, 5],
    )
    assert result == {
        2: [
            {"image_id": 11, "post_id": 2, "value": "a", "position": 0},
            {"image_id": 12, "post_id": 2, "value": "b", "position": 1},
        ],
        5: [{"image_id": 13, "post_id": 5, "value": "c", "position": 0}],
    }


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


@pytest.mark.asyncio
async def test_get_user_by_username_found(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchone = AsyncMock(return_value={"user_id": 1, "username": "Alice"})

    result = await queries.get_user_by_username(conn, "alice")

    cursor.execute.assert_called_once_with(
        "SELECT * FROM users WHERE LOWER(username) = LOWER(%s)",
        ("alice",),
    )
    assert result == {"user_id": 1, "username": "Alice"}


@pytest.mark.asyncio
async def test_get_user_by_username_not_found(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchone = AsyncMock(return_value=None)

    result = await queries.get_user_by_username(conn, "nonexistent")

    assert result is None
