package com.learnlink.service;

import com.learnlink.dto.response.UserActivityResponse;
import com.learnlink.model.*;
import com.learnlink.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityService {
    
    private final UserActivityRepository userActivityRepository;
    private final UserService userService;
    
    /**
     * Count total number of activities
     */
    public long countActivities() {
        return userActivityRepository.count();
    }
    
    /**
     * Get all user activities
     */
    public Page<UserActivityResponse> getUserActivities(Long userId, Pageable pageable) {
        Page<UserActivity> activities = userActivityRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        return activities.map(this::mapToActivityResponse);
    }
    
    /**
     * Get user's learning progress activities
     */
    public Page<UserActivityResponse> getUserLearningProgress(Long userId, Pageable pageable) {
        Page<UserActivity> activities = userActivityRepository.findLearningProgressByUserId(userId, pageable);
        return activities.map(this::mapToActivityResponse);
    }
    
    /**
     * Get user's social activities
     */
    public Page<UserActivityResponse> getUserSocialActivity(Long userId, Pageable pageable) {
        Page<UserActivity> activities = userActivityRepository.findSocialActivityByUserId(userId, pageable);
        return activities.map(this::mapToActivityResponse);
    }
    
    /**
     * Record learning plan progress activity
     */
    @Transactional
    public void recordLearningPlanProgress(User user, LearningPlan learningPlan, Integer progressPercentage) {
        UserActivity activity = UserActivity.builder()
                .user(user)
                .type(UserActivity.ActivityType.LEARNING_PROGRESS)
                .learningPlan(learningPlan)
                .progressPercentage(progressPercentage)
                .timestamp(new Date())
                .build();
        
        userActivityRepository.save(activity);
        log.info("Recorded learning plan progress activity for user {}: {}% on plan {}", 
                user.getId(), progressPercentage, learningPlan.getId());
    }
    
    /**
     * Record topic completion activity
     */
    @Transactional
    public void recordTopicCompletion(User user, LearningPlan learningPlan, Topic topic) {
        UserActivity activity = UserActivity.builder()
                .user(user)
                .type(UserActivity.ActivityType.TOPIC_COMPLETED)
                .learningPlan(learningPlan)
                .topicId(topic.getId())
                .topicTitle(topic.getTitle())
                .timestamp(new Date())
                .build();
        
        userActivityRepository.save(activity);
        log.info("Recorded topic completion activity for user {}: topic {} in plan {}", 
                user.getId(), topic.getId(), learningPlan.getId());
    }
    
    /**
     * Record resource completion activity
     */
    @Transactional
    public void recordResourceCompletion(User user, LearningPlan learningPlan, Topic topic, Resource resource) {
        UserActivity activity = UserActivity.builder()
                .user(user)
                .type(UserActivity.ActivityType.RESOURCE_COMPLETED)
                .learningPlan(learningPlan)
                .topicId(topic.getId())
                .topicTitle(topic.getTitle())
                .resourceId(resource.getId())
                .resourceTitle(resource.getTitle())
                .timestamp(new Date())
                .build();
        
        userActivityRepository.save(activity);
        log.info("Recorded resource completion activity for user {}: resource {} in topic {}", 
                user.getId(), resource.getId(), topic.getId());
    }
    
    /**
     * Record post like activity
     */
    @Transactional
    public void recordPostLike(User user, Post post) {
        UserActivity activity = UserActivity.builder()
                .user(user)
                .type(UserActivity.ActivityType.POST_LIKE)
                .post(post)
                .timestamp(new Date())
                .build();
        
        userActivityRepository.save(activity);
        log.info("Recorded post like activity for user {}: post {}", 
                user.getId(), post.getId());
    }
    
    /**
     * Record post comment activity
     */
    @Transactional
    public void recordPostComment(User user, Post post, Comment comment) {
        UserActivity activity = UserActivity.builder()
                .user(user)
                .type(UserActivity.ActivityType.POST_COMMENT)
                .post(post)
                .comment(comment)
                .timestamp(new Date())
                .build();
        
        userActivityRepository.save(activity);
        log.info("Recorded post comment activity for user {}: comment {} on post {}", 
                user.getId(), comment.getId(), post.getId());
    }
    
    /**
     * Map a UserActivity entity to a UserActivityResponse DTO
     */
    private UserActivityResponse mapToActivityResponse(UserActivity activity) {
        UserActivityResponse response = new UserActivityResponse();
        response.setId(activity.getId());
        response.setType(activity.getType().toString());
        response.setTimestamp(activity.getTimestamp());
        
        // Map user details
        UserActivityResponse.UserSummary userSummary = new UserActivityResponse.UserSummary();
        userSummary.setId(activity.getUser().getId());
        userSummary.setName(activity.getUser().getName());
        userSummary.setProfilePicture(activity.getUser().getProfilePicture());
        response.setUser(userSummary);
        
        // Map learning plan details if applicable
        if (activity.getLearningPlan() != null) {
            UserActivityResponse.LearningPlanSummary planSummary = new UserActivityResponse.LearningPlanSummary();
            planSummary.setId(activity.getLearningPlan().getId());
            planSummary.setTitle(activity.getLearningPlan().getTitle());
            response.setLearningPlan(planSummary);
        }
        
        // Map specific fields based on activity type
        switch (activity.getType()) {
            case LEARNING_PROGRESS:
                response.setProgressPercentage(activity.getProgressPercentage());
                break;
                
            case TOPIC_COMPLETED:
                response.setTopicId(activity.getTopicId());
                response.setTopicTitle(activity.getTopicTitle());
                break;
                
            case RESOURCE_COMPLETED:
                response.setTopicId(activity.getTopicId());
                response.setTopicTitle(activity.getTopicTitle());
                response.setResourceId(activity.getResourceId());
                response.setResourceTitle(activity.getResourceTitle());
                break;
                
            case POST_LIKE:
            case POST_COMMENT:
                if (activity.getPost() != null) {
                    UserActivityResponse.PostSummary postSummary = new UserActivityResponse.PostSummary();
                    postSummary.setId(activity.getPost().getId());
                    postSummary.setTitle(activity.getPost().getTitle());
                    
                    // Map post author
                    UserActivityResponse.UserSummary authorSummary = new UserActivityResponse.UserSummary();
                    authorSummary.setId(activity.getPost().getAuthor().getId());
                    authorSummary.setName(activity.getPost().getAuthor().getName());
                    authorSummary.setProfilePicture(activity.getPost().getAuthor().getProfilePicture());
                    postSummary.setAuthor(authorSummary);
                    
                    response.setPost(postSummary);
                }
                
                if (activity.getType() == UserActivity.ActivityType.POST_COMMENT && activity.getComment() != null) {
                    UserActivityResponse.CommentSummary commentSummary = new UserActivityResponse.CommentSummary();
                    commentSummary.setId(activity.getComment().getId());
                    commentSummary.setContent(activity.getComment().getContent());
                    response.setComment(commentSummary);
                }
                break;
        }
        
        return response;
    }
}
