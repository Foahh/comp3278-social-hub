from unittest.mock import AsyncMock, patch

import pytest

from app.core import s3


def test_s3_object_key_for_avatar_delete():
    assert s3.s3_object_key_for_avatar_delete("s3://avatars/u1.webp") == "avatars/u1.webp"
    assert s3.s3_object_key_for_avatar_delete("avatars/legacy.webp") == "avatars/legacy.webp"
    assert s3.s3_object_key_for_avatar_delete("https://cdn/x.jpg") is None
    assert s3.s3_object_key_for_avatar_delete("http://cdn/x.jpg") is None


@pytest.mark.asyncio
async def test_resolve_avatar_url_http():
    assert await s3.resolve_avatar_url("https://example.com/a.png") == "https://example.com/a.png"
    assert await s3.resolve_avatar_url(None) is None


@pytest.mark.asyncio
async def test_resolve_avatar_url_s3_prefix():
    with patch.object(s3, "generate_presigned_url", new_callable=AsyncMock) as m:
        m.return_value = "https://signed"
        out = await s3.resolve_avatar_url("s3://avatars/x.webp")
    m.assert_awaited_once_with("avatars/x.webp")
    assert out == "https://signed"


@pytest.mark.asyncio
async def test_resolve_avatar_url_legacy_bare_key():
    with patch.object(s3, "generate_presigned_url", new_callable=AsyncMock) as m:
        m.return_value = "https://signed"
        out = await s3.resolve_avatar_url("avatars/old.webp")
    m.assert_awaited_once_with("avatars/old.webp")
    assert out == "https://signed"
