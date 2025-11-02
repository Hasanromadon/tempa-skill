import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApiResponse, CourseProgress, UserProgress } from '@/types/api';

// Get course progress
export const useCourseProgress = (courseId: number) => {
  return useQuery({
    queryKey: ['courseProgress', courseId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CourseProgress>>(
        `/progress/courses/${courseId}`
      );
      return response.data.data;
    },
    enabled: !!courseId,
  });
};

// Get all user progress
export const useUserProgress = () => {
  return useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserProgress[]>>(
        '/progress/me'
      );
      return response.data.data || [];
    },
  });
};

// Mark lesson complete
export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      lessonId, 
      courseId 
    }: { 
      lessonId: number; 
      courseId: number;
    }) => {
      const response = await apiClient.post<ApiResponse<{ lesson_progress: unknown }>>(
        `/progress/lessons/${lessonId}/complete`,
        { course_id: courseId }
      );
      return response.data;
    },
    onMutate: async ({ lessonId, courseId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['courseProgress', courseId] });
      
      // Snapshot previous value
      const previousProgress = queryClient.getQueryData<CourseProgress>(['courseProgress', courseId]);
      
      // Optimistically update
      queryClient.setQueryData<CourseProgress>(['courseProgress', courseId], (old) => {
        if (!old) return old;
        return {
          ...old,
          completed_lessons: old.completed_lessons + 1,
          completed_lesson_ids: [...old.completed_lesson_ids, lessonId],
          progress_percentage: Math.round(
            ((old.completed_lessons + 1) / old.total_lessons) * 100
          ),
        };
      });
      
      return { previousProgress };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        queryClient.setQueryData(
          ['courseProgress', variables.courseId],
          context.previousProgress
        );
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: ['courseProgress', variables.courseId] 
      });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });
};
