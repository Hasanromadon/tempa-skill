import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, Lesson } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    staleTime: 0, // Always refetch on invalidation
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
    staleTime: 0, // Always refetch on invalidation
  });
};

// Create lesson
export const useCreateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      data,
    }: {
      courseId: number;
      data: {
        title: string;
        slug: string;
        content: string;
        order_index: number;
        duration: number;
        is_published: boolean;
      };
    }) => {
      const response = await apiClient.post<ApiResponse<Lesson>>(
        API_ENDPOINTS.LESSONS.CREATE(courseId),
        data
      );
      return response.data;
    },
    onSuccess: async (_, variables) => {
      // Use refetchQueries instead of invalidateQueries for immediate update
      await queryClient.refetchQueries({
        queryKey: ["lessons", variables.courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

// Update lesson
export const useUpdateLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<{
        title: string;
        slug: string;
        content: string;
        order_index: number;
        duration: number;
        is_published: boolean;
      }>;
    }) => {
      console.log(`📤 PATCH /lessons/${id}`, data);
      const response = await apiClient.patch<ApiResponse<Lesson>>(
        API_ENDPOINTS.LESSONS.UPDATE(id),
        data
      );
      console.log(`📥 Response:`, response.data.data);
      return response.data;
    },
    onSuccess: async (data) => {
      if (data.data) {
        console.log(`🔄 Refetching lessons for course ${data.data.course_id}`);
        // Use refetchQueries for immediate update
        await queryClient.refetchQueries({
          queryKey: ["lessons", data.data.course_id],
        });
        await queryClient.refetchQueries({
          queryKey: ["lesson", data.data.id],
        });
        console.log(`✅ Cache refreshed`);
      }
    },
  });
};

// Delete lesson
export const useDeleteLesson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(API_ENDPOINTS.LESSONS.DELETE(id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
