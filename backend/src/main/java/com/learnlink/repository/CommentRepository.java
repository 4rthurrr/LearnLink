package com.learnlink.repository;

import com.learnlink.model.Comment;
import com.learnlink.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    Page<Comment> findByPostAndParentCommentIsNullOrderByCreatedAtDesc(Post post, Pageable pageable);
    
    List<Comment> findByParentCommentIdOrderByCreatedAtAsc(Long parentId);
    
    long countByPost(Post post);
    
    List<Comment> findByPost(Post post);
}
