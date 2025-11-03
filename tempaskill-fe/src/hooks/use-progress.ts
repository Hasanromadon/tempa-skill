import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiResponse,
  CourseProgress,
  UserProgressSummary,
} from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Get course progress
export const useCourseProgress = (courseId: number) => {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CourseProgress>>(
        API_ENDPOINTS.PROGRESS.COURSE(courseId)
      );
      return response.data.data;
    },
    enabled: !!courseId,
  });
};

// Get all user progress
export const useUserProgress = () => {
  return useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserProgressSummary>>(
        API_ENDPOINTS.PROGRESS.USER
      );
      // Backend returns { data: { courses: [...] } }
      // Extract the courses array
      return response.data.data?.courses || [];
    },
  });
};

// Mark lesson complete
export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      courseId,
    }: {
      lessonId: number;
      courseId: number;
    }) => {
      const response = await apiClient.post<
        ApiResponse<{ lesson_progress: unknown }>
      >(API_ENDPOINTS.PROGRESS.COMPLETE_LESSON(lessonId), {
        course_id: courseId,
      });
      return response.data;
    },
    onMutate: async ({ lessonId, courseId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ["courseProgress", courseId],
      });

      // Snapshot previous value
      const previousProgress = queryClient.getQueryData<CourseProgress>([
        "courseProgress",
        courseId,
      ]);

      // Optimistically update
      queryClient.setQueryData<CourseProgress>(
        ["courseProgress", courseId],
        (old) => {
          if (!old) return old;
          return {
            ...old,
            completed_lessons: old.completed_lessons + 1,
            completed_lesson_ids: [
              ...(old.completed_lesson_ids || []),
              lessonId,
            ],
            progress_percentage: Math.round(
              ((old.completed_lessons + 1) / old.total_lessons) * 100
            ),
          };
        }
      );

      return { previousProgress };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        queryClient.setQueryData(
          ["courseProgress", variables.courseId],
          context.previousProgress
        );
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: ["courseProgress", variables.courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });
};
