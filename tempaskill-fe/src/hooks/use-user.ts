import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@/types/api";

// Get user by ID (public)
export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>(
        `/users/${userId}`
      );
      return response.data.data;
    },
    enabled: !!userId,
  });
};

// Update profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const response = await apiClient.patch<ApiResponse<User>>(
        "/users/me",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update current user cache
      if (data.data) {
        queryClient.setQueryData(["currentUser"], data.data);
      }
    },
  });
};

// Change password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await apiClient.put<ApiResponse<{ message: string }>>(
        "/users/me/password",
        data
      );
      return response.data;
    },
  });
};
