package com.learnlink.repository;

import com.learnlink.model.Like;
import com.learnlink.model.Post;
import com.learnlink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    
    List<Like> findByPost(Post post);
    
    List<Like> findByUser(User user);
    
    Optional<Like> findByUserAndPost(User user, Post post);
    
    boolean existsByUserAndPost(User user, Post post);
    
    long countByPost(Post post);
    
    void deleteByUserAndPost(User user, Post post);
    
    void deleteByPost(Post post);
}
