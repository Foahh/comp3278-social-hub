CREATE TABLE users (
    user_id       INT PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_key    VARCHAR(255) DEFAULT NULL,
    created_at    DATETIME     NOT NULL DEFAULT NOW()
);

CREATE TABLE posts (
    post_id       INT PRIMARY KEY AUTO_INCREMENT,
    user_id       INT          NOT NULL,
    text_content  TEXT,
    like_count    INT          NOT NULL DEFAULT 0,
    comment_count INT          NOT NULL DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE images (
    image_id  INT PRIMARY KEY AUTO_INCREMENT,
    post_id   INT                       NOT NULL,
    type      ENUM('blob', 'url')       NOT NULL,
    value     VARCHAR(2048)             NOT NULL,
    position  SMALLINT       NOT NULL DEFAULT 0,

    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE likes (
    like_id    INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT      NOT NULL,
    post_id    INT      NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, post_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id    INT      NOT NULL,
    post_id    INT      NOT NULL,
    content    TEXT     NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

DELIMITER $$

CREATE TRIGGER after_like_insert
AFTER INSERT ON likes FOR EACH ROW
BEGIN
    UPDATE posts SET like_count = like_count + 1 WHERE post_id = NEW.post_id;
END$$

CREATE TRIGGER after_like_delete
AFTER DELETE ON likes FOR EACH ROW
BEGIN
    UPDATE posts SET like_count = like_count - 1 WHERE post_id = OLD.post_id;
END$$

CREATE TRIGGER after_comment_insert
AFTER INSERT ON comments FOR EACH ROW
BEGIN
    UPDATE posts SET comment_count = comment_count + 1 WHERE post_id = NEW.post_id;
END$$

CREATE TRIGGER after_comment_delete
AFTER DELETE ON comments FOR EACH ROW
BEGIN
    UPDATE posts SET comment_count = comment_count - 1 WHERE post_id = OLD.post_id;
END$$

DELIMITER ;

CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_like_count  ON posts(like_count DESC);
CREATE INDEX idx_posts_user_id     ON posts(user_id);
CREATE INDEX idx_images_post_id    ON images(post_id);
CREATE INDEX idx_comments_post_id  ON comments(post_id);
CREATE INDEX idx_likes_post_id     ON likes(post_id);
