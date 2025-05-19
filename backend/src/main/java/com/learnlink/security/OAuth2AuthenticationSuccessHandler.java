package com.learnlink.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Value("${app.oauth2.redirectUri:http://localhost:3000/oauth2/redirect}")
    private String redirectUri;
    
    private final JwtTokenProvider tokenProvider;
    
    @Override    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) 
            throws IOException, ServletException {
        try {
            log.info("OAuth2 authentication successful for user: {}", 
                authentication.getName());
                
            String targetUrl = determineTargetUrl(request, response, authentication);

            if (response.isCommitted()) {
                logger.debug("Response has already been committed. Unable to redirect to " + targetUrl);
                return;
            }            clearAuthenticationAttributes(request);
            getRedirectStrategy().sendRedirect(request, response, targetUrl);
        } catch (Exception e) {
            log.error("Error during OAuth2 authentication success handling", e);
            // Try to recover by redirecting to frontend with error
            String errorRedirect = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("error", "Authentication error: " + e.getMessage())
                .build().toUriString();
            getRedirectStrategy().sendRedirect(request, response, errorRedirect);
        }
    }    @Override    protected String determineTargetUrl(HttpServletRequest request, 
                                     HttpServletResponse response, 
                                     Authentication authentication) {
        try {
            String token = tokenProvider.generateToken(authentication);
            return UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("token", token)
                    .build().toUriString();
        } catch (Exception e) {
            log.error("Error generating authentication token", e);
            return UriComponentsBuilder.fromUriString(redirectUri)
                    .queryParam("error", "Error generating authentication token: " + e.getMessage())
                    .build().toUriString();
        }
    }
}
