package com.learnlink.dto.response;

import com.learnlink.model.Resource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private Long id;
    private String title;
    private String description;
    private String url;
    private Resource.ResourceType type;
    private Boolean isCompleted;
}
