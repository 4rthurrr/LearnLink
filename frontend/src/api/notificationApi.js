import apiClient from './axios';

// Get all notifications with optional unreadOnly filter
export const getNotifications = async (unreadOnly = false, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/notifications?unreadOnly=${unreadOnly}&page=${page}&size=${size}`);
  return response.data;
};

// Get count of unread notifications
export const getUnreadCount = async () => {
  const response = await apiClient.get('/api/notifications/unread/count');
  return response.data;
};

// Mark a specific notification as read
export const markAsRead = async (notificationId) => {
  const response = await apiClient.patch(`/api/notifications/${notificationId}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await apiClient.patch('/api/notifications/read-all');
  return response.data;
};