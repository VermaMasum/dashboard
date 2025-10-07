import axios from "axios";

// ========================================
// BACKEND API CONFIGURATION
// ========================================
// Option 1: Set environment variable (RECOMMENDED)
// Create .env.local file with: NEXT_PUBLIC_API_URL=your_backend_url
//
// Option 2: Edit PRODUCTION_API_URL below for your deployed backend
// ========================================

// Backend URL - Change this to your actual backend server URL
const PRODUCTION_API_URL = "http://3.111.194.111:5000/api"; // Your backend server IP

// Determine API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL;

const axiosServices = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Always log the API URL for debugging
console.log("🔗 API Base URL:", API_URL);
console.log("🌍 Environment:", process.env.NODE_ENV || "development");
console.log("🔍 NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
console.log("🔍 PRODUCTION_API_URL:", PRODUCTION_API_URL);

// Request interceptor to add auth token
axiosServices.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error("❌ API Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });

    // Handle network errors
    if (!error.response) {
      console.error("❌ Network Error: Cannot connect to backend at", API_URL);
      return Promise.reject({
        message: `Cannot connect to backend server at ${API_URL}. Please check if backend is running.`
      });
    }

    // Handle 401 errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      console.log("⚠️ Token expired or invalid");
    }

    // Return the error response or default message
    return Promise.reject(
      error.response?.data || {
        message: error.message || "Unknown API error",
      }
    );
  }
);

export default axiosServices;
