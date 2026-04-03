from datetime import UTC


def test_register_request_valid():
    from app.schemas.auth import RegisterRequest

    r = RegisterRequest(username="alice_01", email="a@b.com", password="securepass")
    assert r.username == "alice_01"


def test_register_request_username_too_short():
    from pydantic import ValidationError

    from app.schemas.auth import RegisterRequest

    try:
        RegisterRequest(username="ab", email="a@b.com", password="securepass")
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
        avatar_url=None,
        content="nice",
        created_at=datetime.now(UTC),
    )
    assert c.comment_id == 1
