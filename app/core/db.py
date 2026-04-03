from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import aiomysql

_pool: aiomysql.Pool | None = None


async def init_pool(
    host: str,
    port: int,
    user: str,
    password: str,
    db: str,
) -> None:
    global _pool
    _pool = await aiomysql.create_pool(
        host=host,
        port=port,
        user=user,
        password=password,
        db=db,
        minsize=2,
        maxsize=10,
        autocommit=True,
    )


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        await _pool.wait_closed()
        _pool = None


@asynccontextmanager
async def get_conn() -> AsyncGenerator[aiomysql.Connection]:
    """Yield a connection from the pool. Used for single-query reads."""
    assert _pool is not None
    async with _pool.acquire() as conn:
        yield conn


@asynccontextmanager
async def transaction() -> AsyncGenerator[aiomysql.Connection]:
    """Yield a connection with an explicit transaction (BEGIN/COMMIT/ROLLBACK)."""
    assert _pool is not None
    async with _pool.acquire() as conn:
        await conn.begin()
        try:
            yield conn
            await conn.commit()
        except BaseException:
            await conn.rollback()
            raise
