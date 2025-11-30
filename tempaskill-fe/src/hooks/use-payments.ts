/**
 * React Query hooks for payment operations
 */

import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  PaymentListQuery,
  PaymentListResponse,
  PaymentResponse,
  PaymentStatsResponse,
} from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Fetch payments with role-based filtering
 * - Admin: sees all payments
 * - Instructor: sees settlement from their courses
 * - Student: sees their own payments
 */
export const usePayments = (query: PaymentListQuery = {}) => {
  return useQuery({
    queryKey: ["payments", query],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (query.page) params.append("page", query.page.toString());
      if (query.limit) params.append("limit", query.limit.toString());
      if (query.search) params.append("search", query.search);
      if (query.status) params.append("status", query.status);
      if (query.course_id)
        params.append("course_id", query.course_id.toString());
      if (query.sort_by) params.append("sort_by", query.sort_by);
      if (query.sort_order) params.append("sort_order", query.sort_order);

      const response = await apiClient.get<PaymentListResponse>(
        `${API_ENDPOINTS.PAYMENT.LIST}?${params.toString()}`
      );
      return response.data;
    },
  });
};

/**
 * Fetch payment statistics with role-based calculations
 * - Admin: total revenue, pending amount, total transactions
 * - Instructor: settlement revenue only, total transactions
 * - Student: total spent
 */
export const usePaymentStats = () => {
  return useQuery({
    queryKey: ["payment-stats"],
    queryFn: async () => {
      const response = await apiClient.get<PaymentStatsResponse>(
        API_ENDPOINTS.PAYMENT.STATS
      );
      return response.data;
    },
  });
};

/**
 * Create a payment transaction (Student only)
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      course_id: number;
      payment_method?: string;
    }): Promise<PaymentResponse> => {
      const response = await apiClient.post<{ data: PaymentResponse }>(
        API_ENDPOINTS.PAYMENT.CREATE_TRANSACTION,
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate payment queries
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
  });
};

/**
 * Check payment status by order ID
 */
export const usePaymentStatus = (orderId: string | null) => {
  return useQuery({
    queryKey: ["payment-status", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");

      const response = await apiClient.get(
        API_ENDPOINTS.PAYMENT.CHECK_STATUS(orderId)
      );
      return response.data;
    },
    enabled: !!orderId, // Only run if orderId exists
  });
};
