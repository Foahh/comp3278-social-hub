from datetime import datetime

import aiomysql

# --- Users ---


async def get_user_by_id(conn: aiomysql.Connection, user_id: int) -> dict | None:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        return await cur.fetchone()


async def get_user_by_username(conn: aiomysql.Connection, username: str) -> dict | None:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT * FROM users WHERE LOWER(username) = LOWER(%s)",
            (username,),
        )
        return await cur.fetchone()


async def insert_user(
    conn: aiomysql.Connection, username: str, password_hash: str, name: str
) -> int:
    async with conn.cursor() as cur:
        await cur.execute(
            "INSERT INTO users (username, name, password_hash) VALUES (%s, %s, %s)",
            (username, name, password_hash),
        )
        return cur.lastrowid


async def update_avatar(conn: aiomysql.Connection, user_id: int, avatar_key: str | None) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            "UPDATE users SET avatar_key = %s WHERE user_id = %s", (avatar_key, user_id)
        )


# --- Posts ---


async def get_post(conn: aiomysql.Connection, post_id: int) -> dict | None:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT p.*, u.username, u.name, u.avatar_key FROM posts p "
            "JOIN users u ON p.user_id = u.user_id WHERE p.post_id = %s",
            (post_id,),
        )
        return await cur.fetchone()


async def list_posts_latest(
    conn: aiomysql.Connection,
    cursor_created_at: datetime | None,
    cursor_post_id: int | None,
    limit: int,
) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        if cursor_created_at is not None and cursor_post_id is not None:
            await cur.execute(
                "SELECT p.*, u.username, u.name, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "WHERE (p.created_at, p.post_id) < (%s, %s) "
                "ORDER BY p.created_at DESC, p.post_id DESC LIMIT %s",
                (cursor_created_at, cursor_post_id, limit),
            )
        else:
            await cur.execute(
                "SELECT p.*, u.username, u.name, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "ORDER BY p.created_at DESC, p.post_id DESC LIMIT %s",
                (limit,),
            )
        return await cur.fetchall()


async def list_posts_popular(
    conn: aiomysql.Connection,
    cursor_likes: int | None,
    cursor_id: int | None,
    limit: int,
) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        if cursor_likes is not None and cursor_id is not None:
            await cur.execute(
                "SELECT p.*, u.username, u.name, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "WHERE (p.like_count, p.post_id) < (%s, %s) "
                "ORDER BY p.like_count DESC, p.post_id DESC LIMIT %s",
                (cursor_likes, cursor_id, limit),
            )
        else:
            await cur.execute(
                "SELECT p.*, u.username, u.name, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "ORDER BY p.like_count DESC, p.post_id DESC LIMIT %s",
                (limit,),
            )
        return await cur.fetchall()


async def list_posts_latest_for_user(
    conn: aiomysql.Connection,
    user_id: int,
    cursor_created_at: datetime | None,
    cursor_post_id: int | None,
    limit: int,
) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        if cursor_created_at is not None and cursor_post_id is not None:
            await cur.execute(
                "SELECT p.*, u.username, u.name, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "WHERE p.user_id = %s AND (p.created_at, p.post_id) < (%s, %s) "
                "ORDER BY p.created_at DESC, p.post_id DESC LIMIT %s",
                (user_id, cursor_created_at, cursor_post_id, limit),
            )
        else:
            await cur.execute(
                "SELECT p.*, u.username, u.name, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "WHERE p.user_id = %s "
                "ORDER BY p.created_at DESC, p.post_id DESC LIMIT %s",
                (user_id, limit),
            )
        return await cur.fetchall()


async def list_posts_popular_for_user(
    conn: aiomysql.Connection,
    user_id: int,
    cursor_likes: int | None,
    cursor_id: int | None,
    limit: int,
) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        if cursor_likes is not None and cursor_id is not None:
            await cur.execute(
                "SELECT p.*, u.username, u.name, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "WHERE p.user_id = %s AND (p.like_count, p.post_id) < (%s, %s) "
                "ORDER BY p.like_count DESC, p.post_id DESC LIMIT %s",
                (user_id, cursor_likes, cursor_id, limit),
            )
        else:
            await cur.execute(
                "SELECT p.*, u.username, u.name, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "WHERE p.user_id = %s "
                "ORDER BY p.like_count DESC, p.post_id DESC LIMIT %s",
                (user_id, limit),
            )
        return await cur.fetchall()


async def insert_post(conn: aiomysql.Connection, user_id: int, text_content: str | None) -> int:
    async with conn.cursor() as cur:
        await cur.execute(
            "INSERT INTO posts (user_id, text_content) VALUES (%s, %s)",
            (user_id, text_content),
        )
        return cur.lastrowid


async def delete_post(conn: aiomysql.Connection, post_id: int) -> None:
    async with conn.cursor() as cur:
        await cur.execute("DELETE FROM posts WHERE post_id = %s", (post_id,))


# --- Images ---


async def get_images_for_post(conn: aiomysql.Connection, post_id: int) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT * FROM images WHERE post_id = %s ORDER BY position ASC", (post_id,)
        )
        return await cur.fetchall()


async def get_images_for_posts(
    conn: aiomysql.Connection, post_ids: list[int]
) -> dict[int, list[dict]]:
    """Batch fetch images for multiple posts. Returns dict keyed by post_id."""
    if not post_ids:
        return {}
    placeholders = ",".join(["%s"] * len(post_ids))
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            f"SELECT * FROM images WHERE post_id IN ({placeholders}) "
            "ORDER BY post_id ASC, position ASC",
            post_ids,
        )
        rows = await cur.fetchall()
    result: dict[int, list[dict]] = {pid: [] for pid in post_ids}
    for row in rows:
        result[row["post_id"]].append(row)
    return result


async def get_liked_post_ids(
    conn: aiomysql.Connection, user_id: int, post_ids: list[int]
) -> set[int]:
    """Batch check which posts in post_ids are liked by user_id."""
    if not post_ids:
        return set()
    placeholders = ",".join(["%s"] * len(post_ids))
    async with conn.cursor() as cur:
        await cur.execute(
            f"SELECT post_id FROM likes WHERE user_id = %s AND post_id IN ({placeholders})",
            [user_id, *post_ids],
        )
        rows = await cur.fetchall()
    return {row[0] for row in rows}


async def get_post_like_count(conn: aiomysql.Connection, post_id: int) -> int:
    """Fetch the current like_count for a post."""
    async with conn.cursor() as cur:
        await cur.execute("SELECT like_count FROM posts WHERE post_id = %s", (post_id,))
        row = await cur.fetchone()
    return row[0] if row else 0


async def insert_image(conn: aiomysql.Connection, post_id: int, value: str, position: int) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            "INSERT INTO images (post_id, value, position) VALUES (%s, %s, %s)",
            (post_id, value, position),
        )


# --- Likes ---


async def get_like(conn: aiomysql.Connection, user_id: int, post_id: int) -> dict | None:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT * FROM likes WHERE user_id = %s AND post_id = %s", (user_id, post_id)
        )
        return await cur.fetchone()


async def insert_like(conn: aiomysql.Connection, user_id: int, post_id: int) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            "INSERT INTO likes (user_id, post_id) VALUES (%s, %s)", (user_id, post_id)
        )


async def delete_like(conn: aiomysql.Connection, user_id: int, post_id: int) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            "DELETE FROM likes WHERE user_id = %s AND post_id = %s", (user_id, post_id)
        )


# --- Comments ---


async def list_comments(
    conn: aiomysql.Connection, post_id: int, cursor: int | None, limit: int
) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        if cursor is not None:
            await cur.execute(
                "SELECT c.*, u.username, u.name, u.avatar_key FROM comments c "
                "JOIN users u ON c.user_id = u.user_id "
                "WHERE c.post_id = %s AND c.comment_id > %s ORDER BY c.comment_id ASC LIMIT %s",
                (post_id, cursor, limit),
            )
        else:
            await cur.execute(
                "SELECT c.*, u.username, u.name, u.avatar_key FROM comments c "
                "JOIN users u ON c.user_id = u.user_id "
                "WHERE c.post_id = %s ORDER BY c.comment_id ASC LIMIT %s",
                (post_id, limit),
            )
        return await cur.fetchall()


async def insert_comment(
    conn: aiomysql.Connection, user_id: int, post_id: int, content: str
) -> int:
    async with conn.cursor() as cur:
        await cur.execute(
            "INSERT INTO comments (user_id, post_id, content) VALUES (%s, %s, %s)",
            (user_id, post_id, content),
        )
        return cur.lastrowid


async def recompute_post_engagement_counts(conn: aiomysql.Connection) -> None:
    """Set posts.like_count and posts.comment_count from likes/comments tables."""
    async with conn.cursor() as cur:
        await cur.execute(
            "UPDATE posts p "
            "LEFT JOIN (SELECT post_id, COUNT(*) AS cnt FROM likes GROUP BY post_id) lk "
            "ON lk.post_id = p.post_id "
            "LEFT JOIN (SELECT post_id, COUNT(*) AS cnt FROM comments GROUP BY post_id) cm "
            "ON cm.post_id = p.post_id "
            "SET p.like_count = COALESCE(lk.cnt, 0), "
            "p.comment_count = COALESCE(cm.cnt, 0)"
        )


# --- Users profile (aggregated) ---


async def get_user_profile(conn: aiomysql.Connection, username: str) -> dict | None:
    """Returns user row + post_count + total_likes_received."""
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT u.user_id, u.username, u.name, u.avatar_key, u.created_at, "
            "COUNT(DISTINCT p.post_id) AS post_count, "
            "COALESCE(SUM(p.like_count), 0) AS total_likes "
            "FROM users u "
            "LEFT JOIN posts p ON p.user_id = u.user_id "
            "WHERE LOWER(u.username) = LOWER(%s) "
            "GROUP BY u.user_id, u.username, u.name, u.avatar_key, u.created_at",
            (username,),
        )
        return await cur.fetchone()


# --- Analytics ---


async def get_top_posts_by_likes(conn: aiomysql.Connection, limit: int) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT p.post_id, u.username, p.text_content, p.like_count "
            "FROM posts p JOIN users u ON p.user_id = u.user_id "
            "ORDER BY p.like_count DESC LIMIT %s",
            (limit,),
        )
        return await cur.fetchall()


async def get_top_users_by_activity(conn: aiomysql.Connection, limit: int) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT u.username, u.name, "
            "COUNT(DISTINCT p.post_id) AS post_count, "
            "COALESCE(SUM(p.like_count), 0) AS total_likes "
            "FROM users u LEFT JOIN posts p ON p.user_id = u.user_id "
            "GROUP BY u.user_id, u.username, u.name "
            "ORDER BY post_count DESC LIMIT %s",
            (limit,),
        )
        return await cur.fetchall()


async def get_posts_per_day(conn: aiomysql.Connection, days: int) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT DATE(created_at) AS date, COUNT(*) AS count "
            "FROM posts WHERE created_at >= NOW() - INTERVAL %s DAY "
            "GROUP BY DATE(created_at) ORDER BY date ASC",
            (days,),
        )
        return await cur.fetchall()


async def get_likes_per_day(conn: aiomysql.Connection, days: int) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT DATE(created_at) AS date, COUNT(*) AS count "
            "FROM likes WHERE created_at >= NOW() - INTERVAL %s DAY "
            "GROUP BY DATE(created_at) ORDER BY date ASC",
            (days,),
        )
        return await cur.fetchall()
