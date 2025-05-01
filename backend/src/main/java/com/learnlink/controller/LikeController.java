package com.learnlink.controller;

import com.learnlink.dto.response.ApiResponse;
import com.learnlink.model.Like;
import com.learnlink.model.User;
import com.learnlink.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class LikeController {
    
    private final LikeService likeService;
    
    @PostMapping("/{postId}/like")
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser) {
        
        boolean isLiked = likeService.toggleLike(postId, currentUser.getEmail());
        long likesCount = likeService.countLikes(postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("liked", isLiked);
        response.put("likesCount", likesCount);
        response.put("message", isLiked ? "Post liked successfully" : "Post unliked successfully");
        
        return ResponseEntity.ok(response);
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
            @AuthenticationPrincipal String currentUserEmail) {
        
        return ResponseEntity.ok(likeService.hasUserLiked(postId, currentUserEmail));
    }
}
