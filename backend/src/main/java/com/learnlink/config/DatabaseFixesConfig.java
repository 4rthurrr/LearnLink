package com.learnlink.config;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

/**
 * Configuration to fix database constraints at application startup
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DatabaseFixesConfig {

    @PersistenceContext
    private EntityManager entityManager;
    
    /**
     * Apply database fixes at startup
     */
    @Bean
    public CommandLineRunner fixDatabaseConstraints() {
        return args -> {
            log.info("Applying database constraint fixes...");
            try {
                applyFixForUserActivitiesConstraint();
                log.info("Database constraint fixes applied successfully");
            } catch (Exception e) {
                log.error("Error applying database fixes: {}", e.getMessage(), e);
            }
        };
    }
    
    @Transactional
    public void applyFixForUserActivitiesConstraint() {
        log.info("Applying fix for user_activities foreign key constraint...");
        
        try {
            // Check if the constraint exists before trying to drop it
            entityManager.createNativeQuery(
                    "SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS " +
                    "WHERE CONSTRAINT_NAME = 'FK9typpph89m1hxq80vq7uov5ig' " +
                    "AND TABLE_NAME = 'user_activities'"
            ).getSingleResult();
            
            // If we get here, the constraint exists, so we can drop it
            entityManager.createNativeQuery(
                    "ALTER TABLE user_activities " +
                    "DROP FOREIGN KEY FK9typpph89m1hxq80vq7uov5ig"
            ).executeUpdate();
            
            log.info("Successfully dropped old constraint");
        } catch (Exception e) {
            log.warn("Constraint FK9typpph89m1hxq80vq7uov5ig might not exist: {}", e.getMessage());
        }
        
        try {
            // Create the new foreign key with CASCADE DELETE
            entityManager.createNativeQuery(
                    "ALTER TABLE user_activities " +
                    "ADD CONSTRAINT FK_POST_USER_ACTIVITY " +
                    "FOREIGN KEY (post_id) " +
                    "REFERENCES posts(id) " +
                    "ON DELETE CASCADE"
            ).executeUpdate();
            
            log.info("Successfully added new CASCADE constraint");
        } catch (Exception e) {
            log.error("Error adding CASCADE constraint: {}", e.getMessage());
        }
    }
}
