package com.learnlink.repository;

import com.learnlink.model.Post;
import com.learnlink.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByAuthorOrderByCreatedAtDesc(User author, Pageable pageable);
    
    Page<Post> findByCategoryOrderByCreatedAtDesc(Post.Category category, Pageable pageable);
    
    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCaseOrderByCreatedAtDesc(
        String titleKeyword, String contentKeyword, Pageable pageable);
    
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    List<Post> findByAuthorId(Long authorId);
}
