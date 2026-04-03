from __future__ import annotations

from pathlib import Path

import jwt
from vanna import Agent, AgentConfig
from vanna.core.registry import ToolRegistry
from vanna.core.tool.models import ToolContext
from vanna.core.user.models import User
from vanna.core.user.request_context import RequestContext
from vanna.core.user.resolver import UserResolver
from vanna.integrations.chromadb import ChromaAgentMemory
from vanna.integrations.mysql import MySQLRunner
from vanna.integrations.openai import OpenAILlmService
from vanna.servers.base import ChatHandler
from vanna.servers.fastapi.routes import register_chat_routes
from vanna.tools import RunSqlTool, VisualizeDataTool
from vanna.tools.agent_memory import (
    SaveQuestionToolArgsTool,
    SaveTextMemoryTool,
    SearchSavedCorrectToolUsesTool,
)

from app.core.config import settings

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


DDL = Path("schema.sql").read_text()

TRAINING_PAIRS = [
    (
        "What are the most liked posts?",
        "SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.user_id ORDER BY p.like_count DESC LIMIT 10;",
    ),
    (
        "Which users have the most posts?",
        "SELECT u.username, COUNT(*) as post_count FROM users u JOIN posts p ON u.user_id = p.user_id GROUP BY u.user_id ORDER BY post_count DESC LIMIT 10;",
    ),
    (
        "What are the most commented posts?",
        "SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.user_id ORDER BY p.comment_count DESC LIMIT 10;",
    ),
    (
        "Show posts from this week",
        "SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY p.created_at DESC;",
    ),
    (
        "Who liked a specific post?",
        "SELECT u.username, l.created_at FROM likes l JOIN users u ON l.user_id = u.user_id WHERE l.post_id = 1 ORDER BY l.created_at DESC;",
    ),
]


def init_vanna() -> Agent:
    """Create and return the Vanna Agent. Called once during app lifespan."""
    global _agent, _memory

    llm = OpenAILlmService(model="gpt-4o-mini", api_key=settings.openai_api_key)

    mysql_runner = MySQLRunner(
        host=settings.mysql_host,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
        port=settings.mysql_port,
    )

    _memory = ChromaAgentMemory(
        persist_directory="./chroma_data",
        collection_name="socialhub_memory",
    )

    registry = ToolRegistry()
    access = ["user", "public"]
    registry.register_local_tool(RunSqlTool(sql_runner=mysql_runner), access_groups=access)
    registry.register_local_tool(VisualizeDataTool(), access_groups=access)
    registry.register_local_tool(SearchSavedCorrectToolUsesTool(), access_groups=access)
    registry.register_local_tool(SaveQuestionToolArgsTool(), access_groups=access)
    registry.register_local_tool(SaveTextMemoryTool(), access_groups=["user"])

    _agent = Agent(
        llm_service=llm,
        tool_registry=registry,
        user_resolver=JwtUserResolver(),
        agent_memory=_memory,
        config=AgentConfig(stream_responses=True, temperature=0.3),
    )

    return _agent


async def seed_memory() -> None:
    """Pre-load DDL and question-SQL pairs into agent memory."""
    assert _memory is not None
    ctx = ToolContext(
        user=User(id="system", group_memberships=["user"]),
        conversation_id="seed",
        request_id="seed-init",
        agent_memory=_memory,
    )

    await _memory.save_text_memory(content=DDL, context=ctx)

    for question, sql in TRAINING_PAIRS:
        await _memory.save_tool_usage(
            question=question,
            tool_name="run_sql",
            args={"sql": sql},
            context=ctx,
            success=True,
        )


def mount_vanna_routes(app) -> None:
    """Register Vanna's chat endpoints on the FastAPI app."""
    assert _agent is not None
    chat_handler = ChatHandler(_agent)
    register_chat_routes(app, chat_handler, config={"dev_mode": False})
