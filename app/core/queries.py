import aiomysql


# --- Users ---


async def get_user_by_id(conn: aiomysql.Connection, user_id: int) -> dict | None:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT * FROM users WHERE user_id = %s", (user_id,))
        return await cur.fetchone()


async def get_user_by_email(conn: aiomysql.Connection, email: str) -> dict | None:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT * FROM users WHERE email = %s", (email,))
        return await cur.fetchone()


async def get_user_by_username(conn: aiomysql.Connection, username: str) -> dict | None:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute("SELECT * FROM users WHERE username = %s", (username,))
        return await cur.fetchone()


async def insert_user(
    conn: aiomysql.Connection, username: str, email: str, password_hash: str
) -> int:
    async with conn.cursor() as cur:
        await cur.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s)",
            (username, email, password_hash),
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
            "SELECT p.*, u.username, u.avatar_key FROM posts p "
            "JOIN users u ON p.user_id = u.user_id WHERE p.post_id = %s",
            (post_id,),
        )
        return await cur.fetchone()


async def list_posts_latest(
    conn: aiomysql.Connection, cursor: int | None, limit: int
) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        if cursor is not None:
            await cur.execute(
                "SELECT p.*, u.username, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "WHERE p.post_id < %s ORDER BY p.post_id DESC LIMIT %s",
                (cursor, limit),
            )
        else:
            await cur.execute(
                "SELECT p.*, u.username, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id ORDER BY p.post_id DESC LIMIT %s",
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
                "SELECT p.*, u.username, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "WHERE (p.like_count, p.post_id) < (%s, %s) "
                "ORDER BY p.like_count DESC, p.post_id DESC LIMIT %s",
                (cursor_likes, cursor_id, limit),
            )
        else:
            await cur.execute(
                "SELECT p.*, u.username, u.avatar_key FROM posts p "
                "JOIN users u ON p.user_id = u.user_id "
                "ORDER BY p.like_count DESC, p.post_id DESC LIMIT %s",
                (limit,),
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


async def insert_image(
    conn: aiomysql.Connection, post_id: int, type: str, value: str, position: int
) -> None:
    async with conn.cursor() as cur:
        await cur.execute(
            "INSERT INTO images (post_id, type, value, position) VALUES (%s, %s, %s, %s)",
            (post_id, type, value, position),
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


async def list_comments(conn: aiomysql.Connection, post_id: int) -> list[dict]:
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT c.*, u.username, u.avatar_key FROM comments c "
            "JOIN users u ON c.user_id = u.user_id "
            "WHERE c.post_id = %s ORDER BY c.created_at ASC",
            (post_id,),
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


# --- Users profile (aggregated) ---


async def get_user_profile(conn: aiomysql.Connection, username: str) -> dict | None:
    """Returns user row + post_count + total_likes_received."""
    async with conn.cursor(aiomysql.DictCursor) as cur:
        await cur.execute(
            "SELECT u.user_id, u.username, u.avatar_key, u.created_at, "
            "COUNT(DISTINCT p.post_id) AS post_count, "
            "COALESCE(SUM(p.like_count), 0) AS total_likes "
            "FROM users u "
            "LEFT JOIN posts p ON p.user_id = u.user_id "
            "WHERE u.username = %s "
            "GROUP BY u.user_id",
            (username,),
        )
        return await cur.fetchone()
