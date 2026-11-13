ALTER TABLE `comments`
ADD COLUMN `parent_id` INTEGER NULL;

ALTER TABLE `posts`
ADD COLUMN `latitude` DOUBLE NULL,
ADD COLUMN `longitude` DOUBLE NULL;

CREATE INDEX `comments_parent_id_idx` ON `comments`(`parent_id`);

CREATE TABLE `comment_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `comment_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `comment_likes_user_id_comment_id_key`(`user_id`, `comment_id`),
    INDEX `comment_likes_comment_id_idx`(`comment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `comments`
ADD CONSTRAINT `comments_parent_id_fkey`
FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `comment_likes`
ADD CONSTRAINT `comment_likes_user_id_fkey`
FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `comment_likes`
ADD CONSTRAINT `comment_likes_comment_id_fkey`
FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`)
ON DELETE CASCADE ON UPDATE CASCADE;
