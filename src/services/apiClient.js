import axios from "axios";
import { getToken, removeToken } from "./storage";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3005/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { response } = error;

    if (response?.status === 401) {
      removeToken();
      window.location.href = "/login";
    }

    // Format error response
    const errorMessage =
      response?.data?.err ||
      response?.data?.message ||
      error.message ||
      "An unexpected error occurred";

    return Promise.reject({
      status: response?.status,
      message: errorMessage,
      data: response?.data,
    });
  }
);

export default apiClient;
