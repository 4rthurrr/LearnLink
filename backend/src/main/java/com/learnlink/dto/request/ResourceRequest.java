package com.learnlink.dto.request;

import com.learnlink.model.Resource;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResourceRequest {
    
    @NotBlank
    private String title;
    
    private String description;
    
    private String url;
    
    private Resource.ResourceType type;
    
    private Boolean isCompleted;
}
