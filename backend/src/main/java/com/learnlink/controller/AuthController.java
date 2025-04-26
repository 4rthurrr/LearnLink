package com.learnlink.controller;

import com.learnlink.dto.ApiResponse;
import com.learnlink.dto.UserDto;
import com.learnlink.security.CurrentUser;
import com.learnlink.security.UserPrincipal;
import com.learnlink.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@CurrentUser UserPrincipal userPrincipal) {
        UserDto userDto = userService.getUserById(userPrincipal.getId());
        return ResponseEntity.ok(userDto);
    }
}
