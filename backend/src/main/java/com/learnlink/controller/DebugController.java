package com.learnlink.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private Environment env;
    
    @Autowired(required = false)
    private ClientRegistrationRepository clientRegistrationRepository;

    @GetMapping("/oauth2-config")
    public Map<String, Object> getOAuth2Config() {
        Map<String, Object> config = new HashMap<>();
        
        // Check if OAuth2 is configured
        config.put("oauth2ClientConfigured", clientRegistrationRepository != null);
        
        // Get OAuth2 redirect properties
        config.put("googleRedirectUri", env.getProperty("spring.security.oauth2.client.registration.google.redirect-uri"));
        config.put("appRedirectUri", env.getProperty("app.oauth2.redirectUri"));
        
        log.debug("OAuth2 config: {}", config);
        
        return config;
    }
}
