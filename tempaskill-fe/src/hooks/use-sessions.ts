import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiResponse,
  CreateSessionRequest,
  Session,
  SessionListQuery,
  SessionListResponse,
  SessionParticipant,
  UpdateSessionRequest,
} from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// List sessions with filters
export const useSessions = (params?: SessionListQuery) => {
  return useQuery({
    queryKey: ["sessions", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SessionListResponse>>(
        API_ENDPOINTS.SESSIONS.LIST,
        { params }
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get session by ID
export const useSession = (id: number) => {
  return useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Session>>(
        API_ENDPOINTS.SESSIONS.DETAIL(id)
      );
      return response.data.data;
    },
    enabled: !!id,
  });
};

// Create session (Instructor/Admin)
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSessionRequest) => {
      const response = await apiClient.post<ApiResponse<Session>>(
        API_ENDPOINTS.SESSIONS.CREATE,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

// Update session (Instructor/Admin)
export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: UpdateSessionRequest;
    }) => {
      const response = await apiClient.put<ApiResponse<Session>>(
        API_ENDPOINTS.SESSIONS.UPDATE(id),
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

// Delete session (Instructor/Admin)
export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.SESSIONS.DELETE(id)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
};

// Register for session
export const useRegisterForSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.SESSIONS.REGISTER(sessionId)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

// Unregister from session
export const useUnregisterFromSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: number) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.SESSIONS.UNREGISTER(sessionId)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
};

// Get session participants (Instructor only)
export const useSessionParticipants = (sessionId: number) => {
  return useQuery({
    queryKey: ["session-participants", sessionId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SessionParticipant[]>>(
        API_ENDPOINTS.SESSIONS.PARTICIPANTS(sessionId)
      );
      return response.data.data;
    },
    enabled: !!sessionId,
  });
};

// Mark attendance (Instructor only)
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      participantId,
    }: {
      sessionId: number;
      participantId: number;
    }) => {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.SESSIONS.MARK_ATTENDANCE(sessionId, participantId)
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-participants"] });
    },
  });
};
