package com.learnlink.controller;

import com.learnlink.dto.request.CommentRequest;
import com.learnlink.dto.response.ApiResponse;
import com.learnlink.dto.response.CommentResponse;
import com.learnlink.model.User;
import com.learnlink.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CommentController {
    
    private final CommentService commentService;
    
    @PostMapping("/api/posts/{postId}/comments")
    public ResponseEntity<CommentResponse> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest commentRequest,
            @AuthenticationPrincipal User currentUser) {
        
        CommentResponse commentResponse = commentService.createComment(postId, commentRequest, currentUser.getEmail());
        return ResponseEntity.ok(commentResponse);
    }
    
    @GetMapping("/api/posts/{postId}/comments")
    public ResponseEntity<Page<CommentResponse>> getCommentsByPost(
            @PathVariable Long postId,
            @PageableDefault(size = 10) Pageable pageable) {
        
        Page<CommentResponse> comments = commentService.getCommentsByPost(postId, pageable);
        return ResponseEntity.ok(comments);
    }
    
    @GetMapping("/api/comments/{commentId}")
    public ResponseEntity<CommentResponse> getComment(@PathVariable Long commentId) {
        CommentResponse commentResponse = commentService.getComment(commentId);
        return ResponseEntity.ok(commentResponse);
    }
    
    @PutMapping("/api/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest commentRequest,
            @AuthenticationPrincipal User currentUser) {
        
        CommentResponse commentResponse = commentService.updateComment(commentId, commentRequest, currentUser.getEmail());
        return ResponseEntity.ok(commentResponse);
    }
    
    @DeleteMapping("/api/comments/{commentId}")
    public ResponseEntity<ApiResponse> deleteComment(
            @PathVariable Long commentId,
            @AuthenticationPrincipal User currentUser) {
        
        commentService.deleteComment(commentId, currentUser.getEmail());
        return ResponseEntity.ok(new ApiResponse(true, "Comment deleted successfully"));
    }
    
    @GetMapping("/api/posts/{postId}/comments/count")
    public ResponseEntity<Long> countCommentsByPost(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.countCommentsByPost(postId));
    }
}
