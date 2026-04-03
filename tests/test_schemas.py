from datetime import UTC


def test_register_request_valid():
    from app.schemas.auth import RegisterRequest

    r = RegisterRequest(username="alice-01", name="Alice", password="securepass")
    assert r.username == "alice-01"


def test_register_request_name_empty_or_omitted():
    from app.schemas.auth import RegisterRequest

    assert RegisterRequest(username="alice-01", name="", password="securepass").name == ""
    assert RegisterRequest(username="alice-01", password="securepass").name == ""


def test_register_request_name_null_becomes_empty():
    from app.schemas.auth import RegisterRequest

    r = RegisterRequest(username="alice-01", name=None, password="securepass")
    assert r.name == ""


def test_register_request_name_too_long():
    from pydantic import ValidationError

    from app.schemas.auth import RegisterRequest

    try:
        RegisterRequest(username="alice-01", name="x" * 51, password="securepass")
        raise AssertionError("should have raised")
    except ValidationError:
        pass


def test_register_request_single_char_username():
    from pydantic import ValidationError

    from app.schemas.auth import RegisterRequest

    for short in ("a", "ab"):
        try:
            RegisterRequest(username=short, name="X", password="securepass")
            raise AssertionError(f"expected ValidationError for {short!r}")
        except ValidationError:
            pass


def test_register_request_username_invalid_pattern():
    from pydantic import ValidationError

    from app.schemas.auth import RegisterRequest

    invalid = ("alice_01", "-bad", "bad-", "user--name", "")
    for u in invalid:
        try:
            RegisterRequest(username=u, name="X", password="securepass")
            raise AssertionError(f"expected ValidationError for {u!r}")
        except ValidationError:
            pass


def test_register_request_username_too_long():
    from pydantic import ValidationError

    from app.schemas.auth import RegisterRequest

    try:
        RegisterRequest(username="a" * 40, name="X", password="securepass")
        raise AssertionError("should have raised")
    except ValidationError:
        pass


def test_post_response_construction():
    from datetime import datetime

    from app.schemas.post import ImageResponse, PostResponse

    pr = PostResponse(
        post_id=1,
        user_id=2,
        username="bob",
        name="Bob",
        avatar_url=None,
        text_content="hello",
        images=[ImageResponse(image_id=1, url="http://x.com/a.jpg", position=0)],
        like_count=5,
        comment_count=2,
        liked_by_me=False,
        created_at=datetime.now(UTC),
    )
    assert pr.post_id == 1
    assert len(pr.images) == 1


def test_like_toggle_response():
    from app.schemas.like import LikeToggleResponse

    r = LikeToggleResponse(liked=True, like_count=10)
    assert r.liked is True


def test_comment_response_construction():
    from datetime import datetime

    from app.schemas.comment import CommentResponse

    c = CommentResponse(
        comment_id=1,
        user_id=2,
        username="carol",
        name="Carol",
        avatar_url=None,
        content="nice",
        created_at=datetime.now(UTC),
    )
    assert c.comment_id == 1
