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
  // DEBUGGING: Log the payload for resources
  console.log('Frontend LearningPlan payload:', JSON.stringify(planData, null, 2));
  
  // Log specific check for resources in payload
  if (planData.topics) {
    planData.topics.forEach((topic, i) => {
      if (topic.resources) {
        console.log(`Topic ${i} (${topic.title}) has ${topic.resources.length} resources in payload:`, 
          JSON.stringify(topic.resources, null, 2));
      } else {
        console.warn(`Topic ${i} (${topic.title}) has no resources array in payload`);
      }
    });
  }
  
  // Now, send the actual request
  try {
    const response = await apiClient.post('/api/learning-plans', planData);
    console.log('Learning plan created successfully:', response.data);
    
    // Check if the response includes topics and resources
    if (response.data.topics) {
      response.data.topics.forEach((topic, i) => {
        if (topic.resources) {
          console.log(`RESPONSE: Topic ${i} (${topic.title}) has ${topic.resources.length} resources`);
        } else {
          console.warn(`RESPONSE: Topic ${i} (${topic.title}) missing resources array!`);
        }
      });
    } else {
      console.warn('RESPONSE: Learning plan response does not include topics array!');
    }
    
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
  try {
    console.log(`Updating topic status for plan ${planId}, topic ${topicId} to ${status}`);
    const response = await apiClient.patch(
      `/api/learning-plans/${planId}/topics/${topicId}/user-progress?status=${status}`
    );
    console.log('Topic status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating topic status:', error.response?.data || error.message);
    throw error;
  }
};

export const updateResourceStatus = async (planId, topicId, resourceId, isCompleted) => {
  try {
    console.log(`Updating resource status for plan ${planId}, topic ${topicId}, resource ${resourceId} to ${isCompleted}`);
    const response = await apiClient.patch(
      `/api/learning-plans/${planId}/topics/${topicId}/resources/${resourceId}/user-progress?isCompleted=${isCompleted}`
    );
    console.log('Resource status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating resource status:', error.response?.data || error.message);
    throw error;
  }
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
