import apiClient from "@/lib/api-client";
import type { ApiResponse, Course, User } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  total_courses: number;
  total_students: number;
  active_courses: number;
  total_revenue: number;
}

interface CoursesResponse {
  courses: Course[];
  pagination?: {
    total: number;
    total_pages: number;
  };
}

interface UsersResponse {
  users: User[];
  pagination?: {
    total: number;
    total_pages: number;
  };
}

/**
 * Hook untuk fetch dashboard statistics
 *
 * Mengambil data dari berbagai endpoint dan menggabungkannya
 * untuk ditampilkan di admin dashboard
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      try {
        // Fetch courses untuk total courses dan active courses
        const coursesResponse = await apiClient.get<
          ApiResponse<CoursesResponse>
        >("/api/v1/courses");

        const courses = coursesResponse.data.data?.courses || [];
        const totalCourses = courses.length;
        const activeCourses = courses.filter(
          (course) => course.is_published
        ).length;

        // Fetch users untuk total students
        // Jika endpoint users belum ada, gunakan hardcoded dulu
        let totalStudents = 0;
        try {
          const usersResponse = await apiClient.get<ApiResponse<UsersResponse>>(
            "/api/v1/users"
          );
          const users = usersResponse.data.data?.users || [];
          totalStudents = users.filter(
            (user) => user.role === "student"
          ).length;
        } catch (error) {
          // Endpoint users belum ada, gunakan 0 atau fallback
          console.warn("Users endpoint not available:", error);
        }

        // Fetch enrollments untuk total revenue (jika ada endpoint)
        // Untuk sekarang gunakan 0
        const totalRevenue = 0;

        const stats: DashboardStats = {
          total_courses: totalCourses,
          total_students: totalStudents,
          active_courses: activeCourses,
          total_revenue: totalRevenue,
        };

        return stats;
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - stats tidak perlu terlalu realtime
    refetchOnWindowFocus: true, // Refetch saat user kembali ke tab
  });
}
