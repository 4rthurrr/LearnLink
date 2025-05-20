// Mock activity data for development purposes
// This will be used when the backend API calls fail

export const mockLearningProgress = {
  content: [
    {
      id: 'mock-lp-1',
      type: 'LEARNING_PROGRESS',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      user: {
        id: 7,
        name: 'Shanuka Amantha',
        profilePicture: 'https://via.placeholder.com/150'
      },
      learningPlan: {
        id: 1,
        title: 'Introduction to React'
      },
      progressPercentage: 45
    },
    {
      id: 'mock-tc-1',
      type: 'TOPIC_COMPLETED',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      user: {
        id: 7,
        name: 'Shanuka Amantha',
        profilePicture: 'https://via.placeholder.com/150'
      },
      topicTitle: 'React Basics',
      learningPlan: {
        id: 1,
        title: 'Introduction to React'
      }
    },
    {
      id: 'mock-rc-1',
      type: 'RESOURCE_COMPLETED',
      timestamp: new Date(Date.now() - 259200000).toISOString(),
      user: {
        id: 7,
        name: 'Shanuka Amantha',
        profilePicture: 'https://via.placeholder.com/150'
      },
      resourceTitle: 'React Components Tutorial',
      topicTitle: 'React Components'
    }
  ]
};

export const mockSocialActivity = {
  content: [
    {
      id: 'mock-pl-1',
      type: 'POST_LIKE',
      timestamp: new Date(Date.now() - 129600000).toISOString(),
      user: {
        id: 7,
        name: 'Shanuka Amantha',
        profilePicture: 'https://via.placeholder.com/150'
      },
      post: {
        id: 2,
        title: 'Understanding React Hooks'
      }
    },
    {
      id: 'mock-pc-1',
      type: 'POST_COMMENT',
      timestamp: new Date(Date.now() - 345600000).toISOString(),
      user: {
        id: 7,
        name: 'Shanuka Amantha',
        profilePicture: 'https://via.placeholder.com/150'
      },
      post: {
        id: 3,
        title: 'CSS Grid Layout Tips'
      },
      comment: 'This was really helpful, thanks for sharing!'
    },
    {
      id: 'mock-fu-1',
      type: 'FOLLOW_USER',
      timestamp: new Date(Date.now() - 432000000).toISOString(),
      user: {
        id: 7,
        name: 'Shanuka Amantha',
        profilePicture: 'https://via.placeholder.com/150'
      },
      followedUser: {
        id: 5,
        name: 'John Doe',
        profilePicture: 'https://via.placeholder.com/150'
      }
    }
  ]
};

// Combined mock activity data
export const mockAllActivities = {
  content: [
    ...mockLearningProgress.content,
    ...mockSocialActivity.content
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
};
