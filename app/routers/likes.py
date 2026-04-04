import structlog
from fastapi import APIRouter, Depends

from app.core import auth, db, queries
from app.exceptions import NotFoundError
from app.schemas.like import LikeToggleResponse

router = APIRouter()
log = structlog.get_logger()


@router.post("/{post_id}/like", response_model=LikeToggleResponse)
async def toggle_like(
    post_id: int,
    current_user_id: int = Depends(auth.get_current_user),
) -> LikeToggleResponse:
    async with db.transaction() as conn:
        post = await queries.get_post(conn, post_id)
        if not post:
            raise NotFoundError("Post")
        existing = await queries.get_like(conn, current_user_id, post_id)
        if existing:
            await queries.delete_like(conn, current_user_id, post_id)
            liked = False
        else:
            await queries.insert_like(conn, current_user_id, post_id)
            liked = True

    async with db.get_conn() as conn:
        like_count = await queries.get_post_like_count(conn, post_id)

    log.info("like_toggled", post_id=post_id, user_id=current_user_id, liked=liked)
    return LikeToggleResponse(liked=liked, like_count=like_count)
