import apiClient from './axios';

export const searchGlobal = async (query, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  return response.data;
};

export const searchUsers = async (query, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/search/users?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  return response.data;
};

export const searchPosts = async (query, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/search/posts?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  return response.data;
};

export const searchLearningPlans = async (query, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/search/learning-plans?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  return response.data;
};
