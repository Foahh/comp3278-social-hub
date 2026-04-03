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
            like_count = post["like_count"] - 1
        else:
            await queries.insert_like(conn, current_user_id, post_id)
            liked = True
            like_count = post["like_count"] + 1

    log.info("like_toggled", post_id=post_id, user_id=current_user_id, liked=liked)
    return LikeToggleResponse(liked=liked, like_count=max(0, like_count))
