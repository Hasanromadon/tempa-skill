import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

interface UserListQuery {
  page?: number;
  limit?: number;
  role?: "student" | "instructor" | "admin";
  search?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  status: "active" | "suspended";
  bio: string;
  avatar_url: string;
  created_at: string;
  enrolled_count?: number;
  completed_count?: number;
}

interface UserListResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export function useUsers(query: UserListQuery = {}) {
  return useQuery({
    queryKey: ["users", query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.page) params.append("page", query.page.toString());
      if (query.limit) params.append("limit", query.limit.toString());
      if (query.role) params.append("role", query.role);
      if (query.search) params.append("search", query.search);

      const response = await apiClient.get<ApiResponse<UserListResult>>(
        `users?${params.toString()}`
      );

      return response.data.data;
    },
  });
}
