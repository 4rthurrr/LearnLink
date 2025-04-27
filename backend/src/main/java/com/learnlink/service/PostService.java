package com.learnlink.service;

import com.learnlink.dto.request.PostRequest;
import com.learnlink.dto.response.PostResponse;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Media;
import com.learnlink.model.Post;
import com.learnlink.model.User;
import com.learnlink.repository.MediaRepository;
import com.learnlink.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final MediaRepository mediaRepository;
    private final FileStorageService fileStorageService;
    private final UserService userService;
    private final LikeService likeService;
    private final CommentService commentService;

    @Transactional
    public PostResponse createPost(PostRequest postRequest, List<MultipartFile> files, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Post post = Post.builder()
                .title(postRequest.getTitle())
                .content(postRequest.getContent())
                .category(postRequest.getCategory() != null ? postRequest.getCategory() : Post.Category.OTHER)
                .author(currentUser)
                .learningProgressPercent(postRequest.getLearningProgressPercent())
                .media(new ArrayList<>())
                .build();
        
        Post savedPost = postRepository.save(post);
        
        // Process media files if any
        if (files != null && !files.isEmpty()) {
            List<Media> mediaList = new ArrayList<>();
            
            for (MultipartFile file : files) {
                String fileName = fileStorageService.storeFile(file);
                String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/media/")
                        .path(fileName)
                        .toUriString();
                
                Media.MediaType mediaType = determineMediaType(file.getContentType());
                
                Media media = Media.builder()
                        .post(savedPost)
                        .fileName(fileName)
                        .fileType(file.getContentType())
                        .fileUrl(fileUrl)
                        .type(mediaType)
                        .build();
                
                mediaList.add(media);
            }
            
            mediaRepository.saveAll(mediaList);
            savedPost.setMedia(mediaList);
        }
        
        return mapToPostResponse(savedPost);
    }

    public PostResponse getPostById(Long postId, User currentUser) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        return mapToPostResponse(post);
    }

    public Page<PostResponse> getAllPosts(Pageable pageable, User currentUser) {
        return postRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToPostResponse);
    }

    public Page<PostResponse> getPostsByUser(Long userId, Pageable pageable, User currentUser) {
        User user = userService.getUserById(userId);
        return postRepository.findByAuthorOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToPostResponse);
    }

    public Page<PostResponse> getPostsByCategory(Post.Category category, Pageable pageable, User currentUser) {
        return postRepository.findByCategoryOrderByCreatedAtDesc(category, pageable)
                .map(this::mapToPostResponse);
    }

    @Transactional
    public PostResponse updatePost(Long postId, PostRequest postRequest, List<MultipartFile> files, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You are not authorized to update this post");
        }
        
        post.setTitle(postRequest.getTitle());
        post.setContent(postRequest.getContent());
        post.setCategory(postRequest.getCategory());
        post.setLearningProgressPercent(postRequest.getLearningProgressPercent());
        
        // Handle new media files if any
        if (files != null && !files.isEmpty()) {
            List<Media> newMediaList = new ArrayList<>();
            
            for (MultipartFile file : files) {
                String fileName = fileStorageService.storeFile(file);
                String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/media/")
                        .path(fileName)
                        .toUriString();
                
                Media.MediaType mediaType = determineMediaType(file.getContentType());
                
                Media media = Media.builder()
                        .post(post)
                        .fileName(fileName)
                        .fileType(file.getContentType())
                        .fileUrl(fileUrl)
                        .type(mediaType)
                        .build();
                
                newMediaList.add(media);
            }
            
            mediaRepository.saveAll(newMediaList);
            post.getMedia().addAll(newMediaList);
        }
        
        Post updatedPost = postRepository.save(post);
        return mapToPostResponse(updatedPost);
    }

    @Transactional
    public void deletePost(Long postId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You are not authorized to delete this post");
        }
        
        // Delete associated media files
        for (Media media : post.getMedia()) {
            fileStorageService.deleteFile(media.getFileName());
        }
        
        postRepository.delete(post);
    }
    
    @Transactional
    public void deleteMedia(Long mediaId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", mediaId));
        
        if (!media.getPost().getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You are not authorized to delete this media");
        }
        
        fileStorageService.deleteFile(media.getFileName());
        media.getPost().getMedia().remove(media);
        mediaRepository.delete(media);
    }
    
    private Media.MediaType determineMediaType(String contentType) {
        if (contentType == null) {
            return Media.MediaType.DOCUMENT;
        }
        
        if (contentType.startsWith("image/")) {
            return Media.MediaType.IMAGE;
        } else if (contentType.startsWith("video/")) {
            return Media.MediaType.VIDEO;
        } else if (contentType.startsWith("audio/")) {
            return Media.MediaType.AUDIO;
        } else {
            return Media.MediaType.DOCUMENT;
        }
    }
    
    private PostResponse mapToPostResponse(Post post) {
        List<PostResponse.MediaResponse> mediaResponses = post.getMedia().stream()
                .map(media -> PostResponse.MediaResponse.builder()
                        .id(media.getId())
                        .fileName(media.getFileName())
                        .fileType(media.getFileType())
                        .fileUrl(media.getFileUrl())
                        .type(media.getType())
                        .build())
                .collect(Collectors.toList());
        
        PostResponse.UserSummaryResponse authorResponse = PostResponse.UserSummaryResponse.builder()
                .id(post.getAuthor().getId())
                .name(post.getAuthor().getName())
                .profilePicture(post.getAuthor().getProfilePicture())
                .build();
        
        // Get likes count
        long likesCount = likeService.countLikes(post.getId());
        
        // Get comments count
        long commentsCount = commentService.countCommentsByPost(post.getId());
        
        // Check if current user liked this post
        boolean isLikedByCurrentUser = false;
        try {
            isLikedByCurrentUser = likeService.hasUserLiked(post.getId(), SecurityContextHolder.getContext().getAuthentication().getName());
        } catch (Exception e) {
            // Ignore if user is not authenticated or other issues
        }
        
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .category(post.getCategory())
                .author(authorResponse)
                .media(mediaResponses)
                .learningProgressPercent(post.getLearningProgressPercent())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .likesCount((int)likesCount)
                .commentsCount((int)commentsCount)
                .isLikedByCurrentUser(isLikedByCurrentUser)
                .build();
    }
}
