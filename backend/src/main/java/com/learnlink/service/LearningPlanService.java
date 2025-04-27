package com.learnlink.service;

import com.learnlink.dto.request.LearningPlanRequest;
import com.learnlink.dto.request.ResourceRequest;
import com.learnlink.dto.request.TopicRequest;
import com.learnlink.dto.response.LearningPlanResponse;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.LearningPlan;
import com.learnlink.model.Resource;
import com.learnlink.model.Topic;
import com.learnlink.model.User;
import com.learnlink.repository.LearningPlanRepository;
import com.learnlink.repository.ResourceRepository;
import com.learnlink.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningPlanService {
    
    private final LearningPlanRepository learningPlanRepository;
    private final TopicRepository topicRepository;
    private final ResourceRepository resourceRepository;
    private final UserService userService;
    
    @Transactional
    public LearningPlanResponse createLearningPlan(LearningPlanRequest learningPlanRequest, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = LearningPlan.builder()
                .title(learningPlanRequest.getTitle())
                .description(learningPlanRequest.getDescription())
                .category(learningPlanRequest.getCategory())
                .creator(currentUser)
                .estimatedDays(learningPlanRequest.getEstimatedDays())
                .isPublic(learningPlanRequest.getIsPublic() != null ? learningPlanRequest.getIsPublic() : true)
                .startDate(learningPlanRequest.getStartDate())
                .targetCompletionDate(learningPlanRequest.getTargetCompletionDate())
                .topics(new ArrayList<>())
                .completionPercentage(0)
                .build();
        
        LearningPlan savedLearningPlan = learningPlanRepository.save(learningPlan);
        
        return mapToLearningPlanResponse(savedLearningPlan);
    }
    
    public LearningPlanResponse getLearningPlanById(Long planId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        LearningPlan learningPlan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("LearningPlan", "id", planId));
        
        // Check if the learning plan is public or belongs to the current user
        if (!learningPlan.getIsPublic() && !learningPlan.getCreator().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to view this learning plan");
        }
        
        return mapToLearningPlanResponse(learningPlan);
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
    
    private LearningPlanResponse mapToLearningPlanResponse(LearningPlan learningPlan) {
        List<LearningPlanResponse.TopicResponse> topicResponses = learningPlan.getTopics().stream()
                .sorted((t1, t2) -> t1.getOrderIndex().compareTo(t2.getOrderIndex()))
                .map(topic -> {
                    List<LearningPlanResponse.ResourceResponse> resourceResponses = topic.getResources().stream()
                            .map(resource -> LearningPlanResponse.ResourceResponse.builder()
                                    .id(resource.getId())
                                    .title(resource.getTitle())
                                    .description(resource.getDescription())
                                    .url(resource.getUrl())
                                    .type(resource.getType())
                                    .isCompleted(resource.getIsCompleted())
                                    .build())
                            .collect(Collectors.toList());
                    
                    return LearningPlanResponse.TopicResponse.builder()
                            .id(topic.getId())
                            .title(topic.getTitle())
                            .description(topic.getDescription())
                            .orderIndex(topic.getOrderIndex())
                            .completionStatus(topic.getCompletionStatus())
                            .resources(resourceResponses)
                            .startDate(topic.getStartDate())
                            .completionDate(topic.getCompletionDate())
                            .build();
                })
                .collect(Collectors.toList());
        
        LearningPlanResponse.UserSummaryResponse creatorResponse = LearningPlanResponse.UserSummaryResponse.builder()
                .id(learningPlan.getCreator().getId())
                .name(learningPlan.getCreator().getName())
                .profilePicture(learningPlan.getCreator().getProfilePicture())
                .build();
        
        return LearningPlanResponse.builder()
                .id(learningPlan.getId())
                .title(learningPlan.getTitle())
                .description(learningPlan.getDescription())
                .creator(creatorResponse)
                .category(learningPlan.getCategory())
                .topics(topicResponses)
                .estimatedDays(learningPlan.getEstimatedDays())
                .completionPercentage(learningPlan.getCompletionPercentage())
                .isPublic(learningPlan.getIsPublic())
                .startDate(learningPlan.getStartDate())
                .targetCompletionDate(learningPlan.getTargetCompletionDate())
                .createdAt(learningPlan.getCreatedAt())
                .updatedAt(learningPlan.getUpdatedAt())
                .build();
    }
}
