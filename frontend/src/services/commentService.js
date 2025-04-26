import api from './api';

const commentService = {
    getCommentsByPost: (postId, page = 0, size = 10) => {
        return api.get(`/posts/${postId}/comments?page=${page}&size=${size}`);
    },
    
    createComment: (postId, content) => {
        return api.post(`/posts/${postId}/comments`, { content });
    },
    
    updateComment: (postId, commentId, content) => {
        return api.put(`/posts/${postId}/comments/${commentId}`, { content });
    },
    
    deleteComment: (postId, commentId) => {
        return api.delete(`/posts/${postId}/comments/${commentId}`);
    }
};

export default commentService;
