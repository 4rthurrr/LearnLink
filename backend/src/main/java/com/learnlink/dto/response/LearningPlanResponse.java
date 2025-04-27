package com.learnlink.dto.response;

import com.learnlink.model.LearningPlan;
import com.learnlink.model.Resource.ResourceType;
import com.learnlink.model.Topic.CompletionStatus;
import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Builder
public class LearningPlanResponse {
    
    private Long id;
    private String title;
    private String description;
    private UserSummaryResponse creator;
    private LearningPlan.Category category;
    private List<TopicResponse> topics;
    private Integer estimatedDays;
    private Integer completionPercentage;
    private Boolean isPublic;
    private Date startDate;
    private Date targetCompletionDate;
    private Date createdAt;
    private Date updatedAt;
    
    @Data
    @Builder
    public static class TopicResponse {
        private Long id;
        private String title;
        private String description;
        private Integer orderIndex;
        private CompletionStatus completionStatus;
        private List<ResourceResponse> resources;
        private Date startDate;
        private Date completionDate;
    }
    
    @Data
    @Builder
    public static class ResourceResponse {
        private Long id;
        private String title;
        private String description;
        private String url;
        private ResourceType type;
        private Boolean isCompleted;
    }
    
    @Data
    @Builder
    public static class UserSummaryResponse {
        private Long id;
        private String name;
        private String profilePicture;
    }
}
