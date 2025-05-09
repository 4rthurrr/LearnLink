package com.learnlink.repository;

import com.learnlink.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    Boolean existsByEmail(String email);
    
    Optional<User> findByProviderAndProviderId(User.AuthProvider provider, String providerId);

    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String name, String email, Pageable pageable);
}
