import { getAuthToken, removeAuthToken } from "@/lib/auth-token";
import { generateRequestId } from "@/lib/utils";
import type { ApiResponse } from "@/types/api";
import axios, { AxiosError } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token and request ID
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add unique request ID for tracing
    const requestId = generateRequestId();
    config.headers["X-Request-ID"] = requestId;

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${
          config.url
        } - RequestID: ${requestId}`
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === "development") {
      const requestId = response.config.headers["X-Request-ID"];
      console.log(
        `[API Response] ${
          response.status
        } ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - RequestID: ${requestId}`
      );
    }
    return response;
  },
  (error: AxiosError<ApiResponse<never>>) => {
    // Log error response in development
    if (process.env.NODE_ENV === "development") {
      const requestId = error.config?.headers?.["X-Request-ID"];
      console.error(
        `[API Error] ${
          error.response?.status || "NETWORK"
        } ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        } - RequestID: ${requestId}`,
        error.message
      );
    }

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
