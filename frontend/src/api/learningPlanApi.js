import apiClient from './axios';

export const getLearningPlans = async (page = 0, size = 10) => {
  const response = await apiClient.get(`/api/learning-plans/public?page=${page}&size=${size}`);
  return response.data;
};

export const getUserLearningPlans = async (userId, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/learning-plans/user/${userId}?page=${page}&size=${size}`);
  return response.data;
};

export const getLearningPlanById = async (planId) => {
  const response = await apiClient.get(`/api/learning-plans/${planId}`);
  return response.data;
};

export const createLearningPlan = async (planData) => {
  const response = await apiClient.post('/api/learning-plans', planData);
  return response.data;
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
