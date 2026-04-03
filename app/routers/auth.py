import structlog
from fastapi import APIRouter, Depends, HTTPException, Response

from app.core import auth, db, queries, s3
from app.exceptions import ConflictError, NotFoundError
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest

router = APIRouter()
log = structlog.get_logger()

PAGE_LIMIT = 20


async def _build_auth_response(conn, user_id: int) -> AuthResponse:
    user = await queries.get_user_by_id(conn, user_id)
    if not user:
        raise NotFoundError("User")
    avatar_url = None
    if user["avatar_key"]:
        avatar_url = await s3.generate_presigned_url(user["avatar_key"])
    return AuthResponse(
        user_id=user["user_id"],
        username=user["username"],
        email=user["email"],
        avatar_url=avatar_url,
    )


@router.post("/register", response_model=AuthResponse)
async def register(body: RegisterRequest, response: Response) -> AuthResponse:
    async with db.transaction() as conn:
        if await queries.get_user_by_email(conn, body.email):
            raise ConflictError("Email already registered")
        if await queries.get_user_by_username(conn, body.username):
            raise ConflictError("Username already taken")
        hashed = auth.hash_password(body.password)
        user_id = await queries.insert_user(conn, body.username, body.email, hashed)

    async with db.get_conn() as conn:
        result = await _build_auth_response(conn, user_id)

    token = auth.create_token(user_id)
    response.set_cookie("session", token, httponly=True, samesite="lax")
    log.info("user_registered", user_id=user_id, username=body.username)
    return result


@router.post("/login", response_model=AuthResponse)
async def login(body: LoginRequest, response: Response) -> AuthResponse:
    async with db.get_conn() as conn:
        user = await queries.get_user_by_email(conn, body.email)
    if not user or not auth.verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    avatar_url = None
    if user.get("avatar_key"):
        avatar_url = await s3.generate_presigned_url(user["avatar_key"])
    result = AuthResponse(
        user_id=user["user_id"],
        username=user["username"],
        email=user["email"],
        avatar_url=avatar_url,
    )

    token = auth.create_token(user["user_id"])
    response.set_cookie("session", token, httponly=True, samesite="lax")
    log.info("user_logged_in", user_id=user["user_id"])
    return result


@router.post("/logout")
async def logout(
    response: Response,
    user_id: int = Depends(auth.get_current_user),
) -> dict[str, str]:
    response.delete_cookie("session")
    log.info("user_logged_out", user_id=user_id)
    return {"detail": "Logged out"}


@router.get("/me", response_model=AuthResponse)
async def me(user_id: int = Depends(auth.get_current_user)) -> AuthResponse:
    async with db.get_conn() as conn:
        return await _build_auth_response(conn, user_id)
