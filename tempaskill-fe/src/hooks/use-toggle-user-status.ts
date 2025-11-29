import apiClient from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ToggleStatusPayload {
  userId: number;
  suspend: boolean;
}

/**
 * Hook to toggle user status (Admin only)
 * suspend = true -> suspend user
 * suspend = false -> activate user
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, suspend }: ToggleStatusPayload) => {
      await apiClient.patch(`users/${userId}/status?suspend=${suspend}`);
    },
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
