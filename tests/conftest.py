from unittest.mock import AsyncMock, MagicMock

import pytest


@pytest.fixture
def mock_conn():
    """Returns a mock aiomysql connection whose cursor returns configurable rows."""
    conn = MagicMock()
    cursor = AsyncMock()
    cursor.__aenter__ = AsyncMock(return_value=cursor)
    cursor.__aexit__ = AsyncMock(return_value=False)
    conn.cursor.return_value = cursor
    return conn, cursor
