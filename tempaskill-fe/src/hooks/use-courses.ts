import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  ApiResponse,
  Course,
  CourseListQuery,
  CourseListResponse,
} from "@/types/api";

// List courses with filters
export const useCourses = (params?: CourseListQuery) => {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CourseListResponse>>(
        "/courses",
        { params }
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get course by slug
export const useCourse = (slug: string) => {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Course>>(
        `/courses/slug/${slug}`
      );
      return response.data.data;
    },
    enabled: !!slug,
  });
};

// Get course by ID
export const useCourseById = (id: number) => {
  return useQuery({
    queryKey: ["course", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Course>>(
        `/courses/${id}`
      );
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Enroll in course
export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      const response = await apiClient.post<
        ApiResponse<{ enrollment: unknown }>
      >(`/courses/${courseId}/enroll`);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate courses to refresh enrollment status
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] }); // ADDED: Invalidate dashboard data
    },
  });
};

// Unenroll from course
export const useUnenrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        `/courses/${courseId}/enroll`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] }); // ADDED: Invalidate dashboard data
    },
  });
};
