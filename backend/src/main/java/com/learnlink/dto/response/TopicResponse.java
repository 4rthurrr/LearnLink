package com.learnlink.dto.response;

import com.learnlink.model.Topic;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicResponse {
    private Long id;
    private String title;
    private String description;
    private Topic.CompletionStatus completionStatus;
    private List<ResourceResponse> resources;
}
