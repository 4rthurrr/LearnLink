package com.learnlink.repository;

import com.learnlink.model.LearningPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    
    Page<LearningPlan> findByUserId(Long userId, Pageable pageable);
    
    Page<LearningPlan> findByIsPublicTrue(Pageable pageable);
}
