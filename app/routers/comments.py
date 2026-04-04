from datetime import UTC, datetime

import structlog
from fastapi import APIRouter, Depends

from app.core import auth, db, queries, s3
from app.exceptions import NotFoundError
from app.schemas.comment import CommentResponse, CreateCommentRequest

router = APIRouter()
log = structlog.get_logger()


async def _build_comment_response(
    conn, comment_id: int, user_id: int, content: str, created_at: datetime
) -> CommentResponse:
    user = await queries.get_user_by_id(conn, user_id)
    avatar_url = None
    if user and user.get("avatar_key"):
        avatar_url = await s3.resolve_avatar_url(user["avatar_key"])
    return CommentResponse(
        comment_id=comment_id,
        user_id=user_id,
        username=user["username"] if user else "unknown",
        name=user["name"] if user else "Unknown",
        avatar_url=avatar_url,
        content=content,
        created_at=created_at,
    )


@router.get("/{post_id}/comments", response_model=list[CommentResponse])
async def list_comments(post_id: int) -> list[CommentResponse]:
    async with db.get_conn() as conn:
        rows = await queries.list_comments(conn, post_id)
    result = []
    for row in rows:
        avatar_url = None
        if row.get("avatar_key"):
            avatar_url = await s3.resolve_avatar_url(row["avatar_key"])
        result.append(
            CommentResponse(
                comment_id=row["comment_id"],
                user_id=row["user_id"],
                username=row["username"],
                name=row["name"],
                avatar_url=avatar_url,
                content=row["content"],
                created_at=row["created_at"],
            )
        )
    return result


@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: int,
    body: CreateCommentRequest,
    current_user_id: int = Depends(auth.get_current_user),
) -> CommentResponse:
    created_at = datetime.now(UTC)
    async with db.transaction() as conn:
        post = await queries.get_post(conn, post_id)
        if not post:
            raise NotFoundError("Post")
        comment_id = await queries.insert_comment(conn, current_user_id, post_id, body.content)
        result = await _build_comment_response(
            conn, comment_id, current_user_id, body.content, created_at
        )

    log.info("comment_created", comment_id=comment_id, post_id=post_id, user_id=current_user_id)
    return result
