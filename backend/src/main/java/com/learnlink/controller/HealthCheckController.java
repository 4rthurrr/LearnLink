package com.learnlink.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@RestController
@RequestMapping("/api/health")
public class HealthCheckController {

    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private DataSource dataSource;
    
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
        envInfo.put("MYSQLHOST", maskSensitiveInfo(System.getenv("MYSQLHOST")));
        envInfo.put("MYSQLPORT", System.getenv("MYSQLPORT"));
        envInfo.put("MYSQLDATABASE", System.getenv("MYSQLDATABASE"));
        
        // Add JVM information
        envInfo.put("java.version", System.getProperty("java.version"));
        envInfo.put("java.vendor", System.getProperty("java.vendor"));
        envInfo.put("os.name", System.getProperty("os.name"));
        envInfo.put("available_processors", String.valueOf(Runtime.getRuntime().availableProcessors()));
        envInfo.put("max_memory", formatMemory(Runtime.getRuntime().maxMemory()));
        envInfo.put("free_memory", formatMemory(Runtime.getRuntime().freeMemory()));
        
        health.put("environment", envInfo);
        
        try {
            // Test database connection
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            health.put("database", "UP");
            health.put("databaseTest", result == 1);
            
            // Get additional database metadata
            try (Connection conn = dataSource.getConnection()) {
                DatabaseMetaData metaData = conn.getMetaData();
                Map<String, String> dbInfo = new HashMap<>();
                dbInfo.put("database_product", metaData.getDatabaseProductName());
                dbInfo.put("database_version", metaData.getDatabaseProductVersion());
                dbInfo.put("driver_name", metaData.getDriverName());
                dbInfo.put("driver_version", metaData.getDriverVersion());
                dbInfo.put("url", maskSensitiveInfo(metaData.getURL()));
                health.put("databaseInfo", dbInfo);
            }
        } catch (Exception e) {
            health.put("database", "DOWN");
            health.put("error", e.getMessage());
            health.put("errorType", e.getClass().getName());
            
            // Add additional details about the error
            if (e.getCause() != null) {
                health.put("errorCause", e.getCause().getMessage());
                if (e.getCause().getCause() != null) {
                    health.put("errorRootCause", e.getCause().getCause().getMessage());
                }
            }
            
            // Add connection pool stats if available
            try {
                health.put("datasourceClass", dataSource.getClass().getName());
            } catch (Exception ex) {
                health.put("datasourceInfo", "Unavailable: " + ex.getMessage());
            }
        }
        
        return ResponseEntity.ok(health);
    }
    
    private String maskSensitiveInfo(String input) {
        if (input == null) return null;
        // Mask potentially sensitive information in connection strings
        if (input.contains("@")) {
            return input.replaceAll("//[^@]+@", "//****:****@");
        }
        return input;
    }
    
    private String formatMemory(long bytes) {
        return String.format("%.2f MB", bytes / (1024.0 * 1024.0));
    }
}
