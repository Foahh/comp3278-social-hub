from datetime import datetime

from pydantic import BaseModel, Field


class CreateCommentRequest(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


class CommentResponse(BaseModel):
    comment_id: int
    user_id: int
    username: str
    avatar_url: str | None
    content: str
    created_at: datetime
