package com.learnlink.controller;

import com.learnlink.dto.CommentDto;
import com.learnlink.security.CurrentUser;
import com.learnlink.security.UserPrincipal;
import com.learnlink.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.Map;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
public class CommentController {
    
    @Autowired
    private CommentService commentService;
    
    @GetMapping
    public ResponseEntity<Page<CommentDto>> getComments(
            @PathVariable Long postId,
            Pageable pageable) {
        Page<CommentDto> comments = commentService.getCommentsByPostId(postId, pageable);
        return ResponseEntity.ok(comments);
    }
    
    @PostMapping
    public ResponseEntity<CommentDto> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentRequest commentRequest,
            @CurrentUser UserPrincipal currentUser) {
        CommentDto createdComment = commentService.createComment(
                postId, 
                commentRequest.getContent(),
                currentUser.getId()
        );
        return new ResponseEntity<>(createdComment, HttpStatus.CREATED);
    }
    
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentDto> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest commentRequest,
            @CurrentUser UserPrincipal currentUser) {
        CommentDto updatedComment = commentService.updateComment(
                commentId, 
                commentRequest.getContent(),
                currentUser.getId()
        );
        return ResponseEntity.ok(updatedComment);
    }
    
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @CurrentUser UserPrincipal currentUser) {
        commentService.deleteComment(commentId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
    
    static class CommentRequest {
        @NotBlank(message = "Comment content cannot be empty")
        @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
        private String content;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}
