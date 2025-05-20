package com.learnlink.dto.request;

import com.learnlink.model.LearningPlan;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    
    private List<TopicRequest> topics;
}
