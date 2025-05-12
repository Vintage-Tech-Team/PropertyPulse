import axios from "axios";

// Dynamic API base URL for different environments
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/api";

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to headers for authenticated requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle `Content-Type` for FormData if applicable
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Centralized error handling for responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error for debugging
    console.error("API Error:", error.response || error.message);

    // Custom error handling logic (e.g., unauthorized or server errors)
    if (error.response?.status === 401) {
      // Handle token expiration (e.g., redirect to login)
      localStorage.removeItem("token");
      window.location.href = "/login";
    } else if (error.response?.status >= 500) {
      console.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default api;
