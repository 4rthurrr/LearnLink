package com.learnlink.service;

import com.learnlink.dto.PostCreateDto;
import com.learnlink.dto.PostDto;
import com.learnlink.dto.TopicDto;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Post;
import com.learnlink.model.User;
import com.learnlink.repository.CommentRepository;
import com.learnlink.repository.LikeRepository;
import com.learnlink.repository.PostRepository;
import com.learnlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private LikeRepository likeRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private NotificationService notificationService;

    public Page<PostDto> getAllPosts(Pageable pageable, Long currentUserId) {
        Page<Post> posts = postRepository.findAll(pageable);
        List<PostDto> postDtos = posts.getContent().stream()
                .map(post -> mapPostToDto(post, currentUserId))
                .collect(Collectors.toList());
        
        return new PageImpl<>(postDtos, pageable, posts.getTotalElements());
    }
    
    public Page<PostDto> getFeedPosts(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
                
        List<User> following = new ArrayList<>(user.getFollowing());
        if (following.isEmpty()) {
            return getAllPosts(pageable, userId);
        }
        
        Page<Post> posts = postRepository.findPostsByFollowing(following, pageable);
        List<PostDto> postDtos = posts.getContent().stream()
                .map(post -> mapPostToDto(post, userId))
                .collect(Collectors.toList());
        
        return new PageImpl<>(postDtos, pageable, posts.getTotalElements());
    }

    public PostDto getPostById(Long id, Long currentUserId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
                
        return mapPostToDto(post, currentUserId);
    }

    @Transactional
    public PostDto createPost(PostCreateDto postCreateDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Post post = new Post();
        post.setTitle(postCreateDto.getTitle());
        post.setContent(postCreateDto.getContent());
        post.setMediaUrls(postCreateDto.getMediaUrls());
        post.setPostType(postCreateDto.getPostType());
        post.setUser(user);

        Post savedPost = postRepository.save(post);
        return mapPostToDto(savedPost, userId);
    }

    @Transactional
    public PostDto updatePost(Long id, PostCreateDto postUpdateDto, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
                
        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to update this post");
        }

        post.setTitle(postUpdateDto.getTitle());
        post.setContent(postUpdateDto.getContent());
        post.setMediaUrls(postUpdateDto.getMediaUrls());
        post.setPostType(postUpdateDto.getPostType());

        Post updatedPost = postRepository.save(post);
        return mapPostToDto(updatedPost, userId);
    }

    @Transactional
    public void deletePost(Long id, Long userId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", id));
                
        if (!post.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to delete this post");
        }

        postRepository.delete(post);
    }
    
    private PostDto mapPostToDto(Post post, Long currentUserId) {
        boolean liked = currentUserId != null && likeRepository.existsByPostIdAndUserId(post.getId(), currentUserId);
        int likeCount = (int) likeRepository.countByPostId(post.getId());
        int commentCount = (int) commentRepository.countByPostId(post.getId());
        
        return PostDto.fromEntity(post, liked, likeCount, commentCount);
    }
    
    public List<TopicDto> getTrendingTopics() {
        // Get posts from the last 7 days
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, -7);
        
        List<Post> recentPosts = postRepository.findPostsCreatedAfter(calendar.getTime());
        
        // Extract topics/hashtags from post content
        Map<String, Integer> topicCounts = new HashMap<>();
        Pattern hashtagPattern = Pattern.compile("#(\\w+)");
        
        for (Post post : recentPosts) {
            // Count likes for weighting
            int weight = post.getLikes().size() + 1;
            
            // Extract hashtags from title and content
            Matcher titleMatcher = hashtagPattern.matcher(post.getTitle());
            while (titleMatcher.find()) {
                String topic = titleMatcher.group(1).toLowerCase();
                topicCounts.put(topic, topicCounts.getOrDefault(topic, 0) + weight);
            }
            
            Matcher contentMatcher = hashtagPattern.matcher(post.getContent());
            while (contentMatcher.find()) {
                String topic = contentMatcher.group(1).toLowerCase();
                topicCounts.put(topic, topicCounts.getOrDefault(topic, 0) + weight);
            }
        }
        
        // Sort topics by count and return top 10
        return topicCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(10)
                .map(entry -> new TopicDto(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    public Page<PostDto> getPostsByTopic(String topic, Pageable pageable, Long currentUserId) {
        Page<Post> posts = postRepository.findByTopic("#" + topic, pageable);
        
        List<PostDto> postDtos = posts.getContent().stream()
                .map(post -> mapPostToDto(post, currentUserId))
                .collect(Collectors.toList());
        
        return new PageImpl<>(postDtos, pageable, posts.getTotalElements());
    }

    public Page<PostDto> searchPosts(String query, Pageable pageable, Long currentUserId) {
        Page<Post> posts = postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            query, query, pageable);
        
        List<PostDto> postDtos = posts.getContent().stream()
                .map(post -> mapPostToDto(post, currentUserId))
                .collect(Collectors.toList());
        
        return new PageImpl<>(postDtos, pageable, posts.getTotalElements());
    }
}
