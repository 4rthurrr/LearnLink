package com.learnlink.service;

import com.learnlink.dto.request.CommentRequest;
import com.learnlink.dto.response.CommentResponse;
import com.learnlink.exception.ResourceNotFoundException;
import com.learnlink.model.Comment;
import com.learnlink.model.Notification;
import com.learnlink.model.Post;
import com.learnlink.model.User;
import com.learnlink.repository.CommentRepository;
import com.learnlink.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserService userService;
    private final NotificationService notificationService;
    
    @Transactional
    public CommentResponse createComment(Long postId, CommentRequest commentRequest, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        Comment comment = Comment.builder()
                .content(commentRequest.getContent())
                .user(currentUser)
                .post(post)
                .build();
        
        if (commentRequest.getParentCommentId() != null) {
            Comment parentComment = commentRepository.findById(commentRequest.getParentCommentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentRequest.getParentCommentId()));
            
            if (!parentComment.getPost().getId().equals(postId)) {
                throw new IllegalArgumentException("Parent comment does not belong to the specified post");
            }
            
            comment.setParentComment(parentComment);
            
            // Create notification for parent comment author (if not the same user)
            if (!parentComment.getUser().getId().equals(currentUser.getId())) {
                notificationService.createNotification(
                        parentComment.getUser(),
                        currentUser,
                        Notification.NotificationType.COMMENT,
                        currentUser.getName() + " replied to your comment",
                        "comment",
                        parentComment.getId()
                );
            }
        } else {
            // Create notification for post author (if not the same user)
            if (!post.getAuthor().getId().equals(currentUser.getId())) {
                notificationService.createNotification(
                        post.getAuthor(),
                        currentUser,
                        Notification.NotificationType.COMMENT,
                        currentUser.getName() + " commented on your post",
                        "post",
                        post.getId()
                );
            }
        }
        
        Comment savedComment = commentRepository.save(comment);
        
        return mapToCommentResponse(savedComment);
    }
    
    public Page<CommentResponse> getCommentsByPost(Long postId, Pageable pageable) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        Page<Comment> rootComments = commentRepository.findByPostAndParentCommentIsNullOrderByCreatedAtDesc(post, pageable);
        
        return rootComments.map(comment -> {
            CommentResponse response = mapToCommentResponse(comment);
            List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
            response.setReplies(replies.stream()
                    .map(this::mapToCommentResponse)
                    .collect(Collectors.toList()));
            return response;
        });
    }
    
    public CommentResponse getComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        
        CommentResponse response = mapToCommentResponse(comment);
        
        if (comment.getParentComment() == null) {
            List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
            response.setReplies(replies.stream()
                    .map(this::mapToCommentResponse)
                    .collect(Collectors.toList()));
        } else {
            response.setReplies(new ArrayList<>());
        }
        
        return response;
    }
    
    @Transactional
    public CommentResponse updateComment(Long commentId, CommentRequest commentRequest, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        
        if (!comment.getUser().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to update this comment");
        }
        
        comment.setContent(commentRequest.getContent());
        Comment updatedComment = commentRepository.save(comment);
        
        CommentResponse response = mapToCommentResponse(updatedComment);
        
        if (comment.getParentComment() == null) {
            List<Comment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
            response.setReplies(replies.stream()
                    .map(this::mapToCommentResponse)
                    .collect(Collectors.toList()));
        } else {
            response.setReplies(new ArrayList<>());
        }
        
        return response;
    }
    
    @Transactional
    public void deleteComment(Long commentId, String currentUserEmail) {
        User currentUser = userService.getCurrentUser(currentUserEmail);
        
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", commentId));
        
        if (!comment.getUser().getId().equals(currentUser.getId()) && 
            !comment.getPost().getAuthor().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("You don't have permission to delete this comment");
        }
        
        commentRepository.delete(comment);
    }
    
    @Transactional
    public void deleteAllCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        // Find all comments associated with this post
        List<Comment> commentsToDelete = commentRepository.findByPost(post);
        
        // Delete all the comments
        commentRepository.deleteAll(commentsToDelete);
    }
    
    public long countCommentsByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
        
        return commentRepository.countByPost(post);
    }
    
    private CommentResponse mapToCommentResponse(Comment comment) {
        CommentResponse.UserSummaryResponse userResponse = CommentResponse.UserSummaryResponse.builder()
                .id(comment.getUser().getId())
                .name(comment.getUser().getName())
                .profilePicture(comment.getUser().getProfilePicture())
                .build();
        
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .user(userResponse)
                .postId(comment.getPost().getId())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .replies(new ArrayList<>())
                .build();
    }
}
