package com.learnlink.service;

import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Like;
import com.learnlink.model.Notification;
import com.learnlink.model.Post;
import com.learnlink.model.User;
import com.learnlink.repository.LikeRepository;
import com.learnlink.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LikeService {
    
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    
    @Transactional
    public boolean toggleLike(Long postId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        // Check if user already liked the post
        boolean alreadyLiked = likeRepository.existsByUserAndPost(currentUser, post);
        
        if (alreadyLiked) {
            // Unlike the post
            likeRepository.deleteByUserAndPost(currentUser, post);
            return false;
        } else {
            // Like the post
            Like like = Like.builder()
                    .user(currentUser)
                    .post(post)
                    .build();
            
            likeRepository.save(like);
            
            // Create notification for post author (if not the same user)
            if (!post.getAuthor().getId().equals(currentUser.getId())) {
                notificationService.createNotification(
                        post.getAuthor(),
                        currentUser,
                        Notification.NotificationType.LIKE,
                        currentUser.getName() + " liked your post",
                        "post",
                        post.getId()
                );
            }
            
            return true;
        }
    }
    
    public long countLikes(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        return likeRepository.countByPost(post);
    }
    
    public boolean hasUserLiked(Long postId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        return likeRepository.existsByUserAndPost(currentUser, post);
    }
    
    public List<Like> getLikes(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        return likeRepository.findByPost(post);
    }
}
