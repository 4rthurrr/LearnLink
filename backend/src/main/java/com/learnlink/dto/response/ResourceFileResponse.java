package com.learnlink.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceFileResponse {
    private boolean success;
    private String fileUrl;
    private String message;
}