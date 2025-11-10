import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiResponse,
  CourseReviewSummary,
  CreateReviewRequest,
  Review,
  ReviewListQuery,
  ReviewListResponse,
  UpdateReviewRequest,
} from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook for fetching reviews with pagination and filters
export const useReviews = (params?: ReviewListQuery) => {
  return useQuery({
    queryKey: ["reviews", params],
    queryFn: async (): Promise<ReviewListResponse> => {
      const response = await apiClient.get<ApiResponse<ReviewListResponse>>(
        API_ENDPOINTS.REVIEWS.LIST,
        { params }
      );
      return response.data.data!;
    },
    enabled: true,
  });
};

// Hook for fetching reviews for a specific course
export const useCourseReviews = (
  courseId: number,
  params?: Omit<ReviewListQuery, "course_id">
) => {
  return useQuery({
    queryKey: ["course-reviews", courseId, params],
    queryFn: async (): Promise<ReviewListResponse> => {
      const response = await apiClient.get<ApiResponse<ReviewListResponse>>(
        API_ENDPOINTS.REVIEWS.BY_COURSE(courseId),
        { params }
      );
      return response.data.data!;
    },
    enabled: !!courseId,
  });
};

// Hook for fetching review summary for a course
export const useCourseReviewSummary = (courseId: number) => {
  return useQuery({
    queryKey: ["course-review-summary", courseId],
    queryFn: async (): Promise<CourseReviewSummary> => {
      const response = await apiClient.get<ApiResponse<CourseReviewSummary>>(
        API_ENDPOINTS.REVIEWS.COURSE_SUMMARY(courseId)
      );
      return response.data.data!;
    },
    enabled: !!courseId,
  });
};

// Hook for fetching user's reviews
export const useUserReviews = (params?: Omit<ReviewListQuery, "user_id">) => {
  return useQuery({
    queryKey: ["user-reviews", params],
    queryFn: async (): Promise<ReviewListResponse> => {
      const response = await apiClient.get<ApiResponse<ReviewListResponse>>(
        API_ENDPOINTS.REVIEWS.BY_USER,
        { params }
      );
      return response.data.data!;
    },
  });
};

// Hook for fetching a single review
export const useReview = (reviewId: number) => {
  return useQuery({
    queryKey: ["review", reviewId],
    queryFn: async (): Promise<Review> => {
      const response = await apiClient.get<ApiResponse<Review>>(
        API_ENDPOINTS.REVIEWS.DETAIL(reviewId)
      );
      return response.data.data!;
    },
    enabled: !!reviewId,
  });
};

// Hook for creating a review
export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReviewRequest): Promise<Review> => {
      const response = await apiClient.post<ApiResponse<Review>>(
        API_ENDPOINTS.REVIEWS.CREATE,
        data
      );
      return response.data.data!;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["course-reviews", data.course_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["course-review-summary", data.course_id],
      });
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

// Hook for updating a review
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      data,
    }: {
      reviewId: number;
      data: UpdateReviewRequest;
    }): Promise<Review> => {
      const response = await apiClient.put<ApiResponse<Review>>(
        API_ENDPOINTS.REVIEWS.UPDATE(reviewId),
        data
      );
      return response.data.data!;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["course-reviews", data.course_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["course-review-summary", data.course_id],
      });
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", data.id] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

// Hook for deleting a review
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: number): Promise<void> => {
      await apiClient.delete(API_ENDPOINTS.REVIEWS.DELETE(reviewId));
    },
    onSuccess: (_, reviewId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["user-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["review", reviewId] });
      // Note: We can't easily know which course this review belonged to,
      // so we invalidate all course review queries
      queryClient.invalidateQueries({ queryKey: ["course-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["course-review-summary"] });
    },
  });
};
