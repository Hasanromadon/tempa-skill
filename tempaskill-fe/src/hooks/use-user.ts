import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiResponse,
  ChangePasswordRequest,
  UpdateProfileRequest,
  User,
  UserDashboardDetail,
} from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get user by ID (public)
export const useUser = (userId: number) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserDashboardDetail>>(
        API_ENDPOINTS.USERS.DETAIL(userId)
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
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
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
      const response = await apiClient.patch<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.USERS.CHANGE_PASSWORD,
        data
      );
      return response.data;
    },
  });
};
