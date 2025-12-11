import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export interface UserCertificate {
  id: number;
  course_title: string;
  issued_at: string;
  certificate_url?: string;
}

export const useUserCertificates = (userId: number) => {
  return useQuery<UserCertificate[]>({
    queryKey: ["user-certificates", userId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserCertificate[]>>(
        `/users/${userId}/certificates`
      );
      return response.data.data || [];
    },
    enabled: !!userId,
  });
};
