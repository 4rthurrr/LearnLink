package com.learnlink.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "learning_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User creator;
    
    @Enumerated(EnumType.STRING)
    private Category category;
    
    @OneToMany(mappedBy = "learningPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Topic> topics = new ArrayList<>();
    
    private Integer estimatedDays;
    
    private Integer completionPercentage;
    
    private Boolean isPublic;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date targetCompletionDate;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
        if (completionPercentage == null) {
            completionPercentage = 0;
        }
        if (isPublic == null) {
            isPublic = true;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
    
    public enum Category {
        PROGRAMMING,
        DESIGN,
        BUSINESS,
        LANGUAGE,
        MUSIC,
        ART,
        SCIENCE,
        MATH,
        HISTORY,
        OTHER
    }
      public void calculateCompletionPercentage() {
        if (topics == null || topics.isEmpty()) {
            this.completionPercentage = 0;
            return;
        }
        
        int totalTopics = topics.size();
        double completedWeight = 0;
        
        for (Topic topic : topics) {
            if (topic.getCompletionStatus() == Topic.CompletionStatus.COMPLETED) {
                completedWeight += 1.0;
            } else if (topic.getCompletionStatus() == Topic.CompletionStatus.IN_PROGRESS) {
                // If topic is in progress, calculate based on completed resources
                List<Resource> resources = topic.getResources();
                if (resources != null && !resources.isEmpty()) {
                    int completedResources = 0;
                    for (Resource resource : resources) {
                        if (resource.getIsCompleted() != null && resource.getIsCompleted()) {
                            completedResources++;
                        }
                    }
                    // Weight partially completed topics as half of a completed topic
                    // plus additional weight based on resource completion
                    if (resources.size() > 0) {
                        completedWeight += 0.5 * ((double) completedResources / resources.size());
                    }
                }
            }
        }
        
        this.completionPercentage = (int) Math.round((completedWeight / totalTopics) * 100);
    }
}
