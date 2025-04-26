package com.learnlink.service;

import com.learnlink.dto.FollowResponse;
import com.learnlink.dto.UserDto;
import com.learnlink.dto.UserSummaryDto;
import com.learnlink.dto.UserProfileUpdateDto;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.NotificationType;
import com.learnlink.model.User;
import com.learnlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return UserDto.fromEntity(user);
    }
    
    public List<UserSummaryDto> getSuggestionsForUser(Long userId, int limit) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Get IDs of users the current user is already following
        Set<Long> followingIds = currentUser.getFollowing().stream()
                .map(User::getId)
                .collect(Collectors.toSet());
        
        // Add current user's ID to exclude from suggestions
        followingIds.add(userId);
        
        // Find users that the current user is not following
        List<User> suggestions = userRepository.findTop10ByIdNotIn(followingIds);
        
        // Limit results if needed
        if (suggestions.size() > limit) {
            suggestions = suggestions.subList(0, limit);
        }
        
        return suggestions.stream()
                .map(UserSummaryDto::fromUser)
                .collect(Collectors.toList());
    }
    
    public Page<UserSummaryDto> searchUsers(String query, Pageable pageable) {
        Page<User> users = userRepository.findByNameContainingIgnoreCase(query, pageable);
        
        List<UserSummaryDto> userSummaries = users.getContent().stream()
                .map(UserSummaryDto::fromUser)
                .collect(Collectors.toList());
        
        return new PageImpl<>(userSummaries, pageable, users.getTotalElements());
    }
    
    @Transactional
    public FollowResponse toggleFollow(Long followerId, Long followingId) {
        // Prevent self-follow
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("Users cannot follow themselves");
        }
        
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followerId));
        
        User userToFollow = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followingId));
        
        boolean isFollowing = follower.getFollowing().contains(userToFollow);
        
        if (isFollowing) {
            // Unfollow
            follower.getFollowing().remove(userToFollow);
        } else {
            // Follow
            follower.getFollowing().add(userToFollow);
            
            // Send notification
            String notificationContent = follower.getName() + " started following you";
            notificationService.createNotification(
                followingId,
                NotificationType.FOLLOW,
                notificationContent,
                "/profile/" + followerId
            );
        }
        
        userRepository.save(follower);
        
        // Refresh user to get updated counts
        userToFollow = userRepository.findById(followingId).get();
        
        return new FollowResponse(!isFollowing, userToFollow.getFollowers().size());
    }
    
    public FollowResponse getFollowStatus(Long followerId, Long followingId) {
        // Prevent self-check
        if (followerId.equals(followingId)) {
            return new FollowResponse(false, 0);
        }
        
        User follower = userRepository.findById(followerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followerId));
        
        User userToCheck = userRepository.findById(followingId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", followingId));
        
        boolean isFollowing = follower.getFollowing().contains(userToCheck);
        
        return new FollowResponse(isFollowing, userToCheck.getFollowers().size());
    }
    
    public Page<UserSummaryDto> getFollowers(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        List<User> followers = new ArrayList<>(user.getFollowers());
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), followers.size());
        
        List<UserSummaryDto> followerDtos = followers.subList(start, end).stream()
                .map(UserSummaryDto::fromUser)
                .collect(Collectors.toList());
        
        return new PageImpl<>(followerDtos, pageable, followers.size());
    }
    
    public Page<UserSummaryDto> getFollowing(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        List<User> following = new ArrayList<>(user.getFollowing());
        
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), following.size());
        
        List<UserSummaryDto> followingDtos = following.subList(start, end).stream()
                .map(UserSummaryDto::fromUser)
                .collect(Collectors.toList());
        
        return new PageImpl<>(followingDtos, pageable, following.size());
    }
    
    @Transactional
    public UserDto updateUserProfile(Long userId, UserProfileUpdateDto profileUpdateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        if (profileUpdateDto.getName() != null) {
            user.setName(profileUpdateDto.getName());
        }
        
        if (profileUpdateDto.getBio() != null) {
            user.setBio(profileUpdateDto.getBio());
        }
        
        if (profileUpdateDto.getImageUrl() != null) {
            user.setImageUrl(profileUpdateDto.getImageUrl());
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        
        User updatedUser = userRepository.save(user);
        return UserDto.fromEntity(updatedUser);
    }
    
    public Page<PostDto> getUserPosts(Long userId, Pageable pageable, Long currentUserId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
        // This would typically call postService, but to avoid circular dependencies,
        // we'll implement the logic here
        
        Page<Post> posts = postRepository.findByUserId(userId, pageable);
        
        List<PostDto> postDtos = posts.getContent().stream()
                .map(post -> {
                    boolean liked = currentUserId != null && 
                        likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
                    int likeCount = (int) likeRepository.countByPostId(post.getId());
                    int commentCount = (int) commentRepository.countByPostId(post.getId());
                    return PostDto.fromEntity(post, liked, likeCount, commentCount);
                })
                .collect(Collectors.toList());
                
        return new PageImpl<>(postDtos, pageable, posts.getTotalElements());
    }
    
    @Transactional
    public void deleteAccount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        // Typically, you would do soft delete or handle more cleanup
        // This is a simplified version
        userRepository.delete(user);
    }
}
