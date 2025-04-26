package com.learnlink.controller;

import com.learnlink.dto.ApiResponse;
import com.learnlink.security.CurrentUser;
import com.learnlink.security.UserPrincipal;
import com.learnlink.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
public class LikeController {
    
    @Autowired
    private LikeService likeService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> toggleLike(
            @PathVariable Long postId,
            @CurrentUser UserPrincipal currentUser) {
        
        boolean liked = likeService.toggleLike(postId, currentUser.getId());
        long likeCount = likeService.countLikesByPostId(postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", likeCount);
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> checkLikeStatus(
            @PathVariable Long postId,
            @CurrentUser UserPrincipal currentUser) {
        
        boolean liked = likeService.checkIfLiked(postId, currentUser.getId());
        long likeCount = likeService.countLikesByPostId(postId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("liked", liked);
        response.put("likeCount", likeCount);
        
        return ResponseEntity.ok(response);
    }
}
