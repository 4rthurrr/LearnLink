package com.learnlink.repository;

import com.learnlink.model.LearningPlan;
import com.learnlink.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    
    Page<LearningPlan> findByCreator(User creator, Pageable pageable);
    
    @Query("SELECT lp FROM LearningPlan lp WHERE lp.isPublic = true AND lp.creator.id <> :userId")
    Page<LearningPlan> findPublicLearningPlans(@Param("userId") Long userId, Pageable pageable);
    
    Page<LearningPlan> findByCategoryAndIsPublic(LearningPlan.Category category, Boolean isPublic, Pageable pageable);
    
    Page<LearningPlan> findByCreatorAndIsPublic(User creator, Boolean isPublic, Pageable pageable);
    
    @Query("SELECT lp FROM LearningPlan lp WHERE (lp.isPublic = true OR lp.creator.id = :userId) AND " +
           "(LOWER(lp.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(lp.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<LearningPlan> searchLearningPlans(@Param("keyword") String keyword, @Param("userId") Long userId, Pageable pageable);

    Page<LearningPlan> findByIsPublicTrue(Pageable pageable);
}
