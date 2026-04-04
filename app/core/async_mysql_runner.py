"""Non-blocking MySQL runner using aiomysql."""

from __future__ import annotations

import aiomysql
import pandas as pd
from vanna.capabilities.sql_runner import RunSqlToolArgs, SqlRunner
from vanna.core.tool import ToolContext


class AsyncMySQLRunner(SqlRunner):
    """Truly async MySQL runner that never blocks the event loop."""

    def __init__(
        self,
        host: str,
        database: str,
        user: str,
        password: str,
        port: int = 3306,
    ) -> None:
        self.host = host
        self.database = database
        self.user = user
        self.password = password
        self.port = port

    async def run_sql(self, args: RunSqlToolArgs, context: ToolContext) -> pd.DataFrame:
        conn = await aiomysql.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            db=self.database,
            port=self.port,
        )
        try:
            async with conn.cursor(aiomysql.DictCursor) as cur:
                await cur.execute(args.sql)
                rows = await cur.fetchall()
                columns = [desc[0] for desc in cur.description] if cur.description else []
                return pd.DataFrame(rows, columns=columns)
        finally:
            conn.close()
