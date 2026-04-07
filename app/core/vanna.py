from __future__ import annotations

import asyncio
import json
from datetime import datetime
from pathlib import Path

import jwt
from vanna import Agent, AgentConfig
from vanna.core.registry import ToolRegistry
from vanna.core.user.models import User
from vanna.core.user.request_context import RequestContext
from vanna.core.user.resolver import UserResolver
from vanna.integrations.chromadb import ChromaAgentMemory
from vanna.integrations.local import LocalFileSystem
from vanna.servers.fastapi.routes import register_chat_routes
from vanna.tools import VisualizeDataTool
from vanna.tools.agent_memory import (
    SaveQuestionToolArgsTool,
    SaveTextMemoryTool,
    SearchSavedCorrectToolUsesTool,
)

from app.core.async_mysql_runner import AsyncMySQLRunner
from app.core.config import settings
from app.core.run_sql_tool import RunSqlToolWithSql
from app.core.vanna_config import DDL, TRAINING_PAIRS
from app.core.vanna_chat_model import (
    InjectRequestModelMiddleware,
    MetadataOpenAILlmService,
    ValidatedModelChatHandler,
)

VANNA_FS_ROOT = ".vanna"
CHROMA_FS_ROOT = ".chroma"

_agent: Agent | None = None
_memory: ChromaAgentMemory | None = None


class JwtUserResolver(UserResolver):
    """Resolves our JWT session cookie into a Vanna User."""

    async def resolve_user(self, request_context: RequestContext) -> User:
        token = request_context.get_cookie("session")
        if not token:
            return User(id="anonymous", group_memberships=["public"])
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
            user_id = str(payload["user_id"])
            return User(id=user_id, group_memberships=["user"])
        except jwt.PyJWTError:
            return User(id="anonymous", group_memberships=["public"])


def init_vanna() -> Agent:
    """Create and return the Vanna Agent. Called once during app lifespan."""
    global _agent, _memory

    llm_kwargs: dict = {
        "api_key": settings.openai_api_key,
    }
    if settings.openai_base_url:
        llm_kwargs["base_url"] = settings.openai_base_url
    if settings.openai_organization:
        llm_kwargs["organization"] = settings.openai_organization
    llm = MetadataOpenAILlmService(**llm_kwargs)

    mysql_runner = AsyncMySQLRunner(
        host=settings.mysql_host,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
        port=settings.mysql_port,
    )

    persist = Path(CHROMA_FS_ROOT).resolve()
    persist.mkdir(parents=True, exist_ok=True)
    _memory = ChromaAgentMemory(
        persist_directory=str(persist),
        collection_name="socialhub_memory",
    )

    vanna_fs = LocalFileSystem(working_directory=VANNA_FS_ROOT)

    registry = ToolRegistry()
    access = ["user", "public"]
    registry.register_local_tool(
        RunSqlToolWithSql(sql_runner=mysql_runner, file_system=vanna_fs),
        access_groups=access,
    )
    registry.register_local_tool(VisualizeDataTool(file_system=vanna_fs), access_groups=access)
    registry.register_local_tool(SearchSavedCorrectToolUsesTool(), access_groups=access)
    registry.register_local_tool(SaveQuestionToolArgsTool(), access_groups=access)
    registry.register_local_tool(SaveTextMemoryTool(), access_groups=["user"])

    _agent = Agent(
        llm_service=llm,
        tool_registry=registry,
        user_resolver=JwtUserResolver(),
        agent_memory=_memory,
        config=AgentConfig(stream_responses=True, temperature=0.3),
        llm_middlewares=[InjectRequestModelMiddleware()],
    )

    return _agent


async def seed_memory() -> None:
    """Upsert bootstrap DDL and training pairs; stable ids avoid duplicates across restarts."""
    assert _memory is not None
    ts = datetime.now().isoformat()

    def _seed() -> None:
        collection = _memory._get_collection()
        collection.upsert(
            ids=["socialhub-seed-ddl"],
            documents=[DDL],
            metadatas=[
                {
                    "content": DDL,
                    "timestamp": ts,
                    "is_text_memory": True,
                }
            ],
        )
        for i, (question, sql) in enumerate(TRAINING_PAIRS):
            collection.upsert(
                ids=[f"socialhub-seed-sql-{i}"],
                documents=[question],
                metadatas=[
                    {
                        "question": question,
                        "tool_name": "run_sql",
                        "args_json": json.dumps({"sql": sql}),
                        "timestamp": ts,
                        "success": True,
                        "metadata_json": json.dumps({}),
                    }
                ],
            )

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(_memory._executor, _seed)


def mount_vanna_routes(app) -> None:
    """Register Vanna's chat endpoints on the FastAPI app."""
    assert _agent is not None
    chat_handler = ValidatedModelChatHandler(_agent)
    register_chat_routes(app, chat_handler, config={"dev_mode": False})
