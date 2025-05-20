package com.learnlink.util;

import com.learnlink.model.*;
import com.learnlink.repository.*;
import com.learnlink.service.UserActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Order(5) // Run after other initializers
@Profile("dev") // Only run in development mode
public class ActivityDataGenerator implements CommandLineRunner {

    private final UserRepository userRepository;
    private final LearningPlanRepository learningPlanRepository;
    private final TopicRepository topicRepository;
    private final ResourceRepository resourceRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserActivityService userActivityService;
    
    private final Random random = new Random();
    
    @Override
    public void run(String... args) throws Exception {
        // Only generate data if there are users, plans, and posts
        List<User> users = userRepository.findAll();
        List<LearningPlan> learningPlans = learningPlanRepository.findAll();
        List<Post> posts = postRepository.findAll();
        
        if (users.isEmpty() || learningPlans.isEmpty() || posts.isEmpty()) {
            return;
        }
        
        System.out.println("Generating sample user activities...");
        
        // Generate learning plan progress activities
        for (LearningPlan learningPlan : learningPlans) {
            User user = learningPlan.getCreator();
            int progress = random.nextInt(101); // 0-100%
            
            userActivityService.recordLearningPlanProgress(user, learningPlan, progress);
        }
        
        // Generate topic completion activities
        List<Topic> topics = topicRepository.findAll();
        for (int i = 0; i < Math.min(10, topics.size()); i++) {
            Topic topic = topics.get(i);
            User user = topic.getLearningPlan().getCreator();
            
            userActivityService.recordTopicCompletion(user, topic.getLearningPlan(), topic);
        }
        
        // Generate resource completion activities
        List<Resource> resources = resourceRepository.findAll();
        for (int i = 0; i < Math.min(15, resources.size()); i++) {
            Resource resource = resources.get(i);
            Topic topic = resource.getTopic();
            LearningPlan learningPlan = topic.getLearningPlan();
            User user = learningPlan.getCreator();
            
            userActivityService.recordResourceCompletion(user, learningPlan, topic, resource);
        }
        
        // Generate post like activities
        for (int i = 0; i < Math.min(20, posts.size()); i++) {
            Post post = posts.get(i);
            User user = users.get(random.nextInt(users.size()));
            
            // Don't let users like their own posts for the sample data
            if (!user.getId().equals(post.getAuthor().getId())) {
                userActivityService.recordPostLike(user, post);
            }
        }
        
        // Generate post comment activities
        List<Comment> comments = commentRepository.findAll();
        for (int i = 0; i < Math.min(15, comments.size()); i++) {
            Comment comment = comments.get(i);
            Post post = comment.getPost();
            User user = comment.getUser();
            
            userActivityService.recordPostComment(user, post, comment);
        }
        
        System.out.println("Sample user activities generated successfully.");
    }
}
