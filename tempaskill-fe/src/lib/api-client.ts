import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/types/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth-token";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse<never>>) => {
    // Handle unauthorized
    if (error.response?.status === 401) {
      removeAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
