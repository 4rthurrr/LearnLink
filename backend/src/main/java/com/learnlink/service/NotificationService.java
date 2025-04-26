package com.learnlink.service;

import com.learnlink.dto.NotificationDto;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Notification;
import com.learnlink.model.NotificationType;
import com.learnlink.model.User;
import com.learnlink.repository.NotificationRepository;
import com.learnlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Page<NotificationDto> getUserNotifications(Long userId, Pageable pageable) {
        Page<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        List<NotificationDto> notificationDtos = notifications.getContent().stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
                
        return new PageImpl<>(notificationDtos, pageable, notifications.getTotalElements());
    }

    @Transactional
    public NotificationDto createNotification(Long userId, NotificationType type, String content, String link) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setContent(content);
        notification.setLink(link);
        notification.setRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        
        // Convert to DTO for real-time notification
        NotificationDto notificationDto = NotificationDto.fromEntity(savedNotification);
        
        // Send real-time notification
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notificationDto
        );

        return notificationDto;
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to access this notification");
        }

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        Notification updatedNotification = notificationRepository.save(notification);

        return NotificationDto.fromEntity(updatedNotification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndReadFalse(userId);
        LocalDateTime now = LocalDateTime.now();
        
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notification.setReadAt(now);
        });
        
        notificationRepository.saveAll(unreadNotifications);
    }
}
