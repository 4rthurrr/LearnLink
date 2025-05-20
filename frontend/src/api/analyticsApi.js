import apiClient from './axios';

// Get learning analytics data for the current user
export const getUserAnalytics = async () => {
  const response = await apiClient.get('/api/analytics/user');
  return response.data;
};

// Get learning plan completion rate by category
export const getLearningPlanAnalyticsByCategory = async () => {
  const response = await apiClient.get('/api/analytics/learning-plans/categories');
  return response.data;
};

// Get daily activity data (study time, resources completed, etc.)
export const getDailyActivityStats = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await apiClient.get(`/api/analytics/activity?${params}`);
  return response.data;
};

// Get learning plans progress over time
export const getLearningProgressTimeline = async (learningPlanId = null) => {
  const params = new URLSearchParams();
  if (learningPlanId) params.append('learningPlanId', learningPlanId);
  
  const response = await apiClient.get(`/api/analytics/progress/timeline?${params}`);
  return response.data;
};

// Get aggregate statistics about learning plans
export const getLearningPlanStats = async () => {
  const response = await apiClient.get('/api/analytics/learning-plans/stats');
  return response.data;
};

// Get time spent data per learning plan
export const getTimeSpentAnalytics = async () => {
  const response = await apiClient.get('/api/analytics/time-spent');
  return response.data;
};