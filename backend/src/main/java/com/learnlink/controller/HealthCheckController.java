package com.learnlink.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @GetMapping
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("time", System.currentTimeMillis());
        health.put("profile", activeProfile);
        
        // Add environment information
        Map<String, String> envInfo = new HashMap<>();
        envInfo.put("MYSQLHOST", System.getenv("MYSQLHOST"));
        envInfo.put("MYSQLPORT", System.getenv("MYSQLPORT"));
        envInfo.put("MYSQLDATABASE", System.getenv("MYSQLDATABASE"));
        envInfo.put("DATABASE_URL", System.getenv("DATABASE_URL"));
        health.put("environment", envInfo);
        
        try {
            // Test database connection
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            health.put("database", "UP");
            health.put("databaseTest", result == 1);
        } catch (Exception e) {
            health.put("database", "DOWN");
            health.put("error", e.getMessage());
            health.put("errorType", e.getClass().getName());
            
            // Add additional details about the error
            if (e.getCause() != null) {
                health.put("errorCause", e.getCause().getMessage());
            }
        }
        
        return ResponseEntity.ok(health);
    }
}
