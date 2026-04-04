from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import aioboto3
from botocore.config import Config as BotoConfig

_session: aioboto3.Session | None = None


def init_s3() -> None:
    global _session
    _session = aioboto3.Session()


@asynccontextmanager
async def _client() -> AsyncGenerator:
    from app.core.config import settings

    assert _session is not None
    async with _session.client(
        "s3",
        endpoint_url=settings.s3_endpoint_url,
        aws_access_key_id=settings.s3_access_key,
        aws_secret_access_key=settings.s3_secret_key,
        config=BotoConfig(signature_version="s3v4"),
    ) as client:
        yield client


async def upload_file(key: str, data: bytes, content_type: str) -> None:
    from app.core.config import settings

    async with _client() as client:
        await client.put_object(
            Bucket=settings.s3_bucket,
            Key=key,
            Body=data,
            ContentType=content_type,
        )


S3_OBJECT_PREFIX = "s3://"


async def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    from app.core.config import settings

    async with _client() as client:
        return await client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.s3_bucket, "Key": key},
            ExpiresIn=expires_in,
        )


def s3_object_key_for_avatar_delete(avatar_ref: str) -> str | None:
    """Return the S3 object key to delete, or None if the value is a plain URL (not our bucket).

    Used for ``avatar_key`` and ``images.value`` (``s3://…``).
    """
    if avatar_ref.startswith(("http://", "https://")):
        return None
    if avatar_ref.startswith(S3_OBJECT_PREFIX):
        return avatar_ref[len(S3_OBJECT_PREFIX) :]
    return avatar_ref


async def resolve_avatar_url(avatar_ref: str | None) -> str | None:
    """Turn a stored media ref into a browser-usable URL (avatars and post images).

    Values starting with ``s3://`` are S3 object keys (presigned). ``http(s)://`` are used as-is.
    Bare keys (no scheme) are treated as legacy S3 keys for backward compatibility.
    """
    if not avatar_ref:
        return None
    if avatar_ref.startswith(("http://", "https://")):
        return avatar_ref
    key = (
        avatar_ref[len(S3_OBJECT_PREFIX) :]
        if avatar_ref.startswith(S3_OBJECT_PREFIX)
        else avatar_ref
    )
    return await generate_presigned_url(key)


async def delete_file(key: str) -> None:
    from app.core.config import settings

    async with _client() as client:
        await client.delete_object(Bucket=settings.s3_bucket, Key=key)


async def ensure_bucket() -> None:
    """Create the bucket if it doesn't exist. Called once at startup."""
    from botocore.exceptions import ClientError

    from app.core.config import settings

    async with _client() as client:
        try:
            await client.head_bucket(Bucket=settings.s3_bucket)
        except ClientError as e:
            if e.response["Error"]["Code"] in ("404", "NoSuchBucket"):
                await client.create_bucket(Bucket=settings.s3_bucket)
            else:
                raise
