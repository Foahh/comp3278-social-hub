import uuid
from typing import Annotated

import structlog
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core import auth, db, queries, s3
from app.core.constants import APP_CONSTANTS
from app.exceptions import ForbiddenError, NotFoundError
from app.schemas.auth import AuthResponse, UsernameStr, UserProfileResponse

router = APIRouter()
log = structlog.get_logger()


@router.get("/{username}", response_model=UserProfileResponse)
async def get_user_profile(username: UsernameStr) -> UserProfileResponse:
    async with db.get_conn() as conn:
        profile = await queries.get_user_profile(conn, username)
    if not profile:
        raise NotFoundError("User")
    avatar_url = None
    if profile.get("avatar_key"):
        avatar_url = await s3.resolve_avatar_url(profile["avatar_key"])
    return UserProfileResponse(
        user_id=profile["user_id"],
        username=profile["username"],
        name=profile["name"],
        avatar_url=avatar_url,
        created_at=profile["created_at"],
        post_count=profile["post_count"],
        total_likes=profile["total_likes"],
    )


@router.put("/{username}/avatar", response_model=AuthResponse)
async def upload_avatar(
    username: UsernameStr,
    avatar: Annotated[UploadFile, File()],
    current_user_id: int = Depends(auth.get_current_user),
) -> AuthResponse:
    async with db.get_conn() as conn:
        user = await queries.get_user_by_username(conn, username)
    if not user:
        raise NotFoundError("User")
    if user["user_id"] != current_user_id:
        raise ForbiddenError("You can only update your own avatar")

    if avatar.content_type not in APP_CONSTANTS.allowed_image_mime_types:
        raise HTTPException(
            status_code=422, detail=f"Unsupported image type: {avatar.content_type}"
        )
    data = await avatar.read()
    if len(data) > APP_CONSTANTS.max_image_upload_bytes:
        raise HTTPException(
            status_code=422,
            detail=f"Avatar image exceeds {APP_CONSTANTS.image_upload_max_mb} MB limit",
        )

    old_ref = user.get("avatar_key")
    object_key = f"avatars/user_{current_user_id}_{uuid.uuid4()}.webp"
    stored_ref = f"{s3.S3_OBJECT_PREFIX}{object_key}"

    mime = avatar.content_type or APP_CONSTANTS.default_image_mime_type
    await s3.upload_file(object_key, data, mime)

    async with db.transaction() as conn:
        await queries.update_avatar(conn, current_user_id, stored_ref)

    old_s3_key = s3.s3_object_key_for_avatar_delete(old_ref) if old_ref else None
    if old_s3_key:
        try:
            await s3.delete_file(old_s3_key)
        except Exception:
            log.warning("old_avatar_delete_failed", key=old_s3_key)

    async with db.get_conn() as conn:
        updated_user = await queries.get_user_by_id(conn, current_user_id)
    avatar_url = await s3.resolve_avatar_url(stored_ref)

    log.info("avatar_updated", user_id=current_user_id, key=object_key)
    return AuthResponse(
        user_id=updated_user["user_id"],
        username=updated_user["username"],
        name=updated_user["name"],
        avatar_url=avatar_url,
    )
