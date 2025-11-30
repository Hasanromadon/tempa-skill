import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse, InstructorStudentsResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

interface UseInstructorStudentsParams {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: number;
}

export const useInstructorStudents = (params?: UseInstructorStudentsParams) => {
  return useQuery({
    queryKey: ["instructor-students", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<InstructorStudentsResponse>>(
        API_ENDPOINTS.INSTRUCTOR.STUDENTS,
        { params }
      );
      return response.data.data;
    },
  });
};
