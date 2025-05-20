package com.learnlink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User recipient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;
    
    @Enumerated(EnumType.STRING)
    private NotificationType type;
    
    private String message;
    
    @Column(name = "is_read")
    private Boolean isRead;
    
    private String entityType;
    
    private Long entityId;
    
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
        if (isRead == null) {
            isRead = false;
        }
    }
    
    public enum NotificationType {
        FOLLOW,
        LIKE,
        COMMENT,
        MENTION,
        LEARNING_PLAN_SHARE
    }
}
