import apiClient from './axios';

// Existing functions
export const getUserProfile = async (userId) => {
  console.log(`Making API request to /api/users/${userId}`);
  try {
    // Add a cache-busting timestamp to prevent browser caching
    const timestamp = new Date().getTime();
    const response = await apiClient.get(`/api/users/${userId}?_t=${timestamp}`);
    return response.data;
  } catch (error) {
    console.error('API Error in getUserProfile:', error);
    // Rethrow with more information for debugging
    throw new Error(`Failed to fetch user profile: ${error.message}`);
  }
};

export const getUserPosts = async (userId, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/posts/user/${userId}?page=${page}&size=${size}`);
  return response.data;
};

export const getUserLearningPlans = async (userId, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/learning-plans/user/${userId}?page=${page}&size=${size}`);
  return response.data;
};

export const updateUserProfile = async (userData) => {
  // Get the current user ID from the userData or from localStorage/context
  const userId = userData.id;
  if (!userId) {
    throw new Error('User ID is required for profile update');
  }
  
  const response = await apiClient.put(`/api/users/${userId}`, userData);
  return response.data;
};

export const uploadProfilePicture = async (formData) => {
  const response = await apiClient.post('/api/users/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Follow a user
export const followUser = async (userId) => {
  try {
    console.log(`Attempting to follow user with ID: ${userId}`);
    // Add cache-busting timestamp to ensure we're not getting cached responses
    const timestamp = new Date().getTime();
    const response = await apiClient.post(`/api/users/${userId}/follow?_t=${timestamp}`);
    console.log('Follow response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

// Unfollow a user
export const unfollowUser = async (userId) => {
  try {
    console.log(`Attempting to unfollow user with ID: ${userId}`);
    // Add cache-busting timestamp to ensure we're not getting cached responses
    const timestamp = new Date().getTime();
    const response = await apiClient.delete(`/api/users/${userId}/follow?_t=${timestamp}`);
    console.log('Unfollow response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
    }
    throw error;
  }
};

// Check follow status directly
export const checkFollowStatus = async (userId) => {
  try {
    console.log(`Checking follow status for user with ID: ${userId}`);
    const timestamp = new Date().getTime(); // Prevent caching
    const response = await apiClient.get(`/api/users/${userId}/follow/status?_t=${timestamp}`);
    console.log('Follow status response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error checking follow status:', error);
    throw error;
  }
};

// Get user's followers
export const getUserFollowers = async (userId, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}/followers?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error getting followers:', error);
    throw error;
  }
};

// Get users that a user is following
export const getUserFollowing = async (userId, page = 0, size = 10) => {
  try {
    const response = await apiClient.get(`/api/users/${userId}/following?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    console.error('Error getting following users:', error);
    throw error;
  }
};
