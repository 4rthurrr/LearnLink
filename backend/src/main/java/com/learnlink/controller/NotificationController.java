package com.learnlink.controller;

import com.learnlink.dto.response.ApiResponse;
import com.learnlink.dto.response.NotificationResponse;
import com.learnlink.model.User;
import com.learnlink.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final NotificationService notificationService;
    
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestParam(required = false) Boolean unreadOnly,
            @PageableDefault(size = 10) Pageable pageable,
            @AuthenticationPrincipal User currentUser) {
        
        Page<NotificationResponse> notifications = notificationService.getNotifications(
                currentUser.getEmail(), unreadOnly, pageable);
        return ResponseEntity.ok(notifications);
    }
    
    @PatchMapping("/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markNotificationAsRead(
            @PathVariable Long notificationId,
            @AuthenticationPrincipal User currentUser) {
        
        NotificationResponse notification = notificationService.markNotificationAsRead(notificationId, currentUser.getEmail());
        return ResponseEntity.ok(notification);
    }
    
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse> markAllNotificationsAsRead(@AuthenticationPrincipal User currentUser) {
        notificationService.markAllNotificationsAsRead(currentUser.getEmail());
        return ResponseEntity.ok(new ApiResponse(true, "All notifications marked as read"));
    }
    
    @GetMapping("/unread/count")
    public ResponseEntity<Long> countUnreadNotifications(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(notificationService.countUnreadNotifications(currentUser.getEmail()));
    }
}
