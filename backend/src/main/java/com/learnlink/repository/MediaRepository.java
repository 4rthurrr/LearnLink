package com.learnlink.repository;

import com.learnlink.model.Media;
import com.learnlink.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByPost(Post post);
    
    void deleteByPost(Post post);
}
