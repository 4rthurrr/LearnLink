package com.learnlink.controller;

import com.learnlink.dto.PostCreateDto;
import com.learnlink.dto.PostDto;
import com.learnlink.dto.TopicDto;
import com.learnlink.security.CurrentUser;
import com.learnlink.security.UserPrincipal;
import com.learnlink.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @GetMapping
    public ResponseEntity<Page<PostDto>> getAllPosts(
            Pageable pageable,
            @CurrentUser UserPrincipal currentUser) {
        Page<PostDto> posts = postService.getAllPosts(pageable, currentUser.getId());
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/feed")
    public ResponseEntity<Page<PostDto>> getFeedPosts(
            Pageable pageable,
            @CurrentUser UserPrincipal currentUser) {
        Page<PostDto> posts = postService.getFeedPosts(currentUser.getId(), pageable);
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPostById(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        PostDto post = postService.getPostById(id, currentUser.getId());
        return ResponseEntity.ok(post);
    }
    
    @PostMapping
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody PostCreateDto postCreateDto,
            @CurrentUser UserPrincipal currentUser) {
        PostDto createdPost = postService.createPost(postCreateDto, currentUser.getId());
        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostCreateDto postUpdateDto,
            @CurrentUser UserPrincipal currentUser) {
        PostDto updatedPost = postService.updatePost(id, postUpdateDto, currentUser.getId());
        return ResponseEntity.ok(updatedPost);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        postService.deletePost(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/trending-topics")
    public ResponseEntity<List<TopicDto>> getTrendingTopics() {
        List<TopicDto> topics = postService.getTrendingTopics();
        return ResponseEntity.ok(topics);
    }
    
    @GetMapping("/topics/{topic}")
    public ResponseEntity<Page<PostDto>> getPostsByTopic(
            @PathVariable String topic,
            Pageable pageable,
            @CurrentUser UserPrincipal currentUser) {
        Page<PostDto> posts = postService.getPostsByTopic(topic, pageable, currentUser.getId());
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<PostDto>> searchPosts(
            @RequestParam String query,
            Pageable pageable,
            @CurrentUser UserPrincipal currentUser) {
        Page<PostDto> posts = postService.searchPosts(query, pageable, currentUser.getId());
        return ResponseEntity.ok(posts);
    }
}
