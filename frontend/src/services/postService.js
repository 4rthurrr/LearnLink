import api from './api';

const postService = {
    getPosts: (page = 0, size = 10) => {
        return api.get(`/posts?page=${page}&size=${size}`);
    },
    
    getFeedPosts: (page = 0, size = 10) => {
        return api.get(`/posts/feed?page=${page}&size=${size}`);
    },
    
    getPostById: (id) => {
        return api.get(`/posts/${id}`);
    },
    
    getUserPosts: (userId, page = 0, size = 10) => {
        return api.get(`/users/${userId}/posts?page=${page}&size=${size}`);
    },
    
    createPost: (postData) => {
        return api.post('/posts', postData);
    },
    
    updatePost: (id, postData) => {
        return api.put(`/posts/${id}`, postData);
    },
    
    deletePost: (id) => {
        return api.delete(`/posts/${id}`);
    },
    
    likePost: (id) => {
        return api.post(`/posts/${id}/likes`);
    },
    
    getLikeStatus: (id) => {
        return api.get(`/posts/${id}/likes/status`);
    },
    
    getTrendingTopics: () => {
        return api.get('/posts/trending-topics');
    },
    
    getPostsByTopic: (topic, page = 0, size = 10) => {
        return api.get(`/posts/topics/${topic}?page=${page}&size=${size}`);
    },
    
    searchPosts: (query, page = 0, size = 10) => {
        return api.get(`/posts/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
    }
};

export default postService;
