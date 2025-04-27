package com.learnlink.dto.request;

import com.learnlink.model.Topic;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TopicRequest {
    
    @NotBlank
    private String title;
    
    private String description;
    
    private Integer orderIndex;
    
    private Topic.CompletionStatus completionStatus;
}
