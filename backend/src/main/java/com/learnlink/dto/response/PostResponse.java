package com.learnlink.dto.response;

import com.learnlink.model.Media;
import com.learnlink.model.Post;
import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
@Builder
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private Post.Category category;
    private UserSummaryResponse author;
    private List<MediaResponse> media;
    private Integer learningProgressPercent;
    private Date createdAt;
    private Date updatedAt;
    private int likesCount;
    private int commentsCount;
    private boolean isLikedByCurrentUser;
    
    @Data
    @Builder
    public static class MediaResponse {
        private Long id;
        private String fileName;
        private String fileType;
        private String fileUrl;
        private Media.MediaType type;
    }
    
    @Data
    @Builder
    public static class UserSummaryResponse {
        private Long id;
        private String name;
        private String profilePicture;
    }
}
