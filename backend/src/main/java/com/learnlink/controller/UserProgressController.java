package com.learnlink.controller;

import com.learnlink.dto.response.LearningPlanResponse;
import com.learnlink.model.Topic;
import com.learnlink.model.User;
import com.learnlink.service.UserProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/learning-plans")
@RequiredArgsConstructor
public class UserProgressController {

    private final UserProgressService userProgressService;
    
    @PatchMapping("/{planId}/topics/{topicId}/user-progress")
    public ResponseEntity<LearningPlanResponse> updateTopicUserProgress(
            @PathVariable Long planId,
            @PathVariable Long topicId,
            @RequestParam Topic.CompletionStatus status,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = userProgressService.updateTopicCompletionStatus(planId, topicId, status, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{planId}/topics/{topicId}/resources/{resourceId}/user-progress")
    public ResponseEntity<LearningPlanResponse> updateResourceUserProgress(
            @PathVariable Long planId,
            @PathVariable Long topicId,
            @PathVariable Long resourceId,
            @RequestParam Boolean isCompleted,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = userProgressService.updateResourceCompletionStatus(planId, topicId, resourceId, isCompleted, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
}