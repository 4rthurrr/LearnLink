package com.learnlink.service;

import com.learnlink.dto.request.PostRequest;
import com.learnlink.dto.response.PostResponse;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Media;
import com.learnlink.model.Post;
import com.learnlink.model.User;
import com.learnlink.repository.MediaRepository;
import com.learnlink.repository.PostRepository;
import com.learnlink.repository.LikeRepository;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.learnlink.repository.UserActivityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class PostService {   
    private final PostRepository postRepository;
    private final MediaRepository mediaRepository;
    private final FileStorageService fileStorageService;
    private final UserService userService;
    private final LikeService likeService;
    private final CommentService commentService;
    private final LikeRepository likeRepository;
    private final UserActivityRepository userActivityRepository;
    private final UserActivityService userActivityService;
    
    // Inject EntityManager for direct database access when needed
    @PersistenceContext
    private EntityManager entityManager;

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

    public Page<PostResponse> searchPosts(String query, Pageable pageable, User currentUser) {
        if (query == null || query.trim().isEmpty()) {
            return Page.empty(pageable);
        }
        
        // Search posts by title or content containing the query string
        Page<Post> posts = postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByCreatedAtDesc(
            query, query, pageable);
        
        return posts.map(this::mapToPostResponse);
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
    }    @Transactional
    public void deletePost(Long postId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        if (!post.getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You are not authorized to delete this post");
        }        try {            // First, delete all user activities related to this post
            try {
                log.info("Deleting user activities for post ID: {}", postId);
                try {
                    // First attempt: Use direct EntityManager for complete control
                    Query query = entityManager.createNativeQuery("DELETE FROM user_activities WHERE post_id = :postId");
                    query.setParameter("postId", postId);
                    int deletedCount = query.executeUpdate();
                    log.info("Successfully deleted {} user activities using EntityManager", deletedCount);
                } catch (Exception directEx) {
                    log.warn("Error using direct EntityManager to delete user activities: {}", directEx.getMessage());
                    
                    // Second attempt: Try native SQL query through repository
                    userActivityRepository.deleteByPostIdNative(postId);
                    log.info("Successfully deleted user activities using native SQL through repository");
                }
            } catch (Exception e) {
                log.warn("Error using native SQL methods to delete user activities: {}", e.getMessage());
                try {
                    // Try the JPQL query as a fallback
                    userActivityRepository.deleteByPostId(postId);
                    log.info("Successfully deleted user activities using JPQL");
                } catch (Exception e2) {
                    log.warn("Error using JPQL to delete user activities: {}", e2.getMessage());
                    try {
                        // Fall back to the default Spring Data method
                        userActivityRepository.deleteByPost(post);
                        log.info("Successfully deleted user activities using Spring Data method");
                    } catch (Exception ex) {
                        log.error("All methods failed to delete user activities for post: {}", ex.getMessage(), ex);
                        throw new RuntimeException("Error deleting user activities for post: " + ex.getMessage(), ex);
                    }
                }
            }
            
            // Second, delete all likes associated with this post
            try {
                log.info("Deleting likes for post ID: {}", postId);
                likeRepository.deleteByPost(post);
            } catch (Exception e) {
                log.error("Error deleting likes for post: {}", e.getMessage(), e);
                throw new RuntimeException("Error deleting likes for post: " + e.getMessage(), e);
            }
            
            // Then, delete all comments associated with this post
            try {
                log.info("Deleting comments for post ID: {}", postId);
                commentService.deleteAllCommentsByPost(post.getId());
            } catch (Exception e) {
                log.error("Error deleting comments for post: {}", e.getMessage(), e);
                throw new RuntimeException("Error deleting comments for post: " + e.getMessage(), e);
            }
              // Delete associated media files
            List<Media> mediaList = new ArrayList<>(post.getMedia());
            for (Media media : mediaList) {
                try {
                    if (media != null && media.getFileName() != null) {
                        log.info("Deleting media file: {} for post ID: {}", media.getFileName(), postId);
                        fileStorageService.deleteFile(media.getFileName());
                    }
                } catch (Exception e) {
                    // Log the error but continue with deletion
                    log.warn("Error deleting media file: {} - {}", media.getFileName(), e.getMessage());
                }
            }
            
            // Delete all media entries from the database
            try {
                log.info("Deleting all media entries for post ID: {}", postId);
                mediaRepository.deleteByPost(post);
            } catch (Exception e) {
                log.error("Error deleting media entries for post: {}", e.getMessage(), e);
                throw new RuntimeException("Error deleting media entries for post: " + e.getMessage(), e);
            }
            
            // Finally delete the post
            log.info("Deleting post with ID: {}", postId);
            postRepository.delete(post);
            log.info("Post with ID: {} successfully deleted", postId);
        } catch (Exception e) {
            log.error("Failed to delete post: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete post: " + e.getMessage(), e);
        }
    }
      @Transactional
    public void deleteMedia(Long mediaId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", mediaId));
        
        if (!media.getPost().getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You are not authorized to delete this media");
        }
        
        try {
            if (media.getFileName() != null) {
                fileStorageService.deleteFile(media.getFileName());
            }
            
            Post post = media.getPost();
            if (post != null && post.getMedia() != null) {
                post.getMedia().remove(media);
            }
            
            mediaRepository.delete(media);
            log.info("Media with ID: {} successfully deleted", mediaId);
        } catch (Exception e) {
            log.error("Failed to delete media: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete media: " + e.getMessage(), e);
        }
    }
      /**
     * Updates post learning progress percentage when related learning plan progress changes
     * @param learningPlanId The ID of the learning plan
     * @param progressPercentage The new progress percentage
     * @param userId The user ID who owns the learning plan
     */
  @Transactional
  public void updatePostsWithLearningPlanProgress(Long learningPlanId, Integer progressPercentage, Long userId) {
      if (userId == null) {
          return; // No user, so no posts to update
      }
      
      // Find posts by the user that might be related to this learning plan
      List<Post> userPosts = postRepository.findByAuthorId(userId);
      
      if (userPosts != null && !userPosts.isEmpty()) {
          boolean postsUpdated = false;
          for (Post post : userPosts) {
              // Update all posts by this user with the latest progress percentage
              // This ensures even posts that were created before progress was made will show progress
              post.setLearningProgressPercent(progressPercentage);
              postsUpdated = true;
          }
          
          // Only save if we actually updated any posts
          if (postsUpdated) {
              postRepository.saveAll(userPosts);
              log.info("Updated learning progress to {}% in {} posts for user ID: {}", 
                      progressPercentage, userPosts.size(), userId);
          }
      }
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
    
    public PostResponse mapToPostResponse(Post post) {
        // Get the current user's email from SecurityContext
        String currentUserEmail = null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
                !(authentication.getPrincipal() instanceof String)) {
            try {
                User currentUser = (User) authentication.getPrincipal();
                currentUserEmail = currentUser.getEmail();
            } catch (ClassCastException e) {
                // Not a User object, probably "anonymousUser"
            }
        }

        // Check if current user has liked this post
        boolean isLikedByCurrentUser = false;
        if (currentUserEmail != null) {
            User currentUser = userService.getUserByEmail(currentUserEmail);
            isLikedByCurrentUser = likeRepository.existsByUserAndPost(currentUser, post);
        }

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

    public Post getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
    }
}
