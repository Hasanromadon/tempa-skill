import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, Lesson } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

// Get lessons for a course
export const useCourseLessons = (courseId: number) => {
  return useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Lesson[]>>(
        API_ENDPOINTS.COURSES.LESSONS(courseId)
      );
      return response.data.data || [];
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single lesson
export const useLesson = (lessonId: number) => {
  return useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Lesson>>(
        API_ENDPOINTS.LESSONS.DETAIL(lessonId)
      );
      return response.data.data;
    },
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
