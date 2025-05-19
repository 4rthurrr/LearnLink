package com.learnlink.service;

import com.learnlink.dto.response.LearningPlanResponse;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.*;
import com.learnlink.repository.LearningPlanRepository;
import com.learnlink.repository.ResourceRepository;
import com.learnlink.repository.TopicRepository;
import com.learnlink.repository.UserProgressRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@Slf4j
public class UserProgressService {    
    private final UserProgressRepository userProgressRepository;
    private final LearningPlanRepository learningPlanRepository;
    private final TopicRepository topicRepository;
    private final ResourceRepository resourceRepository;
    private final UserService userService;
    private final LearningPlanService learningPlanService;
    private final PostService postService;
    private final UserActivityService userActivityService;
    
    // Use constructor injection with @Lazy for learningPlanService to break circular dependency
    public UserProgressService(
            UserProgressRepository userProgressRepository,
            LearningPlanRepository learningPlanRepository,
            TopicRepository topicRepository,
            ResourceRepository resourceRepository,
            UserService userService,
            @Lazy LearningPlanService learningPlanService,
            @Lazy PostService postService,
            UserActivityService userActivityService) {
        this.userProgressRepository = userProgressRepository;
        this.learningPlanRepository = learningPlanRepository;
        this.topicRepository = topicRepository;
        this.resourceRepository = resourceRepository;
        this.userService = userService;
        this.learningPlanService = learningPlanService;
        this.postService = postService;
        this.userActivityService = userActivityService;
    }
    
    /**
     * Get or create user progress for a learning plan
     */
    @Transactional
    public UserProgress getOrCreateUserProgress(Long planId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        // Check if user progress already exists
        Optional<UserProgress> existingProgress = userProgressRepository.findByUserAndLearningPlan(currentUser, learningPlan);
        
        if (existingProgress.isPresent()) {
            return existingProgress.get();
        }
          // Create new user progress
        UserProgress userProgress = UserProgress.builder()
                .user(currentUser)
                .learningPlan(learningPlan)
                .completionPercentage(0)
                .topicProgress(new HashSet<>())
                .resourceProgress(new HashSet<>())
                .build();
          // Initialize topic progress for all topics
        if (userProgress.getTopicProgress() == null) {
            userProgress.setTopicProgress(new HashSet<>());
        }
        
        if (userProgress.getResourceProgress() == null) {
            userProgress.setResourceProgress(new HashSet<>());
        }
        
        learningPlan.getTopics().forEach(topic -> {
            UserProgress.TopicProgress topicProgress = UserProgress.TopicProgress.builder()
                    .topicId(topic.getId())
                    .status(Topic.CompletionStatus.NOT_STARTED)
                    .build();
            
            userProgress.getTopicProgress().add(topicProgress);
            
            // Initialize resource progress for all resources
            topic.getResources().forEach(resource -> {
                UserProgress.ResourceProgress resourceProgress = UserProgress.ResourceProgress.builder()
                        .resourceId(resource.getId())
                        .isCompleted(false)
                        .build();
                
                userProgress.getResourceProgress().add(resourceProgress);
            });
        });
        
        return userProgressRepository.save(userProgress);
    }
    
    /**
     * Update topic status for the current user's progress
     */
    @Transactional
    public LearningPlanResponse updateTopicCompletionStatus(Long planId, Long topicId, Topic.CompletionStatus status, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        // Get the learning plan
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        // Check if topic exists in the learning plan
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        // Get or create user progress
        UserProgress userProgress = getOrCreateUserProgress(planId, currentUserEmail);
          // Ensure collections are initialized
        if (userProgress.getTopicProgress() == null) {
            userProgress.setTopicProgress(new HashSet<>());
        }
        
        if (userProgress.getResourceProgress() == null) {
            userProgress.setResourceProgress(new HashSet<>());
        }
        
        // Find or create topic progress
        Optional<UserProgress.TopicProgress> existingTopicProgress = userProgress.getTopicProgress().stream()
                .filter(tp -> tp.getTopicId().equals(topicId))
                .findFirst();
                
        if (existingTopicProgress.isPresent()) {
            // Update existing topic progress
            UserProgress.TopicProgress topicProgress = existingTopicProgress.get();
            topicProgress.setStatus(status);
            
            // Set completion date if completed
            if (status == Topic.CompletionStatus.COMPLETED && topicProgress.getCompletionDate() == null) {
                topicProgress.setCompletionDate(new Date());
            } else if (status != Topic.CompletionStatus.COMPLETED) {
                topicProgress.setCompletionDate(null);
            }
        } else {
            // Create new topic progress
            UserProgress.TopicProgress topicProgress = UserProgress.TopicProgress.builder()
                    .topicId(topicId)
                    .status(status)
                    .build();
            
            // Set completion date if completed
            if (status == Topic.CompletionStatus.COMPLETED) {
                topicProgress.setCompletionDate(new Date());
            }
            
            userProgress.getTopicProgress().add(topicProgress);
        }        // Recalculate completion percentage
        userProgress.calculateCompletionPercentage();
        userProgressRepository.save(userProgress);
        
        // Update posts associated with this user to reflect the new progress percentage
        if (userProgress.getUser() != null) {
            postService.updatePostsWithLearningPlanProgress(
                learningPlan.getId(), 
                userProgress.getCompletionPercentage(), 
                userProgress.getUser().getId()
            );
            
            // Record learning progress activity
            userActivityService.recordLearningPlanProgress(
                userProgress.getUser(),
                learningPlan,
                userProgress.getCompletionPercentage()
            );
            
            // If the status is COMPLETED, record topic completion activity
            if (status == Topic.CompletionStatus.COMPLETED) {
                userActivityService.recordTopicCompletion(
                    userProgress.getUser(),
                    learningPlan,
                    topic
                );
            }
        }
        
        // Return the updated learning plan with user progress
        return learningPlanService.getLearningPlanById(planId, currentUserEmail);
    }
    
    /**
     * Update resource completion status for the current user's progress
     */
    @Transactional
    public LearningPlanResponse updateResourceCompletionStatus(Long planId, Long topicId, Long resourceId, Boolean isCompleted, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        // Get the learning plan
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        // Check if topic exists in the learning plan
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        // Check if resource exists in the topic
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", resourceId));
        
        if (!resource.getTopic().getId().equals(topicId)) {
            throw new IllegalArgumentException("The resource does not belong to the specified topic");
        }
        
        // Get or create user progress
        UserProgress userProgress = getOrCreateUserProgress(planId, currentUserEmail);
        
        // Find or create resource progress
        Optional<UserProgress.ResourceProgress> existingResourceProgress = userProgress.getResourceProgress().stream()
                .filter(rp -> rp.getResourceId().equals(resourceId))
                .findFirst();
                
        if (existingResourceProgress.isPresent()) {
            // Update existing resource progress
            UserProgress.ResourceProgress resourceProgress = existingResourceProgress.get();
            resourceProgress.setIsCompleted(isCompleted);
            
            // Set completion date if completed
            if (isCompleted && resourceProgress.getCompletionDate() == null) {
                resourceProgress.setCompletionDate(new Date());
            } else if (!isCompleted) {
                resourceProgress.setCompletionDate(null);
            }
        } else {
            // Create new resource progress
            UserProgress.ResourceProgress resourceProgress = UserProgress.ResourceProgress.builder()
                    .resourceId(resourceId)
                    .isCompleted(isCompleted)
                    .build();
            
            // Set completion date if completed
            if (isCompleted) {
                resourceProgress.setCompletionDate(new Date());
            }
            
            userProgress.getResourceProgress().add(resourceProgress);
        }        // Save user progress
        userProgress.calculateCompletionPercentage();
        userProgressRepository.save(userProgress);
        
        // Check if all resources in the topic are completed or not
        // and update the topic status accordingly
        updateTopicStatusBasedOnResources(userProgress, topic);
          // Update posts associated with this user to reflect the new progress percentage
        if (userProgress.getUser() != null) {
            postService.updatePostsWithLearningPlanProgress(
                learningPlan.getId(), 
                userProgress.getCompletionPercentage(), 
                userProgress.getUser().getId()
            );
            
            // Record learning progress activity
            userActivityService.recordLearningPlanProgress(
                userProgress.getUser(),
                learningPlan,
                userProgress.getCompletionPercentage()
            );
            
            // If the resource is completed, record resource completion activity
            if (isCompleted) {
                userActivityService.recordResourceCompletion(
                    userProgress.getUser(),
                    learningPlan,
                    topic,
                    resource
                );
            }
        }
        
        // Return the updated learning plan with user progress
        return learningPlanService.getLearningPlanById(planId, currentUserEmail);
    }
    
    /**
     * Update topic status based on its resources completion status
     */
    private void updateTopicStatusBasedOnResources(UserProgress userProgress, Topic topic) {
        // Get all resources for this topic
        Set<Resource> resources = new HashSet<>(topic.getResources());
        
        if (resources.isEmpty()) {
            return;
        }
        
        // Count completed resources
        long completedResourcesCount = userProgress.getResourceProgress().stream()
                .filter(rp -> resources.stream().anyMatch(r -> r.getId().equals(rp.getResourceId())))
                .filter(UserProgress.ResourceProgress::getIsCompleted)
                .count();
        
        // Get current topic progress
        Optional<UserProgress.TopicProgress> topicProgressOpt = userProgress.getTopicProgress().stream()
                .filter(tp -> tp.getTopicId().equals(topic.getId()))
                .findFirst();
        
        if (!topicProgressOpt.isPresent()) {
            return;
        }
        
        UserProgress.TopicProgress topicProgress = topicProgressOpt.get();
        
        // Update topic status based on resource completion
        if (completedResourcesCount == resources.size()) {
            // All resources are completed, mark topic as completed
            topicProgress.setStatus(Topic.CompletionStatus.COMPLETED);
            topicProgress.setCompletionDate(new Date());
        } else if (completedResourcesCount > 0) {
            // Some resources are completed, mark topic as in progress
            topicProgress.setStatus(Topic.CompletionStatus.IN_PROGRESS);
            topicProgress.setCompletionDate(null);
        } else {
            // No resources are completed, mark topic as not started
            topicProgress.setStatus(Topic.CompletionStatus.NOT_STARTED);
            topicProgress.setCompletionDate(null);        }
        
            // Recalculate completion percentage
            userProgress.calculateCompletionPercentage();
            userProgressRepository.save(userProgress);
    }
}