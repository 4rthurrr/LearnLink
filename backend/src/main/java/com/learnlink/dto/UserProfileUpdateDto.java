package com.learnlink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileUpdateDto {
    
    @Size(max = 50, message = "Name cannot exceed 50 characters")
    private String name;
    
    @Size(max = 500, message = "Bio cannot exceed 500 characters")
    private String bio;
    
    private String imageUrl;
}
