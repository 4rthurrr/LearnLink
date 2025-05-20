package com.learnlink.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Builder
public class CommentResponse {
    
    private Long id;
    private String content;
    private UserSummaryResponse user;
    private Long postId;
    private Date createdAt;
    private Date updatedAt;
    private Long parentCommentId;
    private List<CommentResponse> replies;
    
    @Data
    @Builder
    public static class UserSummaryResponse {
        private Long id;
        private String name;
        private String profilePicture;
    }
}
