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
  try {
    console.log(`Making PUT request to /api/posts/${postId}`, { postData });
    
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
    
    console.log('Update post response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    console.error('Error response:', error.response || 'No response data');
    throw error;
  }
};

export const deletePost = async (postId) => {
  try {
    console.log(`Making DELETE request to /api/posts/${postId}`);
    const response = await apiClient.delete(`/api/posts/${postId}`);
    console.log('Delete post response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    console.error('Error response:', error.response || 'No response data');
    throw error;
  }
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

export const updateComment = async (commentId, commentData) => {
  const response = await apiClient.put(`/api/comments/${commentId}`, commentData);
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await apiClient.delete(`/api/comments/${commentId}`);
  return response.data;
};
