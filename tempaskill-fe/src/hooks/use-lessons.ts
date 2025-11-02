import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { ApiResponse, Lesson } from "@/types/api";

// Get lessons for a course
export const useCourseLessons = (courseId: number) => {
  return useQuery({
    queryKey: ["lessons", courseId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Lesson[]>>(
        `/courses/${courseId}/lessons`
      );
      return response.data.data || [];
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single lesson
export const useLesson = (courseId: number, lessonId: number) => {
  return useQuery({
    queryKey: ["lesson", courseId, lessonId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Lesson>>(
        `/courses/${courseId}/lessons/${lessonId}`
      );
      return response.data.data;
    },
    enabled: !!courseId && !!lessonId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
