import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { AdminDashboardStats, ApiResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook untuk fetch dashboard statistics dari endpoint dedicated
 *
 * Menggunakan endpoint /api/v1/admin/stats yang melakukan aggregation
 * di backend untuk performa optimal
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AdminDashboardStats>>(
        API_ENDPOINTS.ADMIN.STATS
      );

      if (!response.data.data) {
        throw new Error("No data received from admin stats endpoint");
      }

      return response.data.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - stats tidak perlu terlalu realtime
    refetchOnWindowFocus: true, // Refetch saat user kembali ke tab
  });
}
