package com.learnlink.service;

import com.learnlink.dto.response.NotificationResponse;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Notification;
import com.learnlink.model.User;
import com.learnlink.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserService userService;
    
    @Transactional
    public void createNotification(User recipient, User actor, Notification.NotificationType type, 
                                  String message, String entityType, Long entityId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .actor(actor)
                .type(type)
                .message(message)
                .entityType(entityType)
                .entityId(entityId)
                .isRead(false)
                .build();
        
        notificationRepository.save(notification);
    }
    
    public Page<NotificationResponse> getNotifications(String currentUserEmail, Boolean unreadOnly, Pageable pageable) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Page<Notification> notifications;
        if (unreadOnly != null && unreadOnly) {
            notifications = notificationRepository.findByRecipientAndIsReadOrderByCreatedAtDesc(currentUser, false, pageable);
        } else {
            notifications = notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser, pageable);
        }
        
        return notifications.map(this::mapToNotificationResponse);
    }
    
    @Transactional
    public NotificationResponse markNotificationAsRead(Long notificationId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to access this notification");
        }
        
        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        
        return mapToNotificationResponse(updatedNotification);
    }
    
    @Transactional
    public void markAllNotificationsAsRead(String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Page<Notification> unreadNotifications = notificationRepository
                .findByRecipientAndIsReadOrderByCreatedAtDesc(currentUser, false, Pageable.unpaged());
        
        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        });
    }
    
    public long countUnreadNotifications(String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        return notificationRepository.countByRecipientAndIsRead(currentUser, false);
    }
    
    private NotificationResponse mapToNotificationResponse(Notification notification) {
        NotificationResponse.UserSummaryResponse actorResponse = null;
        
        if (notification.getActor() != null) {
            actorResponse = NotificationResponse.UserSummaryResponse.builder()
                    .id(notification.getActor().getId())
                    .name(notification.getActor().getName())
                    .profilePicture(notification.getActor().getProfilePicture())
                    .build();
        }
        
        return NotificationResponse.builder()
                .id(notification.getId())
                .actor(actorResponse)
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .entityType(notification.getEntityType())
                .entityId(notification.getEntityId())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
