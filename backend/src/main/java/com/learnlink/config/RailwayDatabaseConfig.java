package com.learnlink.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Configuration
@Profile("prod")
public class RailwayDatabaseConfig {
    private static final Logger logger = LoggerFactory.getLogger(RailwayDatabaseConfig.class);

    @Value("${MYSQL_URL:}")
    private String mysqlUrl;

    @Value("${MYSQLDATABASE:railway}")
    private String database;

    @Value("${MYSQLHOST:localhost}")
    private String host;

    @Value("${MYSQLPORT:3306}")
    private String port;

    @Value("${MYSQLUSER:root}")
    private String username;

    @Value("${MYSQLPASSWORD:}")
    private String password;

    @Value("${MYSQL_ROOT_PASSWORD:}")
    private String rootPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        logger.info("Configuring Railway database connection");
        
        // First try with MYSQL_URL in jdbc format
        String jdbcUrl = buildJdbcUrl();
        logger.info("Using JDBC URL: {}", maskPassword(jdbcUrl));
        
        return DataSourceBuilder.create()
                .url(jdbcUrl)
                .username(username)
                .password(password.isEmpty() ? rootPassword : password)
                .driverClassName("com.mysql.cj.jdbc.Driver")
                .build();
    }
    
    private String buildJdbcUrl() {
        // Try to use MYSQL_URL if it's already in JDBC format
        if (mysqlUrl.startsWith("jdbc:")) {
            return mysqlUrl;
        }
        
        // Try to convert MYSQL_URL from mysql:// format to jdbc format if present
        if (!mysqlUrl.isEmpty() && mysqlUrl.startsWith("mysql://")) {
            // Parse the MySQL URL pattern: mysql://user:pass@host:port/db
            Pattern pattern = Pattern.compile("mysql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)");
            Matcher matcher = pattern.matcher(mysqlUrl);
            if (matcher.matches()) {
                String extractedHost = matcher.group(3);
                String extractedPort = matcher.group(4);
                String extractedDb = matcher.group(5);
                
                logger.info("Extracted from MYSQL_URL - host: {}, port: {}, database: {}", 
                           extractedHost, extractedPort, extractedDb);
                
                return String.format("jdbc:mysql://%s:%s/%s?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC",
                                    extractedHost, extractedPort, extractedDb);
            }
        }
        
        // Fall back to individual components
        logger.info("Building JDBC URL from components - host: {}, port: {}, database: {}", 
                   host, port, database);
        
        return String.format("jdbc:mysql://%s:%s/%s?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC",
                            host, port, database);
    }
    
    private String maskPassword(String url) {
        // Mask password in the URL for logging
        return url.replaceAll("password=([^&]*)", "password=*****")
                  .replaceAll("://[^:]*:([^@]*)@", "://[masked-user]:[masked-password]@");
    }
}
