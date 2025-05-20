package com.learnlink.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String profilePicture;
    private String bio;
    private String location;
    private Date joinedDate;
    private long followersCount;
    private long followingCount;
    private boolean isCurrentUserFollowing;
}
