-- Script to modify foreign key constraints to allow proper post deletion

-- 1. First backup existing data (optional but recommended)
-- No need to backup in this script as this is a migration file

-- 2. Drop existing foreign key constraint in user_activities table
ALTER TABLE user_activities 
DROP FOREIGN KEY FK9typpph89m1hxq80vq7uov5ig;

-- 3. Create the new foreign key with ON DELETE CASCADE
ALTER TABLE user_activities
ADD CONSTRAINT FK_POST_USER_ACTIVITY
FOREIGN KEY (post_id) 
REFERENCES posts (id)
ON DELETE CASCADE;

-- 4. Make sure comments have proper deletion cascade
ALTER TABLE comments 
DROP FOREIGN KEY IF EXISTS FK_POST_COMMENT;

ALTER TABLE comments
ADD CONSTRAINT FK_POST_COMMENT
FOREIGN KEY (post_id) 
REFERENCES posts (id)
ON DELETE CASCADE;

-- 5. Make sure media has proper deletion cascade
ALTER TABLE media 
DROP FOREIGN KEY IF EXISTS FK_POST_MEDIA;

ALTER TABLE media
ADD CONSTRAINT FK_POST_MEDIA
FOREIGN KEY (media.post_id) 
REFERENCES posts (id)
ON DELETE CASCADE;

-- 6. Make sure likes have proper deletion cascade
ALTER TABLE likes 
DROP FOREIGN KEY IF EXISTS FK_POST_LIKE;

ALTER TABLE likes
ADD CONSTRAINT FK_POST_LIKE
FOREIGN KEY (likes.post_id) 
REFERENCES posts (id)
ON DELETE CASCADE;
