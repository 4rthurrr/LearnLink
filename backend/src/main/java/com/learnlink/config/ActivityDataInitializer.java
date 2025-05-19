package com.learnlink.config;

import com.learnlink.model.*;
import com.learnlink.repository.*;
import com.learnlink.service.UserActivityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!prod")
public class ActivityDataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final LearningPlanRepository learningPlanRepository;
    private final TopicRepository topicRepository;
    private final ResourceRepository resourceRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserActivityService userActivityService;
    private final Random random = new Random();    @Override
    public void run(ApplicationArguments args) {
        // Only generate activities if none exist yet
        long activityCount = userActivityService.countActivities();
        if (activityCount == 0) {
            log.info("Generating sample user activity data...");
            generateActivities();
            log.info("Sample user activity data generation complete.");
        } else {
            log.info("Skipping activity generation. Found {} existing activities.", activityCount);
        }
    }
    
    private void generateActivities() {
        // Get all users
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            log.info("No users found to generate activities for.");
            return;
        }
        
        // Generate activities for each user
        for (User user : users) {
            log.info("Generating activities for user: {}", user.getName());
              // Generate learning plan progress activities
            List<LearningPlan> learningPlans = learningPlanRepository.findByCreator(user, org.springframework.data.domain.PageRequest.of(0, 10)).getContent();
            if (!learningPlans.isEmpty()) {
                for (LearningPlan learningPlan : learningPlans) {
                    // Record learning plan progress 
                    int progressPercentage = random.nextInt(101); // 0-100%
                    userActivityService.recordLearningPlanProgress(user, learningPlan, progressPercentage);
                    
                    // Record topic completions
                    List<Topic> topics = topicRepository.findByLearningPlanId(learningPlan.getId());
                    if (!topics.isEmpty()) {
                        // Complete 1-3 random topics
                        int topicCompletions = random.nextInt(3) + 1;
                        for (int i = 0; i < topicCompletions && i < topics.size(); i++) {
                            userActivityService.recordTopicCompletion(user, learningPlan, topics.get(i));
                            
                            // Record resource completions for this topic
                            List<Resource> resources = resourceRepository.findByTopicId(topics.get(i).getId());
                            if (!resources.isEmpty()) {
                                // Complete 1-2 random resources
                                int resourceCompletions = random.nextInt(2) + 1;
                                for (int j = 0; j < resourceCompletions && j < resources.size(); j++) {
                                    userActivityService.recordResourceCompletion(user, learningPlan, topics.get(i), resources.get(j));
                                }
                            }
                        }
                    }
                }
            }
            
            // Generate social activities
            List<Post> posts = postRepository.findAll();
            if (!posts.isEmpty()) {
                // Like 1-5 random posts
                int postLikes = random.nextInt(5) + 1;
                for (int i = 0; i < postLikes && i < posts.size(); i++) {
                    // Avoid self-liking
                    if (!posts.get(i).getAuthor().getId().equals(user.getId())) {
                        userActivityService.recordPostLike(user, posts.get(i));
                    }
                }
                  // Comment on 1-3 random posts
                int postComments = random.nextInt(3) + 1;
                for (int i = 0; i < postComments && i < posts.size(); i++) {
                    // Create a comment object for the post
                    String[] realisticComments = {
                        "Great insights! This really helped me understand the topic better.",
                        "I've been looking for this information for a while. Thanks for sharing!",
                        "Very informative post. I'll definitely apply these concepts in my learning.",
                        "Interesting perspective. Have you considered exploring this aspect further?",
                        "This content is exactly what I needed for my current project. Thank you!"
                    };
                    String commentContent = realisticComments[random.nextInt(realisticComments.length)];
                    Comment comment = Comment.builder()
                            .content(commentContent)
                            .user(user)
                            .post(posts.get(i))
                            .build();
                    Comment savedComment = commentRepository.save(comment);
                    
                    userActivityService.recordPostComment(user, posts.get(i), savedComment);
                }
            }
        }
    }
}
