package com.learnlink.dto.request;

import com.learnlink.model.LearningPlan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

@Data
public class LearningPlanRequest {
    
    @NotBlank
    private String title;
    
    private String description;
    
    @NotNull
    private LearningPlan.Category category;
    
    private Integer estimatedDays;
    
    private Boolean isPublic;
    
    private Date startDate;
    
    private Date targetCompletionDate;
}
