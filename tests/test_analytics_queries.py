from unittest.mock import AsyncMock

import pytest


@pytest.mark.asyncio
async def test_get_top_posts_by_likes(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(
        return_value=[
            {"post_id": 1, "username": "alice", "text_content": "Hello", "like_count": 42},
            {"post_id": 2, "username": "bob", "text_content": None, "like_count": 10},
        ]
    )

    result = await queries.get_top_posts_by_likes(conn, 10)

    assert len(result) == 2
    assert result[0]["like_count"] == 42
    assert result[1]["text_content"] is None


@pytest.mark.asyncio
async def test_get_top_users_by_activity(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(
        return_value=[
            {"username": "alice", "name": "Alice", "post_count": 15, "total_likes": 99},
            {"username": "bob", "name": "Bob", "post_count": 5, "total_likes": 20},
        ]
    )

    result = await queries.get_top_users_by_activity(conn, 10)

    assert len(result) == 2
    assert result[0]["post_count"] == 15
    assert result[1]["username"] == "bob"


@pytest.mark.asyncio
async def test_get_posts_per_day(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(
        return_value=[
            {"date": "2026-03-05", "count": 3},
            {"date": "2026-03-06", "count": 7},
        ]
    )

    result = await queries.get_posts_per_day(conn, 30)

    assert len(result) == 2
    assert result[1]["count"] == 7


@pytest.mark.asyncio
async def test_get_likes_per_day(mock_conn):
    from app.core import queries

    conn, cursor = mock_conn
    cursor.fetchall = AsyncMock(
        return_value=[
            {"date": "2026-03-05", "count": 10},
        ]
    )

    result = await queries.get_likes_per_day(conn, 30)

    assert result[0]["count"] == 10
