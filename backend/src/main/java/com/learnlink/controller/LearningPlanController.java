package com.learnlink.controller;

import com.learnlink.dto.request.LearningPlanRequest;
import com.learnlink.dto.request.ResourceRequest;
import com.learnlink.dto.request.TopicRequest;
import com.learnlink.dto.response.ApiResponse;
import com.learnlink.dto.response.LearningPlanResponse;
import com.learnlink.model.Topic;
import com.learnlink.model.User;
import com.learnlink.service.LearningPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Sort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/learning-plans")
@RequiredArgsConstructor
public class LearningPlanController {
    
    private final LearningPlanService learningPlanService;
    private static final Logger log = LoggerFactory.getLogger(LearningPlanController.class);
    
    @PostMapping
    public ResponseEntity<LearningPlanResponse> createLearningPlan(
            @Valid @RequestBody LearningPlanRequest learningPlanRequest,
            @AuthenticationPrincipal User currentUser) {
        
        // Add logging
        log.info("Creating learning plan: {}, isPublic: {}", 
                 learningPlanRequest.getTitle(), learningPlanRequest.getIsPublic());
        
        LearningPlanResponse learningPlan = learningPlanService.createLearningPlan(
                learningPlanRequest, currentUser.getEmail());
        
        // Log the created plan
        log.info("Learning plan created with ID: {}", learningPlan.getId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(learningPlan);
    }
    
    @GetMapping("/{planId}")
    public ResponseEntity<LearningPlanResponse> getLearningPlanById(
            @PathVariable Long planId,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.getLearningPlanById(planId, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<LearningPlanResponse>> getLearningPlansByUser(
            @PathVariable Long userId,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        
        Page<LearningPlanResponse> response = learningPlanService.getLearningPlansByUser(userId, pageable, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/public")
    public ResponseEntity<Page<LearningPlanResponse>> getAllPublicLearningPlans(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        
        // Add logging to debug
        log.info("Fetching public learning plans, page: {}, size: {}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        
        Page<LearningPlanResponse> learningPlans = learningPlanService.findAllPublicLearningPlans(pageable);
        
        // Log the results
        log.info("Found {} public learning plans", learningPlans.getTotalElements());
        
        return ResponseEntity.ok(learningPlans);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<LearningPlanResponse>> searchLearningPlans(
            @RequestParam String keyword,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        
        Page<LearningPlanResponse> response = learningPlanService.searchLearningPlans(keyword, pageable, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{planId}")
    public ResponseEntity<LearningPlanResponse> updateLearningPlan(
            @PathVariable Long planId,
            @Valid @RequestBody LearningPlanRequest learningPlanRequest,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.updateLearningPlan(planId, learningPlanRequest, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{planId}")
    public ResponseEntity<ApiResponse> deleteLearningPlan(
            @PathVariable Long planId,
            @AuthenticationPrincipal User currentUser) {
        
        learningPlanService.deleteLearningPlan(planId, currentUser.getEmail());
        return ResponseEntity.ok(new ApiResponse(true, "Learning plan deleted successfully"));
    }
    
    @PostMapping("/{planId}/topics")
    public ResponseEntity<LearningPlanResponse> addTopicToLearningPlan(
            @PathVariable Long planId,
            @Valid @RequestBody TopicRequest topicRequest,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.addTopicToLearningPlan(planId, topicRequest, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{planId}/topics/{topicId}")
    public ResponseEntity<LearningPlanResponse> updateTopic(
            @PathVariable Long planId,
            @PathVariable Long topicId,
            @Valid @RequestBody TopicRequest topicRequest,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.updateTopic(planId, topicId, topicRequest, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{planId}/topics/{topicId}")
    public ResponseEntity<LearningPlanResponse> deleteTopic(
            @PathVariable Long planId,
            @PathVariable Long topicId,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.deleteTopic(planId, topicId, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{planId}/topics/{topicId}/resources")
    public ResponseEntity<LearningPlanResponse> addResourceToTopic(
            @PathVariable Long planId,
            @PathVariable Long topicId,
            @Valid @RequestBody ResourceRequest resourceRequest,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.addResourceToTopic(planId, topicId, resourceRequest, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{planId}/topics/{topicId}/resources/{resourceId}")
    public ResponseEntity<LearningPlanResponse> updateResource(
            @PathVariable Long planId,
            @PathVariable Long topicId,
            @PathVariable Long resourceId,
            @Valid @RequestBody ResourceRequest resourceRequest,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.updateResource(planId, topicId, resourceId, resourceRequest, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{planId}/topics/{topicId}/resources/{resourceId}")
    public ResponseEntity<LearningPlanResponse> deleteResource(
            @PathVariable Long planId,
            @PathVariable Long topicId,
            @PathVariable Long resourceId,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.deleteResource(planId, topicId, resourceId, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{planId}/topics/{topicId}/status")
    public ResponseEntity<LearningPlanResponse> updateTopicCompletionStatus(
            @PathVariable Long planId,
            @PathVariable Long topicId,
            @RequestParam Topic.CompletionStatus status,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.updateTopicCompletionStatus(planId, topicId, status, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
    
    @PatchMapping("/{planId}/topics/{topicId}/resources/{resourceId}/status")
    public ResponseEntity<LearningPlanResponse> updateResourceCompletionStatus(
            @PathVariable Long planId,
            @PathVariable Long topicId,
            @PathVariable Long resourceId,
            @RequestParam Boolean isCompleted,
            @AuthenticationPrincipal User currentUser) {
        
        LearningPlanResponse response = learningPlanService.updateResourceCompletionStatus(planId, topicId, resourceId, isCompleted, currentUser.getEmail());
        return ResponseEntity.ok(response);
    }
}
