import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { setAuthToken, removeAuthToken, getAuthToken } from "@/lib/auth-token";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/api";

// Register mutation
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/register",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        setAuthToken(data.data.token);
        queryClient.setQueryData(["currentUser"], data.data.user);
      }
    },
  });
};

// Login mutation
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        setAuthToken(data.data.token);
        queryClient.setQueryData(["currentUser"], data.data.user);
      }
    },
  });
};

// Logout function
export const useLogout = () => {
  const queryClient = useQueryClient();

  return () => {
    removeAuthToken();
    queryClient.setQueryData(["currentUser"], null);
    queryClient.clear();
    window.location.href = "/login";
  };
};

// Get current user query
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return null;

      const response = await apiClient.get<ApiResponse<User>>("/auth/me");
      return response.data.data || null;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Check if user is authenticated
export const useIsAuthenticated = () => {
  const { data: user, isLoading } = useCurrentUser();
  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
};
