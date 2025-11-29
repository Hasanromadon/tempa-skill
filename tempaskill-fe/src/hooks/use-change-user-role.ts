import apiClient from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ChangeRolePayload {
  userId: number;
  role: "student" | "instructor" | "admin";
}

/**
 * Hook to change user role (Admin only)
 */
export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: ChangeRolePayload) => {
      await apiClient.patch(`users/${userId}/role`, { role });
    },
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
