package com.learnlink.controller;

import com.learnlink.dto.response.ApiResponse;
import com.learnlink.dto.response.UserProfileResponse;
import com.learnlink.dto.response.UserSummaryDTO;
import com.learnlink.model.User;
import com.learnlink.service.UserService;
import com.learnlink.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final FileStorageService fileStorageService;

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
    
    @PostMapping("/profile-picture")
    public ResponseEntity<Map<String, String>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User currentUser) {
        // Store the file
        String fileName = fileStorageService.storeFile(file);
        
        // Create the file URL
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/media/")
                .path(fileName)
                .toUriString();
        
        // Update the user's profile picture field
        User updatedUser = userService.updateProfilePicture(currentUser.getId(), fileUrl, currentUser.getEmail());
        
        // Return the URL
        Map<String, String> response = new HashMap<>();
        response.put("fileName", fileName);
        response.put("fileUrl", fileUrl);
        response.put("message", "Profile picture updated successfully");
        
        return ResponseEntity.ok(response);
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
    public ResponseEntity<Page<UserSummaryDTO>> getUserFollowers(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowersDTO(userId, pageable));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<UserSummaryDTO>> getUserFollowing(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(userService.getFollowingDTO(userId, pageable));
    }

    @GetMapping("/{userId}/follow/status")
    public ResponseEntity<Map<String, Boolean>> checkFollowStatus(
            @PathVariable Long userId,
            @AuthenticationPrincipal User currentUser) {
        boolean isFollowing = userService.checkIfUserIsFollowing(userId, currentUser.getEmail());
        Map<String, Boolean> response = new HashMap<>();
        response.put("isFollowing", isFollowing);
        return ResponseEntity.ok(response);
    }
}
