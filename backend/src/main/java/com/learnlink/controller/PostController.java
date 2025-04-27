package com.learnlink.controller;

import com.learnlink.dto.request.PostRequest;
import com.learnlink.dto.response.ApiResponse;
import com.learnlink.dto.response.PostResponse;
import com.learnlink.model.Post;
import com.learnlink.model.User;
import com.learnlink.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<PostResponse> createPost(
            @Valid @RequestPart("post") PostRequest postRequest,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal User currentUser) {
        
        PostResponse postResponse = postService.createPost(postRequest, files, currentUser.getEmail());
        return ResponseEntity.ok(postResponse);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse> getPostById(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser) {
        
        PostResponse postResponse = postService.getPostById(postId, currentUser);
        return ResponseEntity.ok(postResponse);
    }

    @GetMapping
    public ResponseEntity<Page<PostResponse>> getAllPosts(
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        
        Page<PostResponse> posts = postService.getAllPosts(pageable, currentUser);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<PostResponse>> getPostsByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        
        Page<PostResponse> posts = postService.getPostsByUser(userId, pageable, currentUser);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<PostResponse>> getPostsByCategory(
            @PathVariable Post.Category category,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        
        Page<PostResponse> posts = postService.getPostsByCategory(category, pageable, currentUser);
        return ResponseEntity.ok(posts);
    }

    @PutMapping(value = "/{postId}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<PostResponse> updatePost(
            @PathVariable Long postId,
            @Valid @RequestPart("post") PostRequest postRequest,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal User currentUser) {
        
        PostResponse postResponse = postService.updatePost(postId, postRequest, files, currentUser.getEmail());
        return ResponseEntity.ok(postResponse);
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<ApiResponse> deletePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal User currentUser) {
        
        postService.deletePost(postId, currentUser.getEmail());
        return ResponseEntity.ok(new ApiResponse(true, "Post deleted successfully"));
    }

    @DeleteMapping("/media/{mediaId}")
    public ResponseEntity<ApiResponse> deleteMedia(
            @PathVariable Long mediaId,
            @AuthenticationPrincipal User currentUser) {
        
        postService.deleteMedia(mediaId, currentUser.getEmail());
        return ResponseEntity.ok(new ApiResponse(true, "Media deleted successfully"));
    }
}
