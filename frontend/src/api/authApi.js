import apiClient from './axios';

export const login = async (credentials) => {
  const response = await apiClient.post('/api/auth/login', credentials);
  return response.data;
};

export const signup = async (userData) => {
  const response = await apiClient.post('/api/auth/signup', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get('/api/auth/me');
  return response.data;
};
