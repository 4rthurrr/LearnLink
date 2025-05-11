package com.learnlink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "user_activities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;
    
    // For LEARNING_PROGRESS, TOPIC_COMPLETED
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_plan_id")
    private LearningPlan learningPlan;
    
    // For LEARNING_PROGRESS
    private Integer progressPercentage;
    
    // For TOPIC_COMPLETED
    @Column(name = "topic_id")
    private Long topicId;
    
    @Column(name = "topic_title")
    private String topicTitle;
    
    // For RESOURCE_COMPLETED
    @Column(name = "resource_id")
    private Long resourceId;
    
    @Column(name = "resource_title")
    private String resourceTitle;
    
    // For POST_LIKE, POST_COMMENT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    private Post post;
    
    // For POST_COMMENT
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "comment_id")
    private Comment comment;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date timestamp;
    
    @PrePersist
    protected void onCreate() {
        timestamp = new Date();
    }
    
    public enum ActivityType {
        LEARNING_PROGRESS,   // When a user makes progress in a learning plan
        TOPIC_COMPLETED,     // When a user completes a topic
        RESOURCE_COMPLETED,  // When a user completes a resource
        POST_LIKE,           // When a user likes a post
        POST_COMMENT         // When a user comments on a post
    }
}
