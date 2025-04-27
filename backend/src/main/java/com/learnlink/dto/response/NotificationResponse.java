package com.learnlink.dto.response;

import com.learnlink.model.Notification;
import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class NotificationResponse {
    
    private Long id;
    private UserSummaryResponse actor;
    private String message;
    private Notification.NotificationType type;
    private Boolean isRead;
    private String entityType;
    private Long entityId;
    private Date createdAt;
    
    @Data
    @Builder
    public static class UserSummaryResponse {
        private Long id;
        private String name;
        private String profilePicture;
    }
}
