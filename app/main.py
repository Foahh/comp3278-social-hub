from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import db, s3
from app.core.config import settings
from app.exceptions import register_exception_handlers

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer(),
    ],
)

log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    log.info("starting up")

    log.info("initializing database")
    await db.init_pool(
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
        db=settings.mysql_database,
    )

    log.info("initializing S3")
    s3.init_s3()
    await s3.ensure_bucket()

    if settings.openai_api_key:
        from app.core.vanna import init_vanna, mount_vanna_routes, seed_memory

        log.info("initializing Vanna.ai")
        init_vanna()
        await seed_memory()
        mount_vanna_routes(app)

    yield

    log.info("shutting down")
    await db.close_pool()


app = FastAPI(title="SocialHub API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
register_exception_handlers(app)

from app.routers import auth, comments, likes, posts, users  # noqa: E402

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(posts.router, prefix="/api/posts", tags=["posts"])
app.include_router(likes.router, prefix="/api/posts", tags=["likes"])
app.include_router(comments.router, prefix="/api/posts", tags=["comments"])
app.include_router(users.router, prefix="/api/users", tags=["users"])


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
