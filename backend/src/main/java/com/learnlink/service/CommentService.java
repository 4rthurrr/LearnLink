package com.learnlink.service;

import com.learnlink.dto.CommentDto;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Comment;
import com.learnlink.model.NotificationType;
import com.learnlink.model.Post;
import com.learnlink.model.User;
import com.learnlink.repository.CommentRepository;
import com.learnlink.repository.PostRepository;
import com.learnlink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private NotificationService notificationService;

    public Page<CommentDto> getCommentsByPostId(Long postId, Pageable pageable) {
        Page<Comment> comments = commentRepository.findByPostId(postId, pageable);
        List<CommentDto> commentDtos = comments.getContent().stream()
                .map(CommentDto::fromEntity)
                .collect(Collectors.toList());
                
        return new PageImpl<>(commentDtos, pageable, comments.getTotalElements());
    }

    @Transactional
    public CommentDto createComment(Long postId, String content, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setUser(user);
        comment.setPost(post);

        Comment savedComment = commentRepository.save(comment);
        
        // Send notification to post creator if different from commenter
        if (!post.getUser().getId().equals(userId)) {
            String notificationContent = user.getName() + " commented on your post";
            notificationService.createNotification(
                post.getUser().getId(),
                NotificationType.COMMENT,
                notificationContent,
                "/post/" + postId
            );
        }

        return CommentDto.fromEntity(savedComment);
    }

    @Transactional
    public CommentDto updateComment(Long commentId, String content, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to update this comment");
        }

        comment.setContent(content);
        Comment updatedComment = commentRepository.save(comment);

        return CommentDto.fromEntity(updatedComment);
    }

    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));

        if (!comment.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have permission to delete this comment");
        }

        commentRepository.delete(comment);
    }
}
