import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  ApiResponse,
  BalanceResponse,
  BankAccount,
  BankAccountsResponse,
  CreateBankAccountRequest,
  CreateWithdrawalRequest,
  WithdrawalRequest,
} from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Instructor hooks
export const useBalance = () => {
  return useQuery({
    queryKey: ["withdrawal", "balance"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<BalanceResponse>>(
        API_ENDPOINTS.WITHDRAWAL.BALANCE
      );
      return data.data!;
    },
  });
};

export const useWithdrawals = (status?: string) => {
  return useQuery({
    queryKey: ["withdrawals", status],
    queryFn: async () => {
      const { data } = await apiClient.get<
        ApiResponse<{ withdrawals: WithdrawalRequest[] }>
      >(API_ENDPOINTS.WITHDRAWAL.LIST, {
        params: { status },
      });
      return data.data!.withdrawals;
    },
  });
};

export const useWithdrawal = (id: number) => {
  return useQuery({
    queryKey: ["withdrawal", id],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<WithdrawalRequest>>(
        API_ENDPOINTS.WITHDRAWAL.DETAIL(id)
      );
      return data.data!;
    },
    enabled: !!id,
  });
};

export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: CreateWithdrawalRequest) => {
      const { data } = await apiClient.post<ApiResponse<WithdrawalRequest>>(
        API_ENDPOINTS.WITHDRAWAL.CREATE,
        req
      );
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawal", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
};

export const useBankAccount = () => {
  return useQuery({
    queryKey: ["bank-account"],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<BankAccountsResponse>>(
        API_ENDPOINTS.WITHDRAWAL.BANK_ACCOUNT
      );
      return data.data!;
    },
  });
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (req: CreateBankAccountRequest) => {
      const { data } = await apiClient.post<ApiResponse<BankAccount>>(
        API_ENDPOINTS.WITHDRAWAL.BANK_ACCOUNT,
        req
      );
      return data.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-account"] });
    },
  });
};

// Admin hooks
export const useAdminWithdrawals = (status?: string) => {
  return useQuery({
    queryKey: ["admin", "withdrawals", status],
    queryFn: async () => {
      const { data } = await apiClient.get<
        ApiResponse<{ withdrawals: WithdrawalRequest[] }>
      >(API_ENDPOINTS.WITHDRAWAL.ADMIN_LIST, {
        params: { status },
      });
      return data.data!.withdrawals;
    },
  });
};

export const useProcessWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: "completed" | "failed";
      notes?: string;
    }) => {
      await apiClient.put(API_ENDPOINTS.WITHDRAWAL.ADMIN_PROCESS(id), {
        status,
        notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawal"] });
    },
  });
};

export const useVerifyBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      verification_notes,
    }: {
      id: number;
      status: "verified" | "rejected";
      verification_notes?: string;
    }) => {
      await apiClient.put(API_ENDPOINTS.WITHDRAWAL.ADMIN_VERIFY_BANK(id), {
        status,
        verification_notes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-account"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "bank-accounts"] });
    },
  });
};
