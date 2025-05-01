package com.learnlink.controller;

import com.learnlink.dto.response.LearningPlanResponse;
import com.learnlink.dto.response.PostResponse;
import com.learnlink.dto.response.UserProfileResponse;
import com.learnlink.model.User;
import com.learnlink.service.LearningPlanService;
import com.learnlink.service.PostService;
import com.learnlink.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final UserService userService;
    private final PostService postService;
    private final LearningPlanService learningPlanService;

    @GetMapping
    public ResponseEntity<SearchResults> globalSearch(
            @RequestParam String query,
            @PageableDefault(size = 5) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        
        // Implement global search across users, posts, and learning plans
        SearchResults results = new SearchResults(
            userService.searchUsers(query, pageable),
            postService.searchPosts(query, pageable, currentUser),
            learningPlanService.searchLearningPlans(query, pageable, currentUser.getEmail())
        );
        
        return ResponseEntity.ok(results);
    }
    
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class SearchResults {
        private Page<UserProfileResponse> users;
        private Page<PostResponse> posts;
        private Page<LearningPlanResponse> learningPlans;
    }
}
