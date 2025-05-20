-- User Activities Table
CREATE TABLE IF NOT EXISTS user_activities (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    learning_plan_id BIGINT,
    progress_percentage INT,
    topic_id BIGINT,
    topic_title VARCHAR(255),
    resource_id BIGINT,
    resource_title VARCHAR(255),
    post_id BIGINT,
    comment_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (learning_plan_id) REFERENCES learning_plans(id) ON DELETE SET NULL,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE SET NULL
);

-- Index for faster activity retrieval
CREATE INDEX idx_user_activities_user_id ON user_activities (user_id);
CREATE INDEX idx_user_activities_type ON user_activities (type);
CREATE INDEX idx_user_activities_timestamp ON user_activities (timestamp DESC);
