package com.learnlink.controller;

import com.learnlink.dto.ApiResponse;
import com.learnlink.dto.NotificationDto;
import com.learnlink.security.CurrentUser;
import com.learnlink.security.UserPrincipal;
import com.learnlink.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            Pageable pageable,
            @CurrentUser UserPrincipal currentUser) {
        Page<NotificationDto> notifications = notificationService.getUserNotifications(currentUser.getId(), pageable);
        return ResponseEntity.ok(notifications);
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDto> markAsRead(
            @PathVariable Long id,
            @CurrentUser UserPrincipal currentUser) {
        NotificationDto notification = notificationService.markAsRead(id, currentUser.getId());
        return ResponseEntity.ok(notification);
    }
    
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllAsRead(@CurrentUser UserPrincipal currentUser) {
        notificationService.markAllAsRead(currentUser.getId());
        return ResponseEntity.ok(new ApiResponse(true, "All notifications marked as read"));
    }
}
