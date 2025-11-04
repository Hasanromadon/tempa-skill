import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiResponse,
  Course,
  CourseListQuery,
  CourseListResponse,
} from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// List courses with filters
export const useCourses = (params?: CourseListQuery) => {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CourseListResponse>>(
        API_ENDPOINTS.COURSES.LIST,
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
        API_ENDPOINTS.COURSES.DETAIL(slug)
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
        API_ENDPOINTS.COURSES.BY_ID(id)
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
      >(API_ENDPOINTS.COURSES.ENROLL(courseId));
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
        API_ENDPOINTS.COURSES.ENROLL(courseId)
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

// Create course (Admin/Instructor)
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      slug?: string;
      description: string;
      category: string;
      difficulty: string;
      price: number;
      thumbnail_url?: string;
      instructor_id: number;
    }) => {
      const response = await apiClient.post<ApiResponse<Course>>(
        API_ENDPOINTS.COURSES.CREATE,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

// Update course (Admin/Instructor)
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        title?: string;
        slug?: string;
        description?: string;
        category?: string;
        difficulty?: string;
        price?: number;
        thumbnail_url?: string;
      };
    }) => {
      const response = await apiClient.patch<ApiResponse<Course>>(
        API_ENDPOINTS.COURSES.UPDATE(id),
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
};

// Delete course (Admin only)
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.COURSES.DELETE(id)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

// Publish/Unpublish course (Admin/Instructor)
export const useTogglePublishCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isPublished,
    }: {
      id: number;
      isPublished: boolean;
    }) => {
      const response = await apiClient.put<ApiResponse<Course>>(
        API_ENDPOINTS.COURSES.UPDATE(id),
        { is_published: isPublished }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course"] });
    },
  });
};
