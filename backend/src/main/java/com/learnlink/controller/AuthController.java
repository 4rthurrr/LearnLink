package com.learnlink.controller;

import com.learnlink.dto.request.LoginRequest;
import com.learnlink.dto.request.SignUpRequest;
import com.learnlink.dto.response.ApiResponse;
import com.learnlink.dto.response.JwtAuthenticationResponse;
import com.learnlink.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<JwtAuthenticationResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(authService.authenticateUser(loginRequest));
    }

    @PostMapping("/signup")
    public ResponseEntity<JwtAuthenticationResponse> registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        return ResponseEntity.ok(authService.registerUser(signUpRequest));
    }
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> checkToken() {
        return ResponseEntity.ok(new ApiResponse(true, "Token is valid"));
    }
}
