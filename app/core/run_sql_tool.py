"""Wrap Vanna's RunSqlTool so executed SQL is included in dataframe UI payloads."""

from __future__ import annotations

from vanna.capabilities.sql_runner import RunSqlToolArgs
from vanna.components import DataFrameComponent
from vanna.core.tool import ToolContext, ToolResult
from vanna.tools import RunSqlTool


class RunSqlToolWithSql(RunSqlTool):
    """Exposes the executed SQL under ``rich_component.data.sql`` for the chat client."""

    async def execute(self, context: ToolContext, args: RunSqlToolArgs) -> ToolResult:
        result = await super().execute(context, args)
        if not result.success or result.ui_component is None:
            return result
        rc = result.ui_component.rich_component
        if not isinstance(rc, DataFrameComponent):
            return result
        merged = {**(rc.data or {}), "sql": args.sql}
        new_rc = rc.model_copy(update={"data": merged})
        new_ui = result.ui_component.model_copy(update={"rich_component": new_rc})
        return result.model_copy(update={"ui_component": new_ui})
