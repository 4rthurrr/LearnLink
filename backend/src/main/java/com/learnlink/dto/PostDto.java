package com.learnlink.dto;

import com.learnlink.model.Post;
import com.learnlink.model.PostType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostDto {
    private Long id;
    private String title;
    private String content;
    private List<String> mediaUrls;
    private UserSummaryDto user;
    private PostType postType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int likeCount;
    private int commentCount;
    private boolean liked;

    public static PostDto fromEntity(Post post, boolean liked, int likeCount, int commentCount) {
        PostDto dto = new PostDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setContent(post.getContent());
        dto.setMediaUrls(post.getMediaUrls());
        dto.setUser(UserSummaryDto.fromUser(post.getUser()));
        dto.setPostType(post.getPostType());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());
        dto.setLikeCount(likeCount);
        dto.setCommentCount(commentCount);
        dto.setLiked(liked);
        return dto;
    }
}
