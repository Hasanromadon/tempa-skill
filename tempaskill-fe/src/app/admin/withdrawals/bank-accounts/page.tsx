"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { ApiError, getError } from "@/lib/get-error";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  Filter,
  Loader2,
  Search,
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
    avatar_url?: string; // Add if available
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
      const description = getError(
        error as ApiError,
        "Gagal melakukan verifikasi rekening"
      );
      toast.error("Gagal memproses rekening", {
        description,
      });
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

  // Helper for initials
  const getInitials = (name: string) =>
    name?.substring(0, 2).toUpperCase() || "U";

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* 🌟 HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Validasi Rekening Bank
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Verifikasi rekening instruktur untuk pencairan dana.
            </p>
          </div>
        </div>

        {/* 🌟 STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Rekening"
            value={stats.total}
            icon={Building2}
            color="blue"
          />
          <StatsCard
            title="Menunggu Verifikasi"
            value={stats.pending}
            icon={Clock}
            color="yellow"
            highlight
          />
          <StatsCard
            title="Terverifikasi"
            value={stats.verified}
            icon={CheckCircle2}
            color="green"
          />
          <StatsCard
            title="Ditolak"
            value={stats.rejected}
            icon={XCircle}
            color="red"
          />
        </div>

        {/* 🌟 FILTERS & LIST */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <CardTitle className="text-base font-bold text-slate-800">
                Daftar Rekening
              </CardTitle>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Cari nama, bank, atau no. rek..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 border-slate-200 text-sm"
                  />
                </div>

                <Select
                  value={statusFilter}
                  onValueChange={(
                    value: "all" | "pending" | "verified" | "rejected"
                  ) => setStatusFilter(value)}
                >
                  <SelectTrigger className="w-full sm:w-[160px] h-9 border-slate-200 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Filter className="h-3.5 w-3.5" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Terverifikasi</SelectItem>
                    <SelectItem value="rejected">Ditolak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {!filteredAccounts || filteredAccounts.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-medium">
                  Tidak ada data ditemukan
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Coba ubah filter atau kata kunci pencarian.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-5 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                      {/* User Info */}
                      <div className="flex items-center gap-4 min-w-[250px]">
                        <Avatar className="h-10 w-10 border border-slate-200">
                          <AvatarImage src={account.user?.avatar_url} />
                          <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-bold">
                            {getInitials(account.user?.name || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {account.user?.name || "N/A"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {account.user?.email || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Bank Info */}
                      <div className="flex-1 min-w-[250px]">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg shrink-0 text-blue-600">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {account.bank_name}
                            </div>
                            <div className="text-xs text-slate-500 font-mono tracking-wide mt-0.5">
                              {account.account_number}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              a.n {account.account_holder_name}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 min-w-[140px] ml-auto w-full lg:w-auto">
                        {account.verification_status === "verified" ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 gap-1.5 py-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                            Terverifikasi
                          </Badge>
                        ) : account.verification_status === "rejected" ? (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200 gap-1.5 py-1"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Ditolak
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1.5 py-1"
                          >
                            <Clock className="h-3.5 w-3.5" /> Menunggu
                          </Badge>
                        )}

                        {account.verification_status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="h-8 bg-green-600 hover:bg-green-700 text-white text-xs px-3 shadow-sm"
                              onClick={() => {
                                setSelectedAccount(account);
                                setActionType("approve");
                                setVerifyDialogOpen(true);
                              }}
                            >
                              Setujui
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 text-xs px-3"
                              onClick={() => {
                                setSelectedAccount(account);
                                setActionType("reject");
                                setVerifyDialogOpen(true);
                              }}
                            >
                              Tolak
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🌟 VERIFY DIALOG */}
      <Dialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <DialogContent className="max-w-md p-0 gap-0 border-none shadow-xl overflow-hidden">
          <DialogHeader
            className={`px-6 py-4 border-b ${
              actionType === "approve"
                ? "bg-green-50 border-green-100"
                : "bg-red-50 border-red-100"
            }`}
          >
            <DialogTitle
              className={`text-lg font-bold flex items-center gap-2 ${
                actionType === "approve" ? "text-green-800" : "text-red-800"
              }`}
            >
              {actionType === "approve" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              {actionType === "approve"
                ? "Konfirmasi Verifikasi"
                : "Tolak Pengajuan"}
            </DialogTitle>
            <DialogDescription
              className={
                actionType === "approve" ? "text-green-700" : "text-red-700"
              }
            >
              {actionType === "approve"
                ? "Pastikan data rekening sudah valid sebelum menyetujui."
                : "Tindakan ini akan menolak pengajuan rekening instruktur."}
            </DialogDescription>
          </DialogHeader>

          {selectedAccount && (
            <div className="p-6 space-y-5 bg-white">
              {/* Account Summary */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Instruktur:</span>
                  <span className="font-medium text-slate-900">
                    {selectedAccount.user?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Bank:</span>
                  <span className="font-medium text-slate-900">
                    {selectedAccount.bank_name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">No. Rekening:</span>
                  <span className="font-mono font-medium text-slate-900">
                    {selectedAccount.account_number}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Atas Nama:</span>
                  <span className="font-medium text-slate-900">
                    {selectedAccount.account_holder_name}
                  </span>
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="notes"
                  className={
                    actionType === "reject"
                      ? "text-red-600 font-semibold"
                      : "text-slate-700"
                  }
                >
                  {actionType === "approve"
                    ? "Catatan Verifikasi (Opsional)"
                    : "Alasan Penolakan *"}
                </Label>
                <Textarea
                  id="notes"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder={
                    actionType === "approve"
                      ? "Contoh: Data valid, dicek via mutasi..."
                      : "Jelaskan mengapa data ini ditolak..."
                  }
                  rows={3}
                  className={`resize-none ${
                    actionType === "reject"
                      ? "border-red-200 focus-visible:ring-red-500"
                      : "border-slate-200"
                  }`}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    if (actionType === "reject" && !verificationNotes.trim()) {
                      toast.error("Alasan penolakan wajib diisi");
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
                  className={`flex-1 text-white shadow-md transition-all active:scale-95 ${
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : actionType === "approve" ? (
                    "Ya, Verifikasi"
                  ) : (
                    "Tolak Pengajuan"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setVerifyDialogOpen(false)}
                  disabled={verifyMutation.isPending}
                  className="flex-1"
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

// --- SUB COMPONENT: Stats Card ---
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  highlight = false,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: "green" | "yellow" | "blue" | "red";
  highlight?: boolean;
}) {
  const styles = {
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <Card
      className={`border shadow-sm transition-all ${
        highlight
          ? "ring-1 ring-yellow-400 border-yellow-300"
          : "border-slate-200"
      }`}
    >
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
        </div>
        <div className={`p-2.5 rounded-xl border ${styles[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
