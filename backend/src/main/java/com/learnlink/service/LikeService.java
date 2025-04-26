package com.learnlink.service;

import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Like;
import com.learnlink.model.NotificationType;
import com.learnlink.model.Post;
import com.learnlink.model.User;
import com.learnlink.repository.LikeRepository;
import com.learnlink.repository.PostRepository;
import com.learnlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class LikeService {

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Transactional
    public boolean toggleLike(Long postId, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        Optional<Like> existingLike = likeRepository.findByPostIdAndUserId(postId, userId);

        if (existingLike.isPresent()) {
            likeRepository.delete(existingLike.get());
            return false;
        } else {
            Like like = new Like();
            like.setPost(post);
            like.setUser(user);
            likeRepository.save(like);
            
            // Send notification to post creator if different from liker
            if (!post.getUser().getId().equals(userId)) {
                String notificationContent = user.getName() + " liked your post";
                notificationService.createNotification(
                    post.getUser().getId(),
                    NotificationType.LIKE,
                    notificationContent,
                    "/post/" + postId
                );
            }
            
            return true;
        }
    }

    public boolean checkIfLiked(Long postId, Long userId) {
        return likeRepository.existsByPostIdAndUserId(postId, userId);
    }

    public long countLikesByPostId(Long postId) {
        return likeRepository.countByPostId(postId);
    }
}
