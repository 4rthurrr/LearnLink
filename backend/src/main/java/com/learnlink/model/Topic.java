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
@Table(name = "topics")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Topic {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learning_plan_id", nullable = false)
    private LearningPlan learningPlan;
    
    private Integer orderIndex;
    
    @Enumerated(EnumType.STRING)
    private CompletionStatus completionStatus;
    
    @OneToMany(mappedBy = "topic", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Resource> resources = new ArrayList<>();
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date startDate;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date completionDate;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        updatedAt = new Date();
        if (completionStatus == null) {
            completionStatus = CompletionStatus.NOT_STARTED;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
        if (completionStatus == CompletionStatus.COMPLETED && completionDate == null) {
            completionDate = new Date();
        }
    }
    
    public enum CompletionStatus {
        NOT_STARTED,
        IN_PROGRESS,
        COMPLETED
    }
}
