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

@Configuration
@Profile("prod")
public class RailwayDatabaseConfig {
    private static final Logger logger = LoggerFactory.getLogger(RailwayDatabaseConfig.class);

    @Value("${MYSQLHOST:localhost}")
    private String host;

    @Value("${MYSQLPORT:3306}")
    private String port;

    @Value("${MYSQLDATABASE:railway}")
    private String database;

    @Value("${MYSQLUSER:root}")
    private String username;

    @Value("${MYSQL_ROOT_PASSWORD:}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Log the actual values being used (mask password)
        logger.info("Configuring MySQL connection with host: {}, port: {}, database: {}, username: {}", 
                    host, port, database, username);
        
        String url = String.format("jdbc:mysql://%s:%s/%s?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC&createDatabaseIfNotExist=true",
                                  host, port, database);
        
        logger.info("JDBC URL: {}", url.replaceAll("password=([^&]*)", "password=*****"));
        
        return DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName("com.mysql.cj.jdbc.Driver")
                .build();
    }
}
