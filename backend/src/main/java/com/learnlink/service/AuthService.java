package com.learnlink.service;

import com.learnlink.dto.request.LoginRequest;
import com.learnlink.dto.request.SignUpRequest;
import com.learnlink.dto.response.JwtAuthenticationResponse;
import com.learnlink.exception.BadRequestException;
import com.learnlink.model.User;
import com.learnlink.repository.UserRepository;
import com.learnlink.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public JwtAuthenticationResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        return JwtAuthenticationResponse.of(jwt);
    }

    public JwtAuthenticationResponse registerUser(SignUpRequest signUpRequest) {
        if(userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new BadRequestException("Email address already in use.");
        }

        // Creating user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .provider(User.AuthProvider.LOCAL)
                .enabled(true)
                .active(true) // Explicitly setting active field to true
                .roles(new HashSet<>())
                .build();
        
        user.getRoles().add(User.Role.USER);

        userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        signUpRequest.getEmail(),
                        signUpRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);
        
        return JwtAuthenticationResponse.of(jwt);
    }
}
