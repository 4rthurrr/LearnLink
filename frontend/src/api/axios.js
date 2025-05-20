import axios from 'axios';

// Use different base URL for production vs development
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 
                   (isProduction ? 'https://learnlink-production.up.railway.app' : 'http://localhost:8080');

console.log('API base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add a request interceptor to include the auth token in all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only handle 401 errors in non-activity endpoints to prevent automatic logout
    if (error.response && error.response.status === 401) {
      // Check if the request was for an activity, analytics or other non-critical endpoint
      const nonCriticalEndpoints = [
        '/activities',
        '/learning-progress',
        '/social-activity',
        '/analytics',
        '/api/users/'
      ];
      
      // Check if URL contains any of the non-critical endpoints
      const isNonCriticalEndpoint = nonCriticalEndpoints.some(endpoint => 
        error.config.url.includes(endpoint)
      );
      
      // Also check for specific user activity endpoints
      const activityPattern = /\/api\/users\/\d+\/(activities|learning-progress|social-activity)/;
      const isUserActivityEndpoint = activityPattern.test(error.config.url);
      
      // If it's a critical endpoint (not in our list of non-critical ones),
      // then trigger logout
      if (!isNonCriticalEndpoint && !isUserActivityEndpoint) {
        console.warn('Authentication error in critical endpoint. Logging out.');
        localStorage.removeItem('authToken');
        window.location.href = '/login?expired=true';
      } else {
        console.warn('Authentication error in non-critical endpoint. Continuing without logout.');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
