import uuid
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core import auth, db, queries, s3
from app.exceptions import ForbiddenError, NotFoundError
from app.schemas.auth import AuthResponse, UserProfileResponse

router = APIRouter()
log = structlog.get_logger()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.get("/{username}", response_model=UserProfileResponse)
async def get_user_profile(username: str) -> UserProfileResponse:
    async with db.get_conn() as conn:
        profile = await queries.get_user_profile(conn, username)
    if not profile:
        raise NotFoundError("User")
    avatar_url = None
    if profile.get("avatar_key"):
        avatar_url = await s3.generate_presigned_url(profile["avatar_key"])
    return UserProfileResponse(
        user_id=profile["user_id"],
        username=profile["username"],
        avatar_url=avatar_url,
        created_at=profile["created_at"],
        post_count=profile["post_count"],
        total_likes=profile["total_likes"],
    )


@router.put("/{username}/avatar", response_model=AuthResponse)
async def upload_avatar(
    username: str,
    avatar: Annotated[UploadFile, File()],
    current_user_id: int = Depends(auth.get_current_user),
) -> AuthResponse:
    async with db.get_conn() as conn:
        user = await queries.get_user_by_username(conn, username)
    if not user:
        raise NotFoundError("User")
    if user["user_id"] != current_user_id:
        raise ForbiddenError("You can only update your own avatar")

    if avatar.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=422, detail=f"Unsupported image type: {avatar.content_type}")
    data = await avatar.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=422, detail="Avatar image exceeds 5 MB limit")

    old_key = user.get("avatar_key")
    new_key = f"avatars/user_{current_user_id}_{uuid.uuid4()}.webp"

    await s3.upload_file(new_key, data, avatar.content_type or "image/jpeg")

    async with db.transaction() as conn:
        await queries.update_avatar(conn, current_user_id, new_key)

    if old_key:
        try:
            await s3.delete_file(old_key)
        except Exception:
            log.warning("old_avatar_delete_failed", key=old_key)

    async with db.get_conn() as conn:
        updated_user = await queries.get_user_by_id(conn, current_user_id)
    avatar_url = await s3.generate_presigned_url(new_key)

    log.info("avatar_updated", user_id=current_user_id, key=new_key)
    return AuthResponse(
        user_id=updated_user["user_id"],
        username=updated_user["username"],
        email=updated_user["email"],
        avatar_url=avatar_url,
    )
