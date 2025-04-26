package com.learnlink.controller;

import com.learnlink.dto.ApiResponse;
import com.learnlink.dto.FollowResponse;
import com.learnlink.dto.UserDto;
import com.learnlink.dto.UserSummaryDto;
import com.learnlink.dto.UserProfileUpdateDto;
import com.learnlink.security.CurrentUser;
import com.learnlink.security.UserPrincipal;
import com.learnlink.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        UserDto userDto = userService.getUserById(id);
        return ResponseEntity.ok(userDto);
    }
    
    @GetMapping("/suggestions")
    public ResponseEntity<List<UserSummaryDto>> getUserSuggestions(
            @CurrentUser UserPrincipal currentUser,
            @RequestParam(defaultValue = "5") int limit) {
        List<UserSummaryDto> suggestions = userService.getSuggestionsForUser(currentUser.getId(), limit);
        return ResponseEntity.ok(suggestions);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<UserSummaryDto>> searchUsers(
            @RequestParam String query,
            Pageable pageable) {
        Page<UserSummaryDto> users = userService.searchUsers(query, pageable);
        return ResponseEntity.ok(users);
    }
    
    @PostMapping("/{userId}/follow")
    public ResponseEntity<FollowResponse> toggleFollow(
            @PathVariable Long userId,
            @CurrentUser UserPrincipal currentUser) {
        FollowResponse response = userService.toggleFollow(currentUser.getId(), userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{userId}/follow")
    public ResponseEntity<FollowResponse> getFollowStatus(
            @PathVariable Long userId,
            @CurrentUser UserPrincipal currentUser) {
        FollowResponse response = userService.getFollowStatus(currentUser.getId(), userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{userId}/followers")
    public ResponseEntity<Page<UserSummaryDto>> getFollowers(
            @PathVariable Long userId,
            Pageable pageable) {
        Page<UserSummaryDto> followers = userService.getFollowers(userId, pageable);
        return ResponseEntity.ok(followers);
    }
    
    @GetMapping("/{userId}/following")
    public ResponseEntity<Page<UserSummaryDto>> getFollowing(
            @PathVariable Long userId,
            Pageable pageable) {
        Page<UserSummaryDto> following = userService.getFollowing(userId, pageable);
        return ResponseEntity.ok(following);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUserProfile(
            @PathVariable Long id,
            @Valid @RequestBody UserProfileUpdateDto profileUpdateDto,
            @CurrentUser UserPrincipal currentUser) {
        
        // Ensure users can only update their own profiles
        if (!id.equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        UserDto updatedUser = userService.updateUserProfile(id, profileUpdateDto);
        return ResponseEntity.ok(updatedUser);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteAccount(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        
        // Ensure users can only delete their own accounts
        if (!id.equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        userService.deleteAccount(id);
        return ResponseEntity.ok(new ApiResponse(true, "Account deleted successfully"));
    }
    
    @GetMapping("/{userId}/posts")
    public ResponseEntity<Page<PostDto>> getUserPosts(
            @PathVariable Long userId,
            Pageable pageable,
            @CurrentUser UserPrincipal currentUser) {
        
        Page<PostDto> posts = userService.getUserPosts(userId, pageable, currentUser.getId());
        return ResponseEntity.ok(posts);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@CurrentUser UserPrincipal currentUser) {
        UserDto userDto = userService.getUserById(currentUser.getId());
        return ResponseEntity.ok(userDto);
    }
}
