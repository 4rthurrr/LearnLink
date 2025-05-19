package com.learnlink.service;

import com.learnlink.dto.request.LearningPlanRequest;
import com.learnlink.dto.request.ResourceRequest;
import com.learnlink.dto.request.TopicRequest;
import com.learnlink.dto.response.LearningPlanResponse;
import com.learnlink.dto.response.TopicResponse;
import com.learnlink.dto.response.ResourceResponse;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.*;
import com.learnlink.model.Topic.CompletionStatus;
import com.learnlink.model.UserProgress;
import com.learnlink.repository.LearningPlanRepository;
import com.learnlink.repository.ResourceRepository;
import com.learnlink.repository.TopicRepository;
import com.learnlink.repository.UserProgressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningPlanService {
    
    private final LearningPlanRepository learningPlanRepository;
    private final TopicRepository topicRepository;
    private final ResourceRepository resourceRepository;
    private final UserService userService;
    private final UserProgressRepository userProgressRepository;
    
    @Transactional
    public LearningPlanResponse createLearningPlan(LearningPlanRequest learningPlanRequest, String currentUserEmail) {
        log.info("Creating learning plan: {} with topics: {}", 
            learningPlanRequest.getTitle(), 
            learningPlanRequest.getTopics() != null ? learningPlanRequest.getTopics().size() : 0);
        
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        // Create learning plan without topics first
        LearningPlan learningPlan = LearningPlan.builder()
                .title(learningPlanRequest.getTitle())
                .description(learningPlanRequest.getDescription())
                .category(learningPlanRequest.getCategory())
                .isPublic(learningPlanRequest.getIsPublic() != null ? learningPlanRequest.getIsPublic() : true)
                .estimatedDays(learningPlanRequest.getEstimatedDays())
                .startDate(learningPlanRequest.getStartDate())
                .targetCompletionDate(learningPlanRequest.getTargetCompletionDate())
                .creator(currentUser)
                .topics(new ArrayList<>()) // Initialize with empty list
                .build();
        
        LearningPlan savedLearningPlan = learningPlanRepository.save(learningPlan);
        log.info("Saved learning plan with ID: {}", savedLearningPlan.getId());
        
        // Now handle topics if present
        if (learningPlanRequest.getTopics() != null && !learningPlanRequest.getTopics().isEmpty()) {
            log.info("Processing {} topics for learning plan", learningPlanRequest.getTopics().size());
            
            List<Topic> topics = new ArrayList<>();
            for (TopicRequest topicRequest : learningPlanRequest.getTopics()) {
                Topic topic = Topic.builder()
                        .title(topicRequest.getTitle())
                        .description(topicRequest.getDescription())
                        .orderIndex(topicRequest.getOrderIndex() != null ? topicRequest.getOrderIndex() : 0)
                        .completionStatus(Topic.CompletionStatus.NOT_STARTED)
                        .learningPlan(savedLearningPlan)
                        .build();
                topics.add(topic);
            }
            
            // Save all topics
            List<Topic> savedTopics = topicRepository.saveAll(topics);
            log.info("Saved {} topics to database", savedTopics.size());
            
            // Update the learning plan with topics
            savedLearningPlan.setTopics(savedTopics);
            learningPlanRepository.save(savedLearningPlan);
        } else {
            log.warn("No topics provided for learning plan");
        }
        
        // Fetch fresh instance from database to ensure all relationships are loaded
        LearningPlan finalLearningPlan = learningPlanRepository.findById(savedLearningPlan.getId())
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", savedLearningPlan.getId()));
        
        return mapToLearningPlanResponse(finalLearningPlan);
    }
    
    /**
     * Creates a new topic from a request
     * @param topicRequest The topic request
     * @param learningPlan The learning plan to add the topic to
     * @return The created topic
     */
    @SuppressWarnings("unused")
    private Topic createTopicFromRequest(TopicRequest topicRequest, LearningPlan learningPlan) {
        Topic topic = Topic.builder()
                .title(topicRequest.getTitle())
                .description(topicRequest.getDescription())
                .orderIndex(topicRequest.getOrderIndex())
                .completionStatus(topicRequest.getCompletionStatus() != null ? 
                                topicRequest.getCompletionStatus() : 
                                CompletionStatus.NOT_STARTED)
                .learningPlan(learningPlan)
                .build();
        
        log.debug("Created topic entity: {}", topic.getTitle());
        return topic;
    }
    
    /**
     * Maps a learning plan to a response object, including user progress data if available
     */
    private LearningPlanResponse mapToLearningPlanResponse(LearningPlan learningPlan) {
        return mapToLearningPlanResponse(learningPlan, null);
    }
    
    /**
     * Maps a learning plan to a response object, including user progress data if available
     */
    private LearningPlanResponse mapToLearningPlanResponse(LearningPlan learningPlan, User currentUser) {
        log.debug("Mapping learning plan to response: {}", learningPlan.getId());
          // Get user progress if user is provided
        final UserProgress userProgress;
        if (currentUser != null) {
            userProgress = userProgressRepository.findByUserAndLearningPlan(currentUser, learningPlan).orElse(null);
        } else {
            userProgress = null;
        }
        
        // Get topics and sort them by orderIndex
        List<LearningPlanResponse.TopicResponse> topicResponses = learningPlan.getTopics().stream()
            .sorted((t1, t2) -> t1.getOrderIndex().compareTo(t2.getOrderIndex()))
            .map(topic -> {                // Get topic progress from user progress if available
                final Topic.CompletionStatus initialTopicStatus = topic.getCompletionStatus();
                final Date initialTopicCompletionDate = topic.getCompletionDate();
                
                // Create final holders for the values that may be updated
                final Topic.CompletionStatus[] topicStatusHolder = {initialTopicStatus};
                final Date[] topicCompletionDateHolder = {initialTopicCompletionDate};
                
                if (userProgress != null) {
                    // Find topic progress for the current topic
                    Optional<UserProgress.TopicProgress> topicProgress = userProgress.getTopicProgress().stream()
                            .filter(tp -> tp.getTopicId().equals(topic.getId()))
                            .findFirst();
                    
                    // Override with user's progress if available
                    if (topicProgress.isPresent()) {
                        topicStatusHolder[0] = topicProgress.get().getStatus();
                        topicCompletionDateHolder[0] = topicProgress.get().getCompletionDate();
                    }
                }
                
                // Process resources
                List<LearningPlanResponse.ResourceResponse> resourceResponses = topic.getResources().stream()
                        .map(resource -> {                            // Get resource completion status
                            final boolean initialIsCompleted = resource.getIsCompleted();
                            final boolean[] isCompletedHolder = {initialIsCompleted};
                            
                            // Check user progress for resource if available
                            if (userProgress != null) {
                                Optional<UserProgress.ResourceProgress> resourceProgress = userProgress.getResourceProgress().stream()
                                        .filter(rp -> rp.getResourceId().equals(resource.getId()))
                                        .findFirst();
                                
                                // Override with user's progress if available
                                if (resourceProgress.isPresent()) {
                                    isCompletedHolder[0] = resourceProgress.get().getIsCompleted();
                                }
                            }
                              return LearningPlanResponse.ResourceResponse.builder()
                                    .id(resource.getId())
                                    .title(resource.getTitle())
                                    .description(resource.getDescription())
                                    .url(resource.getUrl())
                                    .type(resource.getType())
                                    .isCompleted(isCompletedHolder[0])
                                    .build();
                        })
                        .collect(Collectors.toList());
                  return LearningPlanResponse.TopicResponse.builder()
                        .id(topic.getId())
                        .title(topic.getTitle())
                        .description(topic.getDescription())
                        .orderIndex(topic.getOrderIndex())
                        .completionStatus(topicStatusHolder[0])
                        .resources(resourceResponses)
                        .startDate(topic.getStartDate())
                        .completionDate(topicCompletionDateHolder[0])
                        .build();
            })
            .collect(Collectors.toList());
        
        log.debug("Found {} topics for learning plan {}", topicResponses.size(), learningPlan.getId());
        
        LearningPlanResponse.UserSummaryResponse creatorResponse = LearningPlanResponse.UserSummaryResponse.builder()
                .id(learningPlan.getCreator().getId())
                .name(learningPlan.getCreator().getName())
                .profilePicture(learningPlan.getCreator().getProfilePicture())
                .build();
          // Calculate completion percentage based on user progress if available
        final Integer initialCompletionPercentage = learningPlan.getCompletionPercentage();
        final Integer[] completionPercentageHolder = {initialCompletionPercentage};
        if (userProgress != null) {
            completionPercentageHolder[0] = userProgress.getCompletionPercentage();
        }
        
        return LearningPlanResponse.builder()
                .id(learningPlan.getId())
                .title(learningPlan.getTitle())
                .description(learningPlan.getDescription())
                .creator(creatorResponse)
                .category(learningPlan.getCategory())
                .topics(topicResponses)
                .estimatedDays(learningPlan.getEstimatedDays())
                .completionPercentage(completionPercentageHolder[0])
                .isPublic(learningPlan.getIsPublic())
                .startDate(learningPlan.getStartDate())
                .targetCompletionDate(learningPlan.getTargetCompletionDate())
                .createdAt(learningPlan.getCreatedAt())
                .updatedAt(learningPlan.getUpdatedAt())
                .build();
    }
    
    /**
     * Gets a learning plan by ID, including the user's progress if the user is not the creator
     */
    public LearningPlanResponse getLearningPlanById(Long planId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        // Check if the learning plan is public or belongs to the current user
        if (!learningPlan.getIsPublic() && !learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to view this learning plan");
        }
        
        return mapToLearningPlanResponse(learningPlan, currentUser);
    }
    
    public Page<LearningPlanResponse> getLearningPlansByUser(Long userId, Pageable pageable, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        User user = userService.getUserById(userId);
        
        Page<LearningPlan> learningPlans;
        if (currentUser.getId().equals(userId)) {
            // User can see all their learning plans
            learningPlans = learningPlanRepository.findByCreator(user, pageable);
        } else {
            // Others can only see public learning plans
            learningPlans = learningPlanRepository.findByCreatorAndIsPublic(user, true, pageable);
        }
        
        return learningPlans.map(this::mapToLearningPlanResponse);
    }
    
    public Page<LearningPlanResponse> getPublicLearningPlans(Pageable pageable, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        return learningPlanRepository.findPublicLearningPlans(currentUser.getId(), pageable)
                .map(this::mapToLearningPlanResponse);
    }
    
    public Page<LearningPlanResponse> searchLearningPlans(String keyword, Pageable pageable, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        return learningPlanRepository.searchLearningPlans(keyword, currentUser.getId(), pageable)
                .map(this::mapToLearningPlanResponse);
    }
    
    @Transactional
    public LearningPlanResponse updateLearningPlan(Long planId, LearningPlanRequest learningPlanRequest, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to update this learning plan");
        }
        
        learningPlan.setTitle(learningPlanRequest.getTitle());
        learningPlan.setDescription(learningPlanRequest.getDescription());
        learningPlan.setCategory(learningPlanRequest.getCategory());
        learningPlan.setEstimatedDays(learningPlanRequest.getEstimatedDays());
        learningPlan.setIsPublic(learningPlanRequest.getIsPublic());
        learningPlan.setStartDate(learningPlanRequest.getStartDate());
        learningPlan.setTargetCompletionDate(learningPlanRequest.getTargetCompletionDate());
        
        LearningPlan updatedLearningPlan = learningPlanRepository.save(learningPlan);
        
        return mapToLearningPlanResponse(updatedLearningPlan);
    }
    
    @Transactional
    public void deleteLearningPlan(Long planId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to delete this learning plan");
        }
        
        learningPlanRepository.delete(learningPlan);
    }
    
    @Transactional
    public LearningPlanResponse addTopicToLearningPlan(Long planId, TopicRequest topicRequest, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this learning plan");
        }
        
        // Determine the order index if not provided
        Integer orderIndex = topicRequest.getOrderIndex();
        if (orderIndex == null) {
            long topicCount = topicRepository.countByLearningPlan(learningPlan);
            orderIndex = (int) topicCount + 1;
        }
        
        Topic topic = Topic.builder()
                .title(topicRequest.getTitle())
                .description(topicRequest.getDescription())
                .learningPlan(learningPlan)
                .orderIndex(orderIndex)
                .completionStatus(topicRequest.getCompletionStatus() != null ? 
                        topicRequest.getCompletionStatus() : Topic.CompletionStatus.NOT_STARTED)
                .resources(new ArrayList<>())
                .build();
        
        learningPlan.getTopics().add(topic);
        topicRepository.save(topic);
        
        // Recalculate completion percentage
        learningPlan.calculateCompletionPercentage();
        LearningPlan updatedPlan = learningPlanRepository.save(learningPlan);
        
        return mapToLearningPlanResponse(updatedPlan);
    }
    
    @Transactional
    public LearningPlanResponse updateTopic(Long planId, Long topicId, TopicRequest topicRequest, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this learning plan");
        }
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        topic.setTitle(topicRequest.getTitle());
        topic.setDescription(topicRequest.getDescription());
        topic.setOrderIndex(topicRequest.getOrderIndex());
        topic.setCompletionStatus(topicRequest.getCompletionStatus());
        
        topicRepository.save(topic);
        
        // Recalculate completion percentage
        learningPlan.calculateCompletionPercentage();
        LearningPlan updatedPlan = learningPlanRepository.save(learningPlan);
        
        return mapToLearningPlanResponse(updatedPlan);
    }
    
    @Transactional
    public LearningPlanResponse deleteTopic(Long planId, Long topicId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this learning plan");
        }
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        learningPlan.getTopics().remove(topic);
        topicRepository.delete(topic);
        
        // Recalculate completion percentage
        learningPlan.calculateCompletionPercentage();
        LearningPlan updatedPlan = learningPlanRepository.save(learningPlan);
        
        return mapToLearningPlanResponse(updatedPlan);
    }
    
    @Transactional
    public LearningPlanResponse addResourceToTopic(Long planId, Long topicId, ResourceRequest resourceRequest, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this learning plan");
        }
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        Resource resource = Resource.builder()
                .title(resourceRequest.getTitle())
                .description(resourceRequest.getDescription())
                .url(resourceRequest.getUrl())
                .type(resourceRequest.getType() != null ? resourceRequest.getType() : Resource.ResourceType.OTHER)
                .topic(topic)
                .isCompleted(resourceRequest.getIsCompleted() != null ? resourceRequest.getIsCompleted() : false)
                .build();
        
        topic.getResources().add(resource);
        resourceRepository.save(resource);
        
        return mapToLearningPlanResponse(learningPlan);
    }
    
    @Transactional
    public LearningPlanResponse updateResource(Long planId, Long topicId, Long resourceId, ResourceRequest resourceRequest, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this learning plan");
        }
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", resourceId));
        
        if (!resource.getTopic().getId().equals(topicId)) {
            throw new IllegalArgumentException("The resource does not belong to the specified topic");
        }
        
        resource.setTitle(resourceRequest.getTitle());
        resource.setDescription(resourceRequest.getDescription());
        resource.setUrl(resourceRequest.getUrl());
        resource.setType(resourceRequest.getType());
        resource.setIsCompleted(resourceRequest.getIsCompleted());
        
        resourceRepository.save(resource);
        
        return mapToLearningPlanResponse(learningPlan);
    }
    
    @Transactional
    public LearningPlanResponse deleteResource(Long planId, Long topicId, Long resourceId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this learning plan");
        }
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", resourceId));
        
        if (!resource.getTopic().getId().equals(topicId)) {
            throw new IllegalArgumentException("The resource does not belong to the specified topic");
        }
        
        topic.getResources().remove(resource);
        resourceRepository.delete(resource);
        
        return mapToLearningPlanResponse(learningPlan);
    }
    
    @Transactional
    public LearningPlanResponse updateTopicCompletionStatus(Long planId, Long topicId, Topic.CompletionStatus status, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this learning plan");
        }
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        topic.setCompletionStatus(status);
        if (status == Topic.CompletionStatus.COMPLETED && topic.getCompletionDate() == null) {
            topic.setCompletionDate(new java.util.Date());
        }
        
        topicRepository.save(topic);
        
        // Recalculate completion percentage
        learningPlan.calculateCompletionPercentage();
        LearningPlan updatedPlan = learningPlanRepository.save(learningPlan);
        
        return mapToLearningPlanResponse(updatedPlan);
    }
    
    @Transactional
    public LearningPlanResponse updateResourceCompletionStatus(Long planId, Long topicId, Long resourceId, Boolean isCompleted, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this learning plan");
        }
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", resourceId));
        
        if (!resource.getTopic().getId().equals(topicId)) {
            throw new IllegalArgumentException("The resource does not belong to the specified topic");
        }
        
        resource.setIsCompleted(isCompleted);
        resourceRepository.save(resource);
        
        return mapToLearningPlanResponse(learningPlan);
    }
    
    /**
     * Find all public learning plans
     * 
     * @param pageable Pagination information
     * @return Page of public learning plan responses
     */
    public Page<LearningPlanResponse> findAllPublicLearningPlans(Pageable pageable) {
        log.info("Finding all public learning plans with pageable: {}", pageable);
        
        Page<LearningPlan> publicLearningPlans = learningPlanRepository.findByIsPublicTrue(pageable);
        
        log.info("Found {} public learning plans", publicLearningPlans.getTotalElements());
        
        return publicLearningPlans.map(this::mapToLearningPlanResponse);
    }
    
    /**
     * Maps a topic to a response object
     * @param topic The topic to map
     * @return The topic response
     */
    @SuppressWarnings("unused")
    private TopicResponse mapToTopicResponse(Topic topic) {
        // Add null check for resources
        List<ResourceResponse> resourceResponses = topic.getResources() == null 
            ? new ArrayList<>() 
            : topic.getResources().stream()
                .map(this::mapToResourceResponse)
                .collect(Collectors.toList());
        
        return TopicResponse.builder()
                .id(topic.getId())
                .title(topic.getTitle())
                .description(topic.getDescription())
                .completionStatus(topic.getCompletionStatus())
                .resources(resourceResponses) // Safe list is passed here
                .build();
    }

    private ResourceResponse mapToResourceResponse(Resource resource) {
        return ResourceResponse.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .description(resource.getDescription())
                .url(resource.getUrl())
                .type(resource.getType())
                .isCompleted(resource.getIsCompleted())
                .build();
    }
    
    /**
     * Updates a resource's URL after a file has been uploaded.
     * 
     * @param planId The learning plan ID
     * @param topicId The topic ID
     * @param resourceId The resource ID
     * @param fileUrl The URL of the uploaded file
     * @param currentUserEmail The email of the current user
     * @return The updated learning plan
     */
    @Transactional
    public LearningPlanResponse updateResourceFileUrl(Long planId, Long topicId, Long resourceId, 
                                                    String fileUrl, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        if (!learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to modify this learning plan");
        }
        
        Topic topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic", "id", topicId));
        
        if (!topic.getLearningPlan().getId().equals(planId)) {
            throw new IllegalArgumentException("The topic does not belong to the specified learning plan");
        }
        
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource", "id", resourceId));
        
        if (!resource.getTopic().getId().equals(topicId)) {
            throw new IllegalArgumentException("The resource does not belong to the specified topic");
        }
        
        resource.setUrl(fileUrl);
        resource.setType(Resource.ResourceType.PDF); // Set the type based on file extension
        resourceRepository.save(resource);
        
        return mapToLearningPlanResponse(learningPlan);
    }
}
