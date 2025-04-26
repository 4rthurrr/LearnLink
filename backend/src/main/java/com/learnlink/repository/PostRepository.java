package com.learnlink.repository;

import com.learnlink.model.Post;
import com.learnlink.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    Page<Post> findByUserId(Long userId, Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.user IN :users ORDER BY p.createdAt DESC")
    Page<Post> findPostsByFollowing(@Param("users") List<User> followingUsers, Pageable pageable);
    
    @Query("SELECT p FROM Post p ORDER BY SIZE(p.likes) DESC, p.createdAt DESC")
    Page<Post> findTrendingPosts(Pageable pageable);
    
    @Query("SELECT p FROM Post p WHERE p.createdAt >= :date")
    List<Post> findPostsCreatedAfter(@Param("date") Date date);
    
    @Query("SELECT p FROM Post p WHERE p.content LIKE %:topic% OR p.title LIKE %:topic%")
    Page<Post> findByTopic(@Param("topic") String topic, Pageable pageable);
    
    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
        String title, String content, Pageable pageable);
}
