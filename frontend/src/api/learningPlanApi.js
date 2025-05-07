import apiClient from './axios';

export const getLearningPlans = async (page = 0, size = 10, cacheKey = '') => {
  console.log(`Fetching public learning plans page ${page}`);
  try {
    // Add cache-busting parameter to prevent browser/API caching
    const cacheParam = cacheKey ? `&_=${cacheKey}` : '';
    const response = await apiClient.get(`/api/learning-plans/public?page=${page}&size=${size}${cacheParam}`);
    console.log('Learning plans retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching learning plans:', error);
    throw error;
  }
};

export const getUserLearningPlans = async (userId, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/learning-plans/user/${userId}?page=${page}&size=${size}`);
  return response.data;
};

export const getLearningPlanById = async (planId) => {
  console.log(`Fetching learning plan with ID: ${planId}`);
  try {
    const response = await apiClient.get(`/api/learning-plans/${planId}`);
    console.log('Learning plan detail retrieved:', response.data);
    
    // Check if topics are included
    if (response.data && !response.data.topics) {
      console.warn('Learning plan does not contain topics array');
    } else {
      console.log(`Learning plan has ${response.data.topics.length} topics`);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching learning plan details:', error);
    throw error;
  }
};

export const createLearningPlan = async (planData) => {
  // DEBUGGING: Compare with what Postman would send
  console.log('Frontend LearningPlan payload:', JSON.stringify(planData, null, 2));
  
  const postmanExample = {
    "title": "Learn Spring Boot",
    "description": "A comprehensive plan to learn Spring Boot",
    "category": "PROGRAMMING",
    "isPublic": true,
    "estimatedDays": 30,
    "topics": [
      {
        "title": "Spring Boot Basics",
        "description": "Learn the basics of Spring Boot",
        "orderIndex": 0
      },
      {
        "title": "REST API Development",
        "description": "Learn how to build REST APIs",
        "orderIndex": 1
      }
    ]
  };
  
  console.log('Postman example payload:', JSON.stringify(postmanExample, null, 2));
  
  // First, try to send to our echo endpoint to debug
  try {
    const echoResponse = await apiClient.post('/api/debug/echo', planData);
    console.log('Echo response:', echoResponse.data);
  } catch (error) {
    console.log('Echo failed, continuing with actual request');
  }
  
  // Now, send the actual request
  try {
    const response = await apiClient.post('/api/learning-plans', planData);
    console.log('Learning plan created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating learning plan:', error.response?.data || error.message);
    throw error;
  }
};

export const updateLearningPlan = async (planId, planData) => {
  const response = await apiClient.put(`/api/learning-plans/${planId}`, planData);
  return response.data;
};

export const deleteLearningPlan = async (planId) => {
  const response = await apiClient.delete(`/api/learning-plans/${planId}`);
  return response.data;
};

export const addTopic = async (planId, topicData) => {
  const response = await apiClient.post(`/api/learning-plans/${planId}/topics`, topicData);
  return response.data;
};

export const updateTopic = async (planId, topicId, topicData) => {
  const response = await apiClient.put(`/api/learning-plans/${planId}/topics/${topicId}`, topicData);
  return response.data;
};

export const updateTopicStatus = async (planId, topicId, status) => {
  const response = await apiClient.patch(`/api/learning-plans/${planId}/topics/${topicId}/status?status=${status}`);
  return response.data;
};

export const updateResourceStatus = async (planId, topicId, resourceId, isCompleted) => {
  const response = await apiClient.patch(
    `/api/learning-plans/${planId}/topics/${topicId}/resources/${resourceId}/status?isCompleted=${isCompleted}`
  );
  return response.data;
};

export const addResource = async (planId, topicId, resourceData) => {
  const response = await apiClient.post(`/api/learning-plans/${planId}/topics/${topicId}/resources`, resourceData);
  return response.data;
};

export const uploadResourceFile = async (planId, topicId, formData, resourceId) => {
  // If resourceId is provided, add it to the formData
  if (resourceId) {
    formData.append('resourceId', resourceId);
  }
  
  const response = await apiClient.post(`/api/learning-plans/${planId}/topics/${topicId}/resources/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
