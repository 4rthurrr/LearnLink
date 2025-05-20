package com.learnlink.repository;

import com.learnlink.model.Follow;
import com.learnlink.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Long> {
    Optional<Follow> findByFollowerAndFollowing(User follower, User following);
    
    Page<Follow> findByFollower(User follower, Pageable pageable);
    
    Page<Follow> findByFollowing(User following, Pageable pageable);
    
    boolean existsByFollowerAndFollowing(User follower, User following);
    
    long countByFollower(User follower);
    
    long countByFollowing(User following);
    
    void deleteByFollowerAndFollowing(User follower, User following);
    
    default Page<Follow> findFollowersByFollowing(User following, Pageable pageable) {
        return findByFollowing(following, pageable);
    }
    
    default Page<Follow> findFollowingByFollower(User follower, Pageable pageable) {
        return findByFollower(follower, pageable);
    }
}
