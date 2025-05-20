package com.learnlink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "user_progress",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"user_id", "learning_plan_id"})
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProgress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_plan_id", nullable = false)
    private LearningPlan learningPlan;
      @ElementCollection
    @CollectionTable(
        name = "user_topic_progress", 
        joinColumns = @JoinColumn(name = "user_progress_id")
    )
    @Builder.Default
    private Set<TopicProgress> topicProgress = new HashSet<>();
    
    @ElementCollection
    @CollectionTable(
        name = "user_resource_progress", 
        joinColumns = @JoinColumn(name = "user_progress_id")
    )
    @Builder.Default
    private Set<ResourceProgress> resourceProgress = new HashSet<>();
    
    private Integer completionPercentage;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date lastUpdated;
    
    @PrePersist
    protected void onCreate() {
        startDate = new Date();
        lastUpdated = new Date();
        if (completionPercentage == null) {
            completionPercentage = 0;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = new Date();
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TopicProgress {
        private Long topicId;
        
        @Enumerated(EnumType.STRING)
        private Topic.CompletionStatus status;
        
        @Temporal(TemporalType.TIMESTAMP)
        private Date completionDate;
    }
    
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResourceProgress {
        private Long resourceId;
        private Boolean isCompleted;
        
        @Temporal(TemporalType.TIMESTAMP)
        private Date completionDate;
    }
      public void calculateCompletionPercentage() {
        if (topicProgress.isEmpty()) {
            completionPercentage = 0;
            return;
        }
        
        int totalTopics = topicProgress.size();
        double completedWeight = 0;
        
        for (TopicProgress tp : topicProgress) {
            if (tp.getStatus() == Topic.CompletionStatus.COMPLETED) {
                completedWeight += 1.0;
            } else if (tp.getStatus() == Topic.CompletionStatus.IN_PROGRESS) {
                // Get the topic from learning plan
                Topic matchingTopic = null;
                for (Topic t : learningPlan.getTopics()) {
                    if (t.getId().equals(tp.getTopicId())) {
                        matchingTopic = t;
                        break;
                    }
                }
                
                final Topic topic = matchingTopic;
                if (topic != null && !topic.getResources().isEmpty()) {
                    // Calculate resource completion percentage for this topic
                    long totalResources = topic.getResources().size();
                    long completedResources = resourceProgress.stream()
                        .filter(rp -> {
                            for (Resource r : topic.getResources()) {
                                if (r.getId().equals(rp.getResourceId()) && rp.getIsCompleted()) {
                                    return true;
                                }
                            }
                            return false;
                        })
                        .count();
                    
                    if (totalResources > 0) {
                        completedWeight += ((double) completedResources / totalResources) * 0.5;
                    }
                }
            }
        }
        
        completionPercentage = (int) Math.round((completedWeight / totalTopics) * 100);
    }
}