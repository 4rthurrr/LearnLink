import apiClient from './axios';

export const getPosts = async (page = 0, size = 10) => {
  const response = await apiClient.get(`/api/posts?page=${page}&size=${size}`);
  return response.data;
};

export const getPostById = async (postId) => {
  const response = await apiClient.get(`/api/posts/${postId}`);
  return response.data;
};

export const getUserPosts = async (userId, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/posts/user/${userId}?page=${page}&size=${size}`);
  return response.data;
};

export const createPost = async (postData, files) => {
  const formData = new FormData();
  
  // Convert the post data to JSON string and append to form
  const postBlob = new Blob([JSON.stringify(postData)], {
    type: 'application/json'
  });
  formData.append('post', postBlob);
  
  // Append files if any
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }

  const response = await apiClient.post('/api/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updatePost = async (postId, postData, files) => {
  const formData = new FormData();
  
  const postBlob = new Blob([JSON.stringify(postData)], {
    type: 'application/json'
  });
  formData.append('post', postBlob);
  
  if (files && files.length > 0) {
    files.forEach(file => {
      formData.append('files', file);
    });
  }

  const response = await apiClient.put(`/api/posts/${postId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await apiClient.delete(`/api/posts/${postId}`);
  return response.data;
};

export const toggleLike = async (postId) => {
  const response = await apiClient.post(`/api/posts/${postId}/like`);
  return response.data;
};

export const getComments = async (postId, page = 0, size = 10) => {
  const response = await apiClient.get(`/api/posts/${postId}/comments?page=${page}&size=${size}`);
  return response.data;
};

export const addComment = async (postId, commentData) => {
  const response = await apiClient.post(`/api/posts/${postId}/comments`, commentData);
  return response.data;
};
