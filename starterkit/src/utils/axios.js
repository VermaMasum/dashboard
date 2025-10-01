import axios from 'axios';

// Use your PC's IP address for mobile/network access
// Change this IP if your PC's IP address changes
const API_URL = 'http://192.168.1.26:5000/api';

const axiosServices = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Log the API URL in development mode for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 API Base URL:', API_URL);
}

// Add request interceptor to include auth token
axiosServices.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
 
// interceptor for http
axiosServices.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 errors by redirecting to login
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect here to avoid infinite loops
        console.log('Token expired or invalid');
      }
      return Promise.reject((error.response && error.response.data) || 'Wrong Services');
    }
);
 
export default axiosServices;
 