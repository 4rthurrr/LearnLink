package com.learnlink.repository;

import com.learnlink.model.Post;
import com.learnlink.model.User;
import com.learnlink.model.UserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

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
      // Delete all activities related to a post
    void deleteByPost(Post post);    // Delete all activities related to a post by post ID
    @Query("DELETE FROM UserActivity ua WHERE ua.post.id = :postId")
    @Modifying
    @Transactional
    void deleteByPostId(@Param("postId") Long postId);
    
    // Native SQL query to delete user activities related to a post
    @Query(value = "DELETE FROM user_activities WHERE post_id = :postId", nativeQuery = true)
    @Modifying
    @Transactional
    void deleteByPostIdNative(@Param("postId") Long postId);
}
