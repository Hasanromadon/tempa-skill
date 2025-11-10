import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type { ApiResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export interface PaymentTransaction {
  order_id: string;
  gross_amount: number;
  payment_type: string;
  transaction_status:
    | "pending"
    | "settlement"
    | "cancel"
    | "expire"
    | "failure";
  transaction_time: string;
  settlement_time?: string;
  payment_url?: string;
  course_id: number;
  course_title: string;
  user_id: number;
  user_name: string;
}

export interface CreatePaymentRequest {
  course_id: number;
  payment_method?: "gopay" | "bank_transfer" | "credit_card" | "qris";
}

// Create payment transaction
export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (data: CreatePaymentRequest) => {
      const response = await apiClient.post<ApiResponse<PaymentTransaction>>(
        API_ENDPOINTS.PAYMENT.CREATE_TRANSACTION,
        data
      );
      return response.data.data;
    },
  });
};

// Check payment status
export const usePaymentStatus = (orderId: string) => {
  return useQuery({
    queryKey: ["paymentStatus", orderId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaymentTransaction>>(
        API_ENDPOINTS.PAYMENT.CHECK_STATUS(orderId)
      );
      return response.data.data;
    },
    enabled: !!orderId,
    refetchInterval: (query) => {
      // Stop polling if payment is completed or failed
      const status = query.state.data?.transaction_status;
      if (
        status === "settlement" ||
        status === "cancel" ||
        status === "expire" ||
        status === "failure"
      ) {
        return false;
      }
      // Poll every 5 seconds for pending payments
      return 5000;
    },
  });
};

// Get user payment history
export const usePaymentHistory = () => {
  return useQuery({
    queryKey: ["paymentHistory"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<PaymentTransaction[]>>(
        "/payment/history"
      );
      return response.data.data || [];
    },
  });
};
