import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity_type?: string;
  entity_id?: number;
  description?: string;
  ip_address?: string;
  created_at: string;
}

/**
 * Hook: useUserActivities
 *
 * Fetch user activity logs (last login, course access, etc.)
 *
 * @param userId - User ID
 * @param limit - Number of activities to fetch (default: 20)
 */
export const useUserActivities = (userId: number, limit: number = 20) => {
  return useQuery<ActivityLog[]>({
    queryKey: ["user-activities", userId, limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ActivityLog[]>>(
        `/users/${userId}/activities`,
        {
          params: { limit },
        }
      );
      return response.data.data || [];
    },
    enabled: !!userId,
  });
};

/**
 * Hook: useRecentActivities (Admin only)
 *
 * Fetch recent activities across all users
 *
 * @param limit - Number of activities to fetch (default: 50)
 */
export const useRecentActivities = (limit: number = 50) => {
  return useQuery<ActivityLog[]>({
    queryKey: ["recent-activities", limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ActivityLog[]>>(
        `/admin/activities`,
        {
          params: { limit },
        }
      );
      return response.data.data || [];
    },
  });
};
