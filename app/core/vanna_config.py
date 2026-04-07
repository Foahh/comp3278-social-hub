"""Vanna bootstrap: schema DDL and question/SQL training pairs for agent memory."""

from pathlib import Path

DDL = Path("schema.sql").read_text()

TRAINING_PAIRS: list[tuple[str, str]] = [
    (
        "What are the most liked posts?",
        "SELECT p.post_id, u.username, u.name, p.text_content, p.like_count, p.created_at "
        "FROM posts p JOIN users u ON p.user_id = u.user_id "
        "ORDER BY p.like_count DESC, p.post_id DESC LIMIT 10;",
    ),
    (
        "Show the latest posts in the feed",
        "SELECT p.post_id, u.username, u.name, u.avatar_key, p.text_content, p.like_count, "
        "p.comment_count, p.created_at FROM posts p JOIN users u ON p.user_id = u.user_id "
        "ORDER BY p.created_at DESC, p.post_id DESC LIMIT 20;",
    ),
    (
        "Which users have the most posts?",
        "SELECT u.username, u.name, COUNT(DISTINCT p.post_id) AS post_count "
        "FROM users u LEFT JOIN posts p ON p.user_id = u.user_id "
        "GROUP BY u.user_id, u.username, u.name "
        "ORDER BY post_count DESC LIMIT 10;",
    ),
    (
        "Show a user leaderboard: most posts, with total likes received on those posts",
        "SELECT u.username, u.name, COUNT(DISTINCT p.post_id) AS post_count, "
        "COALESCE(SUM(p.like_count), 0) AS total_likes "
        "FROM users u LEFT JOIN posts p ON p.user_id = u.user_id "
        "GROUP BY u.user_id, u.username, u.name "
        "ORDER BY post_count DESC LIMIT 10;",
    ),
    (
        "Which users have posts that received the most likes in total?",
        "SELECT u.username, u.name, COUNT(DISTINCT p.post_id) AS post_count, "
        "COALESCE(SUM(p.like_count), 0) AS total_likes "
        "FROM users u LEFT JOIN posts p ON p.user_id = u.user_id "
        "GROUP BY u.user_id, u.username, u.name "
        "ORDER BY total_likes DESC LIMIT 10;",
    ),
    (
        "What are the most commented posts?",
        "SELECT p.post_id, u.username, u.name, p.text_content, p.comment_count, p.like_count, "
        "p.created_at FROM posts p JOIN users u ON p.user_id = u.user_id "
        "ORDER BY p.comment_count DESC, p.post_id DESC LIMIT 10;",
    ),
    (
        "Show posts from the last 7 days",
        "SELECT p.post_id, u.username, u.name, p.text_content, p.like_count, p.created_at "
        "FROM posts p JOIN users u ON p.user_id = u.user_id "
        "WHERE p.created_at >= NOW() - INTERVAL 7 DAY "
        "ORDER BY p.created_at DESC, p.post_id DESC;",
    ),
    (
        "How many posts were created each day in the last 30 days?",
        "SELECT DATE(created_at) AS date, COUNT(*) AS count FROM posts "
        "WHERE created_at >= NOW() - INTERVAL 30 DAY "
        "GROUP BY DATE(created_at) ORDER BY date ASC;",
    ),
    (
        "How many likes happened each day in the last 30 days?",
        "SELECT DATE(created_at) AS date, COUNT(*) AS count FROM likes "
        "WHERE created_at >= NOW() - INTERVAL 30 DAY "
        "GROUP BY DATE(created_at) ORDER BY date ASC;",
    ),
    (
        "Who liked a specific post?",
        "SELECT u.username, u.name, l.created_at FROM likes l "
        "JOIN users u ON l.user_id = u.user_id "
        "WHERE l.post_id = 1 ORDER BY l.created_at DESC;",
    ),
    (
        "List comments on a post with the commenters",
        "SELECT c.comment_id, u.username, u.name, c.content, c.created_at FROM comments c "
        "JOIN users u ON c.user_id = u.user_id "
        "WHERE c.post_id = 1 ORDER BY c.comment_id ASC;",
    ),
    (
        "Show all posts by a user given their username",
        "SELECT p.post_id, p.text_content, p.like_count, p.comment_count, p.created_at "
        "FROM posts p JOIN users u ON p.user_id = u.user_id "
        "WHERE LOWER(u.username) = LOWER('alice') "
        "ORDER BY p.created_at DESC, p.post_id DESC;",
    ),
    (
        "What is this user's profile summary: post count and total likes received?",
        "SELECT u.user_id, u.username, u.name, u.avatar_key, u.created_at, "
        "COUNT(DISTINCT p.post_id) AS post_count, COALESCE(SUM(p.like_count), 0) AS total_likes "
        "FROM users u LEFT JOIN posts p ON p.user_id = u.user_id "
        "WHERE LOWER(u.username) = LOWER('alice') "
        "GROUP BY u.user_id, u.username, u.name, u.avatar_key, u.created_at;",
    ),
    (
        "Which users write the most comments?",
        "SELECT u.username, u.name, COUNT(*) AS comment_count FROM comments c "
        "JOIN users u ON c.user_id = u.user_id "
        "GROUP BY u.user_id, u.username, u.name "
        "ORDER BY comment_count DESC LIMIT 10;",
    ),
    (
        "Which posts have the most images attached?",
        "SELECT p.post_id, u.username, p.text_content, COUNT(i.image_id) AS image_count "
        "FROM posts p JOIN users u ON p.user_id = u.user_id "
        "JOIN images i ON i.post_id = p.post_id "
        "GROUP BY p.post_id, u.username, p.text_content "
        "ORDER BY image_count DESC LIMIT 10;",
    ),
    (
        "How many users and posts are in the database?",
        "SELECT (SELECT COUNT(*) FROM users) AS user_count, (SELECT COUNT(*) FROM posts) AS post_count;",
    ),
]
