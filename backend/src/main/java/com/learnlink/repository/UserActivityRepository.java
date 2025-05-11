package com.learnlink.repository;

import com.learnlink.model.User;
import com.learnlink.model.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {
    
    // Find all activities for a user
    Page<UserActivity> findByUserIdOrderByTimestampDesc(Long userId, Pageable pageable);
      // Find learning progress activities for a user
    @Query("SELECT a FROM UserActivity a WHERE a.user.id = ?1 AND " +
           "(a.type = com.learnlink.model.UserActivity$ActivityType.LEARNING_PROGRESS OR " +
           "a.type = com.learnlink.model.UserActivity$ActivityType.TOPIC_COMPLETED OR " +
           "a.type = com.learnlink.model.UserActivity$ActivityType.RESOURCE_COMPLETED) " +
           "ORDER BY a.timestamp DESC")
    Page<UserActivity> findLearningProgressByUserId(Long userId, Pageable pageable);
    
    // Find social activities for a user
    @Query("SELECT a FROM UserActivity a WHERE a.user.id = ?1 AND " +
           "(a.type = com.learnlink.model.UserActivity$ActivityType.POST_LIKE OR " +
           "a.type = com.learnlink.model.UserActivity$ActivityType.POST_COMMENT) " +
           "ORDER BY a.timestamp DESC")
    Page<UserActivity> findSocialActivityByUserId(Long userId, Pageable pageable);
}
