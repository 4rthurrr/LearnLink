package com.learnlink.repository;

import com.learnlink.model.Resource;
import com.learnlink.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    
    List<Resource> findByTopic(Topic topic);
      long countByTopic(Topic topic);
    
    long countByTopicAndIsCompleted(Topic topic, Boolean isCompleted);
    
    List<Resource> findByTopicId(Long topicId);
}
