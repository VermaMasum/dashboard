 import axios from 'axios';

const axiosServices = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
});

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
 