from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, HttpUrl


class FeedSort(str, Enum):
    latest = "latest"
    popular = "popular"


class ImageType(str, Enum):
    blob = "blob"
    url = "url"


class ImageInput(BaseModel):
    """Used in create-post requests for URL-type images."""
    url: HttpUrl


class ImageResponse(BaseModel):
    image_id: int
    url: str
    position: int


class PostResponse(BaseModel):
    post_id: int
    user_id: int
    username: str
    avatar_url: str | None
    text_content: str | None
    images: list[ImageResponse]
    like_count: int
    comment_count: int
    liked_by_me: bool
    created_at: datetime


class PostListResponse(BaseModel):
    posts: list[PostResponse]
    next_cursor: int | None
