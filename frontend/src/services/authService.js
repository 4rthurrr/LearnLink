import api from './api';

const authService = {
    getCurrentUser: () => {
        return api.get('/auth/me');
    },
    
    handleOAuthRedirect: (token) => {
        localStorage.setItem('token', token);
        return api.get('/auth/me');
    },
    
    logout: () => {
        localStorage.removeItem('token');
    },
    
    register: (userData) => {
        return api.post('/auth/register', userData);
    },
    
    changePassword: (passwordData) => {
        return api.post('/auth/change-password', passwordData);
    }
};

export default authService;
