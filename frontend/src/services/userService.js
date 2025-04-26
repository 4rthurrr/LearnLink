import api from './api';

const userService = {
  getUserById: (id) => {
    return api.get(`/users/${id}`);
  },
  
  getCurrentUser: () => {
    return api.get('/users/me');
  },
  
  updateProfile: (id, userData) => {
    return api.put(`/users/${id}`, userData);
  },
  
  deleteAccount: (id) => {
    return api.delete(`/users/${id}`);
  },
  
  getFollowers: (userId, page = 0, size = 10) => {
    return api.get(`/users/${userId}/followers?page=${page}&size=${size}`);
  },
  
  getFollowing: (userId, page = 0, size = 10) => {
    return api.get(`/users/${userId}/following?page=${page}&size=${size}`);
  },
  
  toggleFollow: (userId) => {
    return api.post(`/users/${userId}/follow`);
  },
  
  getFollowStatus: (userId) => {
    return api.get(`/users/${userId}/follow`);
  },
  
  getSuggestions: (limit = 5) => {
    return api.get(`/users/suggestions?limit=${limit}`);
  },
  
  searchUsers: (query, page = 0, size = 10) => {
    return api.get(`/users/search?query=${query}&page=${page}&size=${size}`);
  }
};

export default userService;
