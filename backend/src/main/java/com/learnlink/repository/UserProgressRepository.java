package com.learnlink.repository;

import com.learnlink.model.LearningPlan;
import com.learnlink.model.User;
import com.learnlink.model.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    
    Optional<UserProgress> findByUserAndLearningPlan(User user, LearningPlan learningPlan);
    
    boolean existsByUserAndLearningPlan(User user, LearningPlan learningPlan);
}