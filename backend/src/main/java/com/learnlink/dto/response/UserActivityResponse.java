package com.learnlink.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityResponse {
    private Long id;
    private String type;
    private UserSummary user;
    private Date timestamp;
    
    // Fields for LEARNING_PROGRESS
    private LearningPlanSummary learningPlan;
    private Integer progressPercentage;
    
    // Fields for TOPIC_COMPLETED
    private Long topicId;
    private String topicTitle;
    
    // Fields for RESOURCE_COMPLETED
    private Long resourceId;
    private String resourceTitle;
    
    // Fields for POST_LIKE, POST_COMMENT
    private PostSummary post;
    
    // Field for POST_COMMENT
    private CommentSummary comment;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummary {
        private Long id;
        private String name;
        private String profilePicture;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LearningPlanSummary {
        private Long id;
        private String title;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostSummary {
        private Long id;
        private String title;
        private UserSummary author;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentSummary {
        private Long id;
        private String content;
    }
}
