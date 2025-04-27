package com.learnlink.controller;

import com.learnlink.dto.response.ApiResponse;
import com.learnlink.model.Like;
import com.learnlink.model.User;
import com.learnlink.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class LikeController {
    
    private final LikeService likeService;
    
    @PostMapping("/{postId}/like")
    public ResponseEntity<ApiResponse> toggleLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser) {
        
        boolean isLiked = likeService.toggleLike(postId, currentUser.getEmail());
        String message = isLiked ? "Post liked successfully" : "Post unliked successfully";
        
        return ResponseEntity.ok(new ApiResponse(true, message));
    }
    
    @GetMapping("/{postId}/likes/count")
    public ResponseEntity<Long> countLikes(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.countLikes(postId));
    }
    
    @GetMapping("/{postId}/likes")
    public ResponseEntity<List<Like>> getLikes(@PathVariable Long postId) {
        return ResponseEntity.ok(likeService.getLikes(postId));
    }
    
    @GetMapping("/{postId}/likes/me")
    public ResponseEntity<Boolean> hasUserLiked(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser) {
        
        return ResponseEntity.ok(likeService.hasUserLiked(postId, currentUser.getEmail()));
    }
}
