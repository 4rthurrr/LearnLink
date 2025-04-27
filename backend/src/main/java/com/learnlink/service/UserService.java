package com.learnlink.service;

import com.learnlink.dto.response.UserProfileResponse;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Follow;
import com.learnlink.model.User;
import com.learnlink.repository.FollowRepository;
import com.learnlink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    public UserProfileResponse getUserProfile(Long userId, User currentUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        long followersCount = followRepository.countByFollowing(user);
        long followingCount = followRepository.countByFollower(user);
        
        boolean isCurrentUserFollowing = false;
        if (currentUser != null) {
            isCurrentUserFollowing = followRepository.existsByFollowerAndFollowing(currentUser, user);
        }
        
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .profilePicture(user.getProfilePicture())
                .bio(user.getBio())
                .location(user.getLocation())
                .joinedDate(user.getJoinedDate())
                .followersCount(followersCount)
                .followingCount(followingCount)
                .isCurrentUserFollowing(isCurrentUserFollowing)
                .build();
    }

    public User updateProfile(Long userId, User userDetails, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        
        if (!currentUser.getId().equals(userId)) {
            throw new ResourceNotFoundException("User", "id", userId);
        }
        
        currentUser.setName(userDetails.getName());
        currentUser.setBio(userDetails.getBio());
        currentUser.setLocation(userDetails.getLocation());
        if (userDetails.getProfilePicture() != null) {
            currentUser.setProfilePicture(userDetails.getProfilePicture());
        }
        
        return userRepository.save(currentUser);
    }

    @Transactional
    public void followUser(Long userId, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        User userToFollow = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        if (currentUser.getId().equals(userId)) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }
        
        if (followRepository.existsByFollowerAndFollowing(currentUser, userToFollow)) {
            throw new IllegalArgumentException("You are already following this user");
        }
        
        Follow follow = new Follow();
        follow.setFollower(currentUser);
        follow.setFollowing(userToFollow);
        
        followRepository.save(follow);
    }

    @Transactional
    public void unfollowUser(Long userId, String currentUserEmail) {
        User currentUser = getCurrentUser(currentUserEmail);
        User userToUnfollow = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Follow follow = followRepository.findByFollowerAndFollowing(currentUser, userToUnfollow)
                .orElseThrow(() -> new IllegalArgumentException("You are not following this user"));
        
        followRepository.delete(follow);
    }

    public Page<User> getFollowers(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        return followRepository.findByFollowing(user, pageable)
                .map(Follow::getFollower);
    }

    public Page<User> getFollowing(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        return followRepository.findByFollower(user, pageable)
                .map(Follow::getFollowing);
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }
}
