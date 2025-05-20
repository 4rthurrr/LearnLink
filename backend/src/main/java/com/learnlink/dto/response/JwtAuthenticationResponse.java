package com.learnlink.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType;
    
    public static JwtAuthenticationResponse of(String accessToken) {
        return JwtAuthenticationResponse.builder()
                .accessToken(accessToken)
                .tokenType("Bearer")
                .build();
    }
}
