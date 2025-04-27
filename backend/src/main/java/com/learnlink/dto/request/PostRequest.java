package com.learnlink.dto.request;

import com.learnlink.model.Post;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequest {
    @NotBlank
    @Size(min = 3, max = 100)
    private String title;
    
    @NotBlank
    private String content;
    
    private Post.Category category;
    
    private Integer learningProgressPercent;
}
