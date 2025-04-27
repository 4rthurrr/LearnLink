package com.learnlink.controller;

import com.learnlink.dto.response.ApiResponse;
import com.learnlink.dto.response.UserProfileResponse;
import com.learnlink.model.User;
import com.learnlink.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(userService.getUserProfile(userId, currentUser));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody User userDetails,
            @AuthenticationPrincipal User currentUser) {
        User updatedUser = userService.updateProfile(userId, userDetails, currentUser.getEmail());
        return ResponseEntity.ok(userService.getUserProfile(updatedUser.getId(), currentUser));
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<ApiResponse> followUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        userService.followUser(userId, currentUser.getEmail());
        return ResponseEntity.ok(new ApiResponse(true, "You are now following this user"));
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<ApiResponse> unfollowUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        userService.unfollowUser(userId, currentUser.getEmail());
        return ResponseEntity.ok(new ApiResponse(true, "You have unfollowed this user"));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<User>> getUserFollowers(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowers(userId, pageable));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<User>> getUserFollowing(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowing(userId, pageable));
    }
}
