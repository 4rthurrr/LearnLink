import apiClient from './axios';

// Get user activity (learning plan progress, likes, comments)
export const getUserActivity = async (userId, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}/activities?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

// Get user learning plan progress
export const getUserLearningProgress = async (userId, page = 0, size = 5) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}/learning-progress?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user learning progress:', error);
    throw error;
  }
};

// Get user social activity (likes, comments)
export const getUserSocialActivity = async (userId, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}/social-activity?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user social activity:', error);
    throw error;
  }
};
