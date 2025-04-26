package com.learnlink.repository;

import com.learnlink.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
    
    Page<User> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    @Query("SELECT u FROM User u WHERE u.id NOT IN :excludeIds ORDER BY u.createdAt DESC")
    List<User> findTop10ByIdNotIn(@Param("excludeIds") Set<Long> excludeIds);
}
