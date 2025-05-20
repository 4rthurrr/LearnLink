package com.learnlink.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> errorDetails = new HashMap<>();
        HttpStatus status = getStatus(request);
        
        // Extract more detailed error information
        String message = (String) request.getAttribute("jakarta.servlet.error.message");
        String errorPath = (String) request.getAttribute("jakarta.servlet.error.request_uri");
        
        errorDetails.put("status", status.value());
        errorDetails.put("error", status.getReasonPhrase());        errorDetails.put("message", message != null ? message : "An error occurred. Please check server logs for details.");
        errorDetails.put("path", errorPath != null ? errorPath : request.getRequestURI());
        
        // Log the error for debugging
        log.error("Error occurred: {} - {} for path: {}", status.value(), status.getReasonPhrase(), errorPath);
        
        return new ResponseEntity<>(errorDetails, status);
    }
    
    private HttpStatus getStatus(HttpServletRequest request) {
        Integer statusCode = (Integer) request.getAttribute("jakarta.servlet.error.status_code");
        if (statusCode == null) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        try {
            return HttpStatus.valueOf(statusCode);
        } catch (Exception ex) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
    }
}
