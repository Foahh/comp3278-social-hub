from fastapi import APIRouter

from app.core import db, queries
from app.schemas.analytics import (
    AnalyticsDayCount,
    AnalyticsResponse,
    AnalyticsTopPost,
    AnalyticsTopUser,
)

router = APIRouter()

_TOP_N = 10
_DAYS = 30


@router.get("", response_model=AnalyticsResponse)
async def get_analytics() -> AnalyticsResponse:
    async with db.get_conn() as conn:
        top_post_rows = await queries.get_top_posts_by_likes(conn, _TOP_N)
        top_user_rows = await queries.get_top_users_by_activity(conn, _TOP_N)
        posts_per_day = await queries.get_posts_per_day(conn, _DAYS)
        likes_per_day = await queries.get_likes_per_day(conn, _DAYS)

    return AnalyticsResponse(
        top_posts=[
            AnalyticsTopPost(
                post_id=r["post_id"],
                username=r["username"],
                excerpt=(r["text_content"] or "")[:80],
                like_count=r["like_count"],
            )
            for r in top_post_rows
        ],
        top_users=[
            AnalyticsTopUser(
                username=r["username"],
                name=r["name"],
                post_count=r["post_count"],
                total_likes=r["total_likes"],
            )
            for r in top_user_rows
        ],
        posts_over_time=[
            AnalyticsDayCount(date=str(r["date"]), count=r["count"]) for r in posts_per_day
        ],
        likes_over_time=[
            AnalyticsDayCount(date=str(r["date"]), count=r["count"]) for r in likes_per_day
        ],
    )
