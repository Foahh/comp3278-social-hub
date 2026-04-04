"""Load demo users, posts, images, likes, and comments into MySQL.

uv run python scripts/seed.py --help

All seeded users share the same password (default: 12345678).
"""

from __future__ import annotations

import argparse
import asyncio
import string
import sys
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parent.parent
if str(_REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPO_ROOT))

import aiomysql
from faker import Faker
from tqdm import tqdm

from app.core.auth import hash_password
from app.core.config import settings
from app.core.constants import APP_CONSTANTS

type UserRow = tuple[str, str, str, str, datetime]
type PostRow = tuple[int, str, datetime]
type ImageRow = tuple[int, str, int]
type LikeRow = tuple[int, int, datetime]
type CommentRow = tuple[int, int, str, datetime]

_USER_BATCH = 2000

_ALNUM = string.ascii_lowercase + string.digits


def _unique_seed_username(fake: Faker) -> str:
    """Alphanumeric only (GitHub-style path-safe); avoids Faker user_name() underscores/dots."""
    length = fake.random_int(min=3, max=20)
    return fake.unique.lexify("?" * length, letters=_ALNUM)


_POST_BATCH = 500
_ROWS_PER_INSERT = 3000

_ENGAGEMENT_ROWS_PER_INSERT = 5000
_CONNECT_TIMEOUT_SEC = 15


@dataclass(frozen=True)
class SeedConfig:
    password_plain: str
    num_users: int
    num_posts: int
    max_likes_per_post: int
    max_comments_per_post: int
    timestamp_window_days: int


@dataclass(frozen=True)
class SeedResult:
    usernames: list[str]
    posts_created: int
    images_created: int
    likes_created: int
    comments_created: int


async def _insert_many(
    conn: aiomysql.Connection,
    *,
    table: str,
    columns: tuple[str, ...],
    rows: list[tuple],
) -> int:
    """Insert rows in one statement and return the number inserted."""
    if not rows:
        return 0

    placeholders = ",".join(["(" + ",".join(["%s"] * len(columns)) + ")"] * len(rows))
    flat = [value for row in rows for value in row]
    cols_sql = ", ".join(columns)

    async with conn.cursor() as cur:
        await cur.execute(
            f"INSERT INTO {table} ({cols_sql}) VALUES {placeholders}",
            flat,
        )
        return int(cur.rowcount)


async def _insert_many_returning_ids(
    conn: aiomysql.Connection,
    *,
    table: str,
    columns: tuple[str, ...],
    rows: list[tuple],
) -> list[int]:
    """Insert rows in one statement and return contiguous inserted IDs in order."""
    if not rows:
        return []

    placeholders = ",".join(["(" + ",".join(["%s"] * len(columns)) + ")"] * len(rows))
    flat = [value for row in rows for value in row]
    cols_sql = ", ".join(columns)

    async with conn.cursor() as cur:
        await cur.execute(
            f"INSERT INTO {table} ({cols_sql}) VALUES {placeholders}",
            flat,
        )
        first_id = int(cur.lastrowid)
        inserted = int(cur.rowcount)

    if inserted != len(rows):
        msg = f"expected {len(rows)} rows inserted into {table}, got {inserted}"
        raise RuntimeError(msg)

    return list(range(first_id, first_id + inserted))


async def _chunked(
    rows: list[tuple],
    size: int,
    inserter: Callable[[list[tuple]], Awaitable[None]],
) -> None:
    for i in range(0, len(rows), size):
        await inserter(rows[i : i + size])


async def _insert_users_batch(
    conn: aiomysql.Connection,
    rows: list[UserRow],
) -> list[int]:
    return await _insert_many_returning_ids(
        conn,
        table="users",
        columns=("username", "password_hash", "name", "avatar_key", "created_at"),
        rows=rows,
    )


async def _insert_posts_batch(
    conn: aiomysql.Connection,
    rows: list[PostRow],
) -> list[int]:
    return await _insert_many_returning_ids(
        conn,
        table="posts",
        columns=("user_id", "text_content", "created_at"),
        rows=rows,
    )


async def _insert_images_batch(
    conn: aiomysql.Connection,
    rows: list[ImageRow],
) -> None:
    await _insert_many(
        conn,
        table="images",
        columns=("post_id", "value", "position"),
        rows=rows,
    )


async def _insert_likes_batch(
    conn: aiomysql.Connection,
    rows: list[LikeRow],
) -> None:
    await _insert_many(
        conn,
        table="likes",
        columns=("user_id", "post_id", "created_at"),
        rows=rows,
    )


async def _insert_comments_batch(
    conn: aiomysql.Connection,
    rows: list[CommentRow],
) -> None:
    await _insert_many(
        conn,
        table="comments",
        columns=("user_id", "post_id", "content", "created_at"),
        rows=rows,
    )


async def _truncate_all(conn: aiomysql.Connection) -> None:
    async with conn.cursor() as cur:
        await cur.execute("SET FOREIGN_KEY_CHECKS = 0")
        try:
            for table in ("comments", "likes", "images", "posts", "users"):
                await cur.execute(f"TRUNCATE TABLE {table}")
        finally:
            await cur.execute("SET FOREIGN_KEY_CHECKS = 1")


async def _user_count(conn: aiomysql.Connection) -> int:
    async with conn.cursor() as cur:
        await cur.execute("SELECT COUNT(*) FROM users")
        row = await cur.fetchone()
        return int(row[0]) if row else 0


def _random_post_text(fake: Faker) -> str:
    """Variable-length post body; capped at constants.json max_post_text_length."""
    max_chars = fake.random_int(min=25, max=APP_CONSTANTS.max_post_text_length)
    text = fake.text(max_nb_chars=max_chars).replace("\n", " ").strip()
    if len(text) < 10:
        text = (
            fake.paragraph(nb_sentences=fake.random_int(min=1, max=5))
            .replace("\n", " ")
            .strip()
        )
    return text[: APP_CONSTANTS.max_post_text_length]


def _random_comment_text(fake: Faker) -> str:
    """Variable-length comment; capped at constants.json max_comment_length."""
    if fake.boolean(chance_of_getting_true=55):
        words = fake.random_int(min=2, max=20)
        text = fake.sentence(nb_words=words).strip()
    else:
        max_chars = fake.random_int(min=8, max=APP_CONSTANTS.max_comment_length)
        text = fake.text(max_nb_chars=max_chars).replace("\n", " ").strip()
        if len(text) < 3:
            text = fake.sentence(nb_words=fake.random_int(min=3, max=8)).strip()
    return text[: APP_CONSTANTS.max_comment_length]


_IMAGE_ASPECTS: tuple[tuple[int, int], ...] = (
    (1, 1),
    (4, 3),
    (3, 4),
    (3, 2),
    (2, 3),
    (16, 9),
    (9, 16),
)


def _random_avatar_url(fake: Faker) -> str:
    """HTTPS image URL for avatar_key; resolves as-is in app (no S3 upload in seed)."""
    url = fake.image_url(width=300, height=300)
    while "placekitten.com" in url.lower():
        url = fake.image_url(width=300, height=300)
    return url


def _random_image_url(fake: Faker) -> str:
    aw, ah = fake.random_element(elements=_IMAGE_ASPECTS)
    max_side = fake.random_int(min=400, max=1600)
    if aw >= ah:
        width = max_side
        height = max(120, round(max_side * ah / aw))
    else:
        height = max_side
        width = max(120, round(max_side * aw / ah))
    width = max(120, min(width, 1920))
    height = max(120, min(height, 1920))
    url = fake.image_url(width=width, height=height)
    while "placekitten.com" in url.lower():
        url = fake.image_url(width=width, height=height)
    return url


def _pick_distinct_user_ids(fake: Faker, user_ids: list[int], k: int) -> list[int]:
    """Return up to k distinct users."""
    if k <= 0 or not user_ids:
        return []
    return fake.random.sample(user_ids, k=min(k, len(user_ids)))


def _uniform_count(fake: Faker, max_v: int) -> int:
    """Integer in [0, max_v] inclusive, uniform."""
    if max_v <= 0:
        return 0
    return fake.random_int(min=0, max=max_v)


def _random_dt_between(fake: Faker, start: datetime, end: datetime) -> datetime:
    """Uniform random time in [start, end]; uses Faker for reproducible seeds."""
    if start >= end:
        return start
    return fake.date_time_between(start_date=start, end_date=end)


async def _apply_bulk_insert_session(conn: aiomysql.Connection) -> None:
    """Speed large InnoDB inserts (restored before commit/rollback)."""
    async with conn.cursor() as cur:
        await cur.execute("SET SESSION unique_checks = 0")


async def _restore_session_defaults(conn: aiomysql.Connection) -> None:
    async with conn.cursor() as cur:
        await cur.execute("SET SESSION unique_checks = 1")


async def _seed(
    conn: aiomysql.Connection,
    fake: Faker,
    config: SeedConfig,
    *,
    progress: bool = True,
) -> SeedResult:
    """Seed users, then posts+images, then likes, then comments (one transaction)."""
    password_hash = hash_password(config.password_plain)
    usernames: list[str] = []
    user_ids: list[int] = []
    window_end = datetime.now()
    window_start = window_end - timedelta(days=config.timestamp_window_days)
    user_join_at: dict[int, datetime] = {}
    post_created_at: dict[int, datetime] = {}

    await conn.begin()
    try:
        await _apply_bulk_insert_session(conn)

        users_created = 0
        user_pbar = tqdm(
            total=config.num_users,
            desc="Users",
            unit="user",
            disable=not progress,
        )
        try:
            while users_created < config.num_users:
                chunk_size = min(_USER_BATCH, config.num_users - users_created)
                batch: list[UserRow] = []

                for _ in range(chunk_size):
                    username = _unique_seed_username(fake)
                    usernames.append(username)
                    joined = _random_dt_between(fake, window_start, window_end)
                    batch.append(
                        (username, password_hash, fake.name(), _random_avatar_url(fake), joined)
                    )

                new_user_ids = await _insert_users_batch(conn, batch)
                for uid, row in zip(new_user_ids, batch, strict=True):
                    user_join_at[int(uid)] = row[4]
                user_ids.extend(new_user_ids)

                users_created += chunk_size
                user_pbar.update(chunk_size)
        finally:
            user_pbar.close()

        images_created = 0
        all_post_ids: list[int] = []

        posts_created = 0
        post_pbar = tqdm(
            total=config.num_posts,
            desc="Posts",
            unit="post",
            disable=not progress,
        )
        try:
            while posts_created < config.num_posts:
                chunk_size = min(_POST_BATCH, config.num_posts - posts_created)

                post_rows: list[PostRow] = []
                for _ in range(chunk_size):
                    author_id = int(fake.random_element(user_ids))
                    author_join = user_join_at[author_id]
                    created = _random_dt_between(fake, author_join, window_end)
                    post_rows.append((author_id, _random_post_text(fake), created))

                post_ids = await _insert_posts_batch(conn, post_rows)
                for pid, row in zip(post_ids, post_rows, strict=True):
                    post_created_at[int(pid)] = row[2]
                all_post_ids.extend(post_ids)

                image_rows: list[ImageRow] = []
                for post_id in post_ids:
                    image_count = fake.random_int(min=0, max=5)
                    for position in range(image_count):
                        image_rows.append((post_id, _random_image_url(fake), position))

                if image_rows:
                    await _chunked(
                        image_rows,
                        _ROWS_PER_INSERT,
                        lambda chunk: _insert_images_batch(conn, chunk),
                    )
                    images_created += len(image_rows)

                posts_created += chunk_size
                post_pbar.update(chunk_size)
        finally:
            post_pbar.close()

        likes_created = 0
        likes_buffer: list[LikeRow] = []

        async def flush_likes() -> None:
            nonlocal likes_buffer, likes_created
            if not likes_buffer:
                return

            await _chunked(
                likes_buffer,
                _ENGAGEMENT_ROWS_PER_INSERT,
                lambda chunk: _insert_likes_batch(conn, chunk),
            )

            likes_created += len(likes_buffer)
            likes_buffer = []

        likes_pbar = tqdm(
            total=len(all_post_ids),
            desc="Likes",
            unit="post",
            disable=not progress,
        )
        try:
            for post_id in all_post_ids:
                like_count = _uniform_count(fake, config.max_likes_per_post)
                for user_id in _pick_distinct_user_ids(fake, user_ids, like_count):
                    uid = int(user_id)
                    pid = int(post_id)
                    earliest = max(user_join_at[uid], post_created_at[pid])
                    liked_at = _random_dt_between(fake, earliest, window_end)
                    likes_buffer.append((uid, pid, liked_at))
                    if len(likes_buffer) >= _ENGAGEMENT_ROWS_PER_INSERT:
                        await flush_likes()
                likes_pbar.update(1)
        finally:
            likes_pbar.close()

        await flush_likes()

        comments_created = 0
        comments_buffer: list[CommentRow] = []

        async def flush_comments() -> None:
            nonlocal comments_buffer, comments_created
            if not comments_buffer:
                return

            await _chunked(
                comments_buffer,
                _ENGAGEMENT_ROWS_PER_INSERT,
                lambda chunk: _insert_comments_batch(conn, chunk),
            )

            comments_created += len(comments_buffer)
            comments_buffer = []

        comments_pbar = tqdm(
            total=len(all_post_ids),
            desc="Comments",
            unit="post",
            disable=not progress,
        )
        try:
            for post_id in all_post_ids:
                comment_count = _uniform_count(fake, config.max_comments_per_post)
                for _ in range(comment_count):
                    commenter_id = int(fake.random_element(user_ids))
                    pid = int(post_id)
                    earliest = max(user_join_at[commenter_id], post_created_at[pid])
                    commented_at = _random_dt_between(fake, earliest, window_end)
                    comments_buffer.append(
                        (commenter_id, pid, _random_comment_text(fake), commented_at)
                    )
                    if len(comments_buffer) >= _ENGAGEMENT_ROWS_PER_INSERT:
                        await flush_comments()
                comments_pbar.update(1)
        finally:
            comments_pbar.close()

        await flush_comments()

        await conn.commit()

    except Exception:
        await conn.rollback()
        raise
    finally:
        await _restore_session_defaults(conn)

    return SeedResult(
        usernames=usernames,
        posts_created=config.num_posts,
        images_created=images_created,
        likes_created=likes_created,
        comments_created=comments_created,
    )


async def main(
    *,
    reset: bool,
    faker_seed: int,
    config: SeedConfig,
    progress: bool,
) -> None:
    conn = await aiomysql.connect(
        host=settings.mysql_host,
        port=settings.mysql_port,
        user=settings.mysql_user,
        password=settings.mysql_password,
        db=settings.mysql_database,
        autocommit=True,
        connect_timeout=_CONNECT_TIMEOUT_SEC,
    )

    try:
        if not reset:
            existing_users = await _user_count(conn)
            if existing_users > 0:
                print(
                    f"Database already has {existing_users} user(s). "
                    "Use --reset to truncate and re-seed."
                )
                return

        if reset:
            await _truncate_all(conn)
            print("Truncated users, posts, images, likes, and comments.")

        fake = Faker()
        fake.seed_instance(faker_seed)

        print("Seeding...")

        result = await _seed(conn, fake, config, progress=progress)

        sample = ", ".join(result.usernames[:3])
        if len(result.usernames) > 3:
            sample += ", …"

        print(
            f"Seeded {len(result.usernames)} users ({sample}), "
            f"{result.posts_created} posts, "
            f"{result.images_created} images, "
            f"{result.likes_created} likes, "
            f"{result.comments_created} comments. "
            f"Password for each user: {config.password_plain!r}"
        )
    finally:
        await conn.ensure_closed()


def _parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Seed MySQL with generated demo data.")
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Truncate all tables (FK order handled) before inserting seed rows.",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        dest="faker_seed",
        help="RNG seed passed to Faker.seed_instance() for reproducible data (default: 42).",
    )
    parser.add_argument(
        "--password",
        default="12345678",
        help="Plain-text password for every seeded user (default: 12345678).",
    )
    parser.add_argument(
        "--users",
        type=int,
        default=1000,
        help="Number of users (default: 12000).",
    )
    parser.add_argument(
        "--posts",
        type=int,
        default=1000,
        help="Number of posts (default: 100000).",
    )
    parser.add_argument(
        "--max-likes-per-post",
        type=int,
        default=100,
        metavar="N",
        help=(
            "Cap on likes per post; each post gets a uniform random count in [0, N] (default: 100)."
        ),
    )
    parser.add_argument(
        "--max-comments-per-post",
        type=int,
        default=100,
        metavar="N",
        help=(
            "Cap on comments per post; uniform random count in [0, N] per post (default: 100)."
        ),
    )
    parser.add_argument(
        "--timestamp-window-days",
        type=int,
        default=30,
        metavar="D",
        help=(
            "Spread created_at timestamps uniformly at random within the last D days "
            "(users, posts, likes, comments; default: 30)."
        ),
    )
    parser.add_argument(
        "--no-progress",
        action="store_true",
        help="Disable tqdm progress bars.",
    )

    args = parser.parse_args()

    if args.users < 1:
        parser.error("--users must be at least 1")
    if args.posts < 1:
        parser.error("--posts must be at least 1 (likes and comments need posts)")
    if args.timestamp_window_days < 1:
        parser.error("--timestamp-window-days must be at least 1")

    for name, value in (
        ("--max-likes-per-post", args.max_likes_per_post),
        ("--max-comments-per-post", args.max_comments_per_post),
    ):
        if value < 0:
            parser.error(f"{name} must be non-negative")

    return args


def run() -> None:
    args = _parse_args()

    config = SeedConfig(
        password_plain=args.password,
        num_users=args.users,
        num_posts=args.posts,
        max_likes_per_post=args.max_likes_per_post,
        max_comments_per_post=args.max_comments_per_post,
        timestamp_window_days=args.timestamp_window_days,
    )

    asyncio.run(
        main(
            reset=args.reset,
            faker_seed=args.faker_seed,
            config=config,
            progress=not args.no_progress,
        )
    )


if __name__ == "__main__":
    run()
