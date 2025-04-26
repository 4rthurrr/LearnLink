package com.learnlink.dto;

import com.learnlink.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String name;
    private String imageUrl;

    public static UserSummaryDto fromUser(User user) {
        UserSummaryDto dto = new UserSummaryDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setImageUrl(user.getImageUrl());
        return dto;
    }
}
