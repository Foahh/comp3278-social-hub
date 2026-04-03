import contextlib
import json
import uuid
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile

from app.core import auth, db, queries, s3
from app.core.constants import APP_CONSTANTS
from app.exceptions import ForbiddenError, NotFoundError
from app.schemas.post import (
    FeedSort,
    ImageInput,
    ImageResponse,
    PostListResponse,
    PostResponse,
)

router = APIRouter()
log = structlog.get_logger()


async def _resolve_images(conn, post_id: int) -> list[ImageResponse]:
    rows = await queries.get_images_for_post(conn, post_id)
    result = []
    for row in rows:
        if row["type"] == "blob":
            url = await s3.generate_presigned_url(row["value"])
        else:
            url = row["value"]
        result.append(ImageResponse(image_id=row["image_id"], url=url, position=row["position"]))
    return result


async def _build_post_response(conn, row: dict, current_user_id: int | None) -> PostResponse:
    images = await _resolve_images(conn, row["post_id"])
    liked_by_me = False
    if current_user_id is not None:
        like = await queries.get_like(conn, current_user_id, row["post_id"])
        liked_by_me = like is not None
    avatar_url = None
    if row.get("avatar_key"):
        avatar_url = await s3.generate_presigned_url(row["avatar_key"])
    return PostResponse(
        post_id=row["post_id"],
        user_id=row["user_id"],
        username=row["username"],
        name=row["name"],
        avatar_url=avatar_url,
        text_content=row.get("text_content"),
        images=images,
        like_count=row["like_count"],
        comment_count=row["comment_count"],
        liked_by_me=liked_by_me,
        created_at=row["created_at"],
    )


@router.get("", response_model=PostListResponse)
async def list_posts(
    sort: Annotated[FeedSort, Query()] = FeedSort.latest,
    cursor: int | None = Query(None),
    current_user_id: int | None = Depends(auth.get_optional_user),
) -> PostListResponse:
    async with db.get_conn() as conn:
        if sort == FeedSort.latest:
            rows = await queries.list_posts_latest(conn, cursor, APP_CONSTANTS.feed_page_size)
        else:
            cursor_likes: int | None = None
            cursor_id: int | None = None
            if cursor is not None:
                last_post = await queries.get_post(conn, cursor)
                if last_post:
                    cursor_likes = last_post["like_count"]
                    cursor_id = last_post["post_id"]
            rows = await queries.list_posts_popular(
                conn, cursor_likes, cursor_id, APP_CONSTANTS.feed_page_size
            )

        posts = []
        for row in rows:
            posts.append(await _build_post_response(conn, row, current_user_id))

    next_cursor: int | None = None
    if len(rows) == APP_CONSTANTS.feed_page_size:
        next_cursor = rows[-1]["post_id"]

    return PostListResponse(posts=posts, next_cursor=next_cursor)


@router.post("", response_model=PostResponse)
async def create_post(
    text_content: Annotated[str | None, Form()] = None,
    image_urls: Annotated[str | None, Form()] = None,
    images: Annotated[list[UploadFile] | None, File()] = None,
    current_user_id: int = Depends(auth.get_current_user),
) -> PostResponse:
    url_inputs: list[ImageInput] = []
    if image_urls:
        try:
            raw = json.loads(image_urls)
            url_inputs = [ImageInput(url=u) for u in raw]
        except Exception:
            raise HTTPException(
                status_code=422, detail="image_urls must be a JSON array of URLs"
            ) from None

    blob_files = images or []

    if text_content is not None and len(text_content) > APP_CONSTANTS.max_post_text_length:
        raise HTTPException(
            status_code=422,
            detail=f"text_content must be at most {APP_CONSTANTS.max_post_text_length} characters",
        )

    if not text_content and not url_inputs and not blob_files:
        raise HTTPException(
            status_code=422,
            detail="At least one of text_content, image_urls, or images is required",
        )

    for f in blob_files:
        if f.content_type not in APP_CONSTANTS.allowed_image_mime_types:
            raise HTTPException(status_code=422, detail=f"Unsupported image type: {f.content_type}")

    blob_data: list[tuple[bytes, str]] = []
    for f in blob_files:
        data = await f.read()
        if len(data) > APP_CONSTANTS.max_image_upload_bytes:
            raise HTTPException(
                status_code=422,
                detail=f"Image exceeds {APP_CONSTANTS.image_upload_max_mb} MB limit",
            )
        blob_data.append((data, f.content_type or APP_CONSTANTS.default_image_mime_type))

    uploaded_keys: list[str] = []
    try:
        for data, content_type in blob_data:
            key = f"posts/{uuid.uuid4()}.webp"
            await s3.upload_file(key, data, content_type)
            uploaded_keys.append(key)
    except Exception:
        for key in uploaded_keys:
            with contextlib.suppress(Exception):
                await s3.delete_file(key)
        raise

    try:
        async with db.transaction() as conn:
            post_id = await queries.insert_post(conn, current_user_id, text_content)
            position = 0
            for key in uploaded_keys:
                await queries.insert_image(conn, post_id, "blob", key, position)
                position += 1
            for url_input in url_inputs:
                await queries.insert_image(conn, post_id, "url", str(url_input.url), position)
                position += 1
    except Exception:
        for key in uploaded_keys:
            with contextlib.suppress(Exception):
                await s3.delete_file(key)
        raise

    async with db.get_conn() as conn:
        row = await queries.get_post(conn, post_id)
        return await _build_post_response(conn, row, current_user_id)


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    current_user_id: int | None = Depends(auth.get_optional_user),
) -> PostResponse:
    async with db.get_conn() as conn:
        row = await queries.get_post(conn, post_id)
        if not row:
            raise NotFoundError("Post")
        return await _build_post_response(conn, row, current_user_id)


@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    current_user_id: int = Depends(auth.get_current_user),
) -> dict[str, str]:
    async with db.transaction() as conn:
        row = await queries.get_post(conn, post_id)
        if not row:
            raise NotFoundError("Post")
        if row["user_id"] != current_user_id:
            raise ForbiddenError("You can only delete your own posts")
        image_rows = await queries.get_images_for_post(conn, post_id)
        blob_keys = [r["value"] for r in image_rows if r["type"] == "blob"]
        await queries.delete_post(conn, post_id)

    for key in blob_keys:
        try:
            await s3.delete_file(key)
        except Exception:
            log.warning("s3_delete_failed", key=key)

    log.info("post_deleted", post_id=post_id, user_id=current_user_id)
    return {"detail": "Post deleted"}
