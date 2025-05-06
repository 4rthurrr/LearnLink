package com.learnlink.dto.response;

import com.learnlink.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String profilePicture;
    private String location;
    private Date joinedDate;
    private int followersCount;
    private int followingCount;
    private boolean isCurrentUserFollowing;
    
    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .profilePicture(user.getProfilePicture())
                .location(user.getLocation())
                .joinedDate(user.getJoinedDate())
                // Default these to 0 as they might be calculated elsewhere
                .followersCount(0)
                .followingCount(0)
                .isCurrentUserFollowing(false)
                .build();
    }
}