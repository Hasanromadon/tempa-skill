"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import apiClient from "@/lib/api-client";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle,
  Clock,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BankAccount {
  id: number;
  user_id?: number;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  verification_status: "pending" | "verified" | "rejected";
  verified_at?: string;
  verified_by?: number;
  verification_notes?: string;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export default function BankAccountsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "verified" | "rejected"
  >("pending");
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    null
  );
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");

  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["admin", "bank-accounts", statusFilter],
    queryFn: async () => {
      const { data } = await apiClient.get(
        API_ENDPOINTS.WITHDRAWAL.ADMIN_BANK_ACCOUNTS,
        {
          params: {
            status: statusFilter === "all" ? "" : statusFilter,
          },
        }
      );
      return data.data.accounts as BankAccount[];
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      notes,
    }: {
      id: number;
      status: "verified" | "rejected";
      notes?: string;
    }) => {
      await apiClient.put(API_ENDPOINTS.WITHDRAWAL.ADMIN_VERIFY_BANK(id), {
        status,
        verification_notes: notes,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bank-accounts"] });
      toast.success(
        variables.status === "verified"
          ? "Rekening berhasil diverifikasi"
          : "Rekening ditolak"
      );
      setVerifyDialogOpen(false);
      setSelectedAccount(null);
      setVerificationNotes("");
      setActionType("approve");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Gagal memproses rekening");
    },
  });

  const filteredAccounts = accounts?.filter((account) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      account.user?.name?.toLowerCase().includes(searchLower) ||
      account.user?.email?.toLowerCase().includes(searchLower) ||
      account.bank_name.toLowerCase().includes(searchLower) ||
      account.account_number.includes(searchTerm) ||
      account.account_holder_name.toLowerCase().includes(searchLower)
    );
  });

  const stats = {
    total: accounts?.length || 0,
    verified:
      accounts?.filter((a) => a.verification_status === "verified").length || 0,
    pending:
      accounts?.filter((a) => a.verification_status === "pending").length || 0,
    rejected:
      accounts?.filter((a) => a.verification_status === "rejected").length || 0,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Validasi Rekening Bank</h1>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Rekening
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Terverifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.verified}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ditolak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-sm mb-2">Filter Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(
                  value: "all" | "pending" | "verified" | "rejected"
                ) => setStatusFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Terverifikasi</SelectItem>
                  <SelectItem value="rejected">Ditolak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grow">
              <Label className="text-sm mb-2">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama instruktur, email, bank, atau nomor rekening..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Accounts List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Rekening Bank</CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredAccounts || filteredAccounts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada rekening bank</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {account.user?.name || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {account.user?.email || "N/A"}
                        </p>
                      </div>
                      {account.verification_status === "verified" ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Terverifikasi
                        </Badge>
                      ) : account.verification_status === "rejected" ? (
                        <Badge className="bg-red-100 text-red-800">
                          <XCircle className="h-3 w-3 mr-1" />
                          Ditolak
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>

                    <div className="pl-13 space-y-1">
                      <div className="flex items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Bank: </span>
                          <span className="font-medium">
                            {account.bank_name}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">No. Rek: </span>
                          <span className="font-medium font-mono">
                            {account.account_number}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Atas Nama: </span>
                          <span className="font-medium">
                            {account.account_holder_name}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Terdaftar: {formatDate(account.created_at)}
                      </div>
                      {account.verification_status === "verified" &&
                        account.verified_at && (
                          <div className="text-xs text-gray-500">
                            Diverifikasi: {formatDate(account.verified_at)}
                          </div>
                        )}
                      {account.verification_status === "rejected" &&
                        account.verification_notes && (
                          <div className="text-xs text-red-600">
                            Alasan penolakan: {account.verification_notes}
                          </div>
                        )}
                    </div>
                  </div>

                  {account.verification_status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedAccount(account);
                          setActionType("approve");
                          setVerifyDialogOpen(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Setujui
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedAccount(account);
                          setActionType("reject");
                          setVerifyDialogOpen(true);
                        }}
                        variant="destructive"
                        size="sm"
                      >
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verify/Reject Dialog */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve"
                ? "Verifikasi Rekening Bank"
                : "Tolak Rekening Bank"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Pastikan data rekening sudah benar sebelum verifikasi"
                : "Berikan alasan penolakan untuk instruktur"}
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div>
                  <Label className="text-sm text-gray-600">Instruktur</Label>
                  <p className="font-medium">{selectedAccount.user?.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Bank</Label>
                  <p className="font-medium">{selectedAccount.bank_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">
                    Nomor Rekening
                  </Label>
                  <p className="font-medium font-mono">
                    {selectedAccount.account_number}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Nama Pemegang</Label>
                  <p className="font-medium">
                    {selectedAccount.account_holder_name}
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="verification_notes">
                  {actionType === "approve"
                    ? "Catatan Verifikasi (Opsional)"
                    : "Alasan Penolakan *"}
                </Label>
                <Textarea
                  id="verification_notes"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder={
                    actionType === "approve"
                      ? "Tambahkan catatan verifikasi jika diperlukan"
                      : "Jelaskan alasan penolakan (wajib diisi)"
                  }
                  rows={3}
                  className="mt-2"
                  required={actionType === "reject"}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    if (actionType === "reject" && !verificationNotes.trim()) {
                      toast.error("Alasan penolakan harus diisi");
                      return;
                    }
                    verifyMutation.mutate({
                      id: selectedAccount.id,
                      status:
                        actionType === "approve" ? "verified" : "rejected",
                      notes: verificationNotes || undefined,
                    });
                  }}
                  disabled={verifyMutation.isPending}
                  className={
                    actionType === "approve"
                      ? "flex-1 bg-green-600 hover:bg-green-700"
                      : "flex-1"
                  }
                  variant={actionType === "reject" ? "destructive" : "default"}
                >
                  {verifyMutation.isPending
                    ? "Memproses..."
                    : actionType === "approve"
                    ? "Konfirmasi Setujui"
                    : "Konfirmasi Tolak"}
                </Button>
                <Button
                  onClick={() => {
                    setVerifyDialogOpen(false);
                    setSelectedAccount(null);
                    setVerificationNotes("");
                    setActionType("approve");
                  }}
                  variant="outline"
                  disabled={verifyMutation.isPending}
                >
                  Batal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
