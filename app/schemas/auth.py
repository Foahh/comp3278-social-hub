from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from app.core.constants import APP_CONSTANTS

# GitHub-style usernames (no email stored — account recovery is out of scope by design)
USERNAME_PATTERN = r"^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$"

UsernameStr = Annotated[
    str,
    Field(
        min_length=APP_CONSTANTS.username_min_len,
        max_length=APP_CONSTANTS.username_max_len,
        pattern=USERNAME_PATTERN,
    ),
]


class RegisterRequest(BaseModel):
    username: UsernameStr
    name: str = Field(
        default="",
        min_length=0,
        max_length=APP_CONSTANTS.name_max_length,
    )
    password: str = Field(
        min_length=APP_CONSTANTS.password_min_length,
        max_length=APP_CONSTANTS.password_max_length,
    )

    @field_validator("name", mode="before")
    @classmethod
    def strip_name(cls, v: object) -> object:
        if v is None:
            return ""
        if isinstance(v, str):
            return v.strip()
        return v


class LoginRequest(BaseModel):
    username: str = Field(
        min_length=APP_CONSTANTS.username_min_len,
        max_length=APP_CONSTANTS.username_max_len,
    )
    password: str = Field(min_length=1)


class AuthResponse(BaseModel):
    user_id: int
    username: str
    name: str
    avatar_url: str | None


class UserProfileResponse(BaseModel):
    user_id: int
    username: str
    name: str
    avatar_url: str | None
    created_at: datetime
    post_count: int
    total_likes: int
