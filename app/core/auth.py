from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import HTTPException, Request


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: int) -> str:
    from app.core.config import settings
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expire_hours),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm="HS256")


def get_current_user(request: Request) -> int:
    """FastAPI dependency. Returns user_id or raises 401."""
    from app.core.config import settings
    token = request.cookies.get("session")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return int(payload["user_id"])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid session")


def get_optional_user(request: Request) -> int | None:
    """Same as get_current_user but returns None instead of 401."""
    try:
        return get_current_user(request)
    except HTTPException:
        return None
