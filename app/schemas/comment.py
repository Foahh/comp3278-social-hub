from datetime import datetime

from pydantic import BaseModel, Field

from app.core.constants import APP_CONSTANTS


class CreateCommentRequest(BaseModel):
    content: str = Field(min_length=1, max_length=APP_CONSTANTS.max_comment_length)


class CommentResponse(BaseModel):
    comment_id: int
    user_id: int
    username: str
    avatar_url: str | None
    content: str
    created_at: datetime
