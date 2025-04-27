package com.learnlink.repository;

import com.learnlink.model.Notification;
import com.learnlink.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    Page<Notification> findByRecipientOrderByCreatedAtDesc(User recipient, Pageable pageable);
    
    Page<Notification> findByRecipientAndIsReadOrderByCreatedAtDesc(User recipient, Boolean isRead, Pageable pageable);
    
    long countByRecipientAndIsRead(User recipient, Boolean isRead);
}
