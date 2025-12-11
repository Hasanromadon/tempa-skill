import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export interface EnrolledCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string;
  progress_percentage: number;
  enrolled_at: string;
  last_accessed_at: string;
  completed_at: string | null;
}

export const useUserEnrolledCourses = (userId: number) => {
  return useQuery<EnrolledCourse[]>({
    queryKey: ["user-enrolled-courses", userId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<EnrolledCourse[]>>(
        `/users/${userId}/enrollments`
      );
      return response.data.data || [];
    },
    enabled: !!userId,
  });
};
