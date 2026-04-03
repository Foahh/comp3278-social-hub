from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


class AuthResponse(BaseModel):
    user_id: int
    username: str
    email: str
    avatar_url: str | None


class UserProfileResponse(BaseModel):
    user_id: int
    username: str
    avatar_url: str | None
    created_at: datetime
    post_count: int
    total_likes: int
