"use client";

import { formatCurrency } from "@/app/utils/format-currency";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminWithdrawals } from "@/hooks/use-withdrawal";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertCircle,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type WithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "all";

// Helper untuk status config
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  pending: {
    label: "Menunggu Approval",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  processing: {
    label: "Sedang Diproses",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Loader2,
  },
  completed: {
    label: "Selesai",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  failed: {
    label: "Gagal",
    color: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-slate-50 text-slate-700 border-slate-200",
    icon: AlertCircle,
  },
};

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: withdrawals, isLoading } = useAdminWithdrawals(
    statusFilter === "all" ? undefined : statusFilter
  );

  const filteredWithdrawals = withdrawals?.filter((withdrawal) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      withdrawal.user?.name?.toLowerCase().includes(searchLower) ||
      withdrawal.user?.email?.toLowerCase().includes(searchLower) ||
      withdrawal.bank_account?.bank_name?.toLowerCase().includes(searchLower) ||
      withdrawal.bank_account?.account_number?.includes(searchTerm)
    );
  });

  const stats = {
    total: withdrawals?.length || 0,
    pending: withdrawals?.filter((w) => w.status === "pending").length || 0,
    processing:
      withdrawals?.filter((w) => w.status === "processing").length || 0,
    completed: withdrawals?.filter((w) => w.status === "completed").length || 0,
    totalAmount: withdrawals?.reduce((sum, w) => sum + w.amount, 0) || 0,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Manajemen Penarikan
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Kelola permintaan penarikan dana dari instruktur.
            </p>
          </div>
          {/* Optional: Add Export Button Here */}
        </div>

        {/* 🌟 STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Permintaan"
            value={stats.total}
            icon={Wallet}
            color="blue"
          />
          <StatsCard
            title="Menunggu Approval"
            value={stats.pending}
            icon={Clock}
            color="yellow"
            highlight
          />
          <StatsCard
            title="Sedang Diproses"
            value={stats.processing}
            icon={Loader2}
            color="orange"
          />
          <StatsCard
            title="Total Dicairkan"
            value={formatCurrency(stats.totalAmount)}
            icon={CheckCircle2}
            color="green"
            isCurrency
          />
        </div>

        {/* 🌟 MAIN CONTENT CARD */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <CardTitle className="text-base font-bold text-slate-800">
                Daftar Transaksi
              </CardTitle>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Cari user, email, atau bank..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-10 border-slate-200 focus-visible:ring-orange-500"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as WithdrawalStatus)
                  }
                >
                  <SelectTrigger className="w-full sm:w-48 h-10 border-slate-200">
                    <div className="flex items-center text-slate-600">
                      <Filter className="h-3.5 w-3.5 mr-2" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="processing">Diproses</SelectItem>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="failed">Gagal</SelectItem>
                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {!filteredWithdrawals || filteredWithdrawals.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-slate-300" />
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
                {filteredWithdrawals.map((withdrawal) => {
                  const statusInfo =
                    STATUS_CONFIG[withdrawal.status] || STATUS_CONFIG.pending;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <div
                      key={withdrawal.id}
                      className="p-5 hover:bg-slate-50/80 transition-colors group"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                        {/* 1. User Info */}
                        <div className="flex items-center gap-4 min-w-[250px]">
                          <Avatar className="h-10 w-10 border border-slate-200">
                            <AvatarImage src={withdrawal.user?.avatar_url} />
                            <AvatarFallback className="bg-orange-100 text-orange-700 text-xs font-bold">
                              {withdrawal.user?.name
                                ?.substring(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">
                              {withdrawal.user?.name || "Unknown User"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {withdrawal.user?.email}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {formatDistanceToNow(
                                new Date(withdrawal.created_at),
                                { addSuffix: true, locale: localeId }
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. Bank Details */}
                        <div className="flex-1 min-w-[200px]">
                          {withdrawal.bank_account ? (
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                                <Building2 className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {withdrawal.bank_account.bank_name}
                                </div>
                                <div className="text-xs text-slate-500 font-mono tracking-wide mt-0.5">
                                  {withdrawal.bank_account.account_number}
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5">
                                  a.n{" "}
                                  {withdrawal.bank_account.account_holder_name}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400 italic">
                              Info bank tidak tersedia
                            </span>
                          )}
                        </div>

                        {/* 3. Amount & Fee */}
                        <div className="min-w-[180px]">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="p-1 bg-green-50 rounded shrink-0">
                              <Banknote className="h-3.5 w-3.5 text-green-600" />
                            </div>
                            <span className="font-bold text-slate-900">
                              {formatCurrency(withdrawal.net_amount)}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex flex-col gap-0.5 pl-6">
                            <span className="flex justify-between w-32">
                              <span>Bruto:</span>{" "}
                              <span>{formatCurrency(withdrawal.amount)}</span>
                            </span>
                            <span className="flex justify-between w-32 text-red-500">
                              <span>Admin:</span>{" "}
                              <span>
                                -{formatCurrency(withdrawal.admin_fee)}
                              </span>
                            </span>
                          </div>
                        </div>

                        {/* 4. Status & Action */}
                        <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-3 min-w-[140px] ml-auto">
                          <Badge
                            variant="outline"
                            className={`${statusInfo.color} gap-1.5 py-1 pl-1.5 pr-2.5 shadow-sm border`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusInfo.label}
                          </Badge>

                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-200"
                          >
                            <Link href={`/admin/withdrawals/${withdrawal.id}`}>
                              Detail <ArrowUpRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- SUB COMPONENT: Stats Card ---
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  isCurrency = false,
  highlight = false,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: "blue" | "yellow" | "green" | "orange";
  isCurrency?: boolean;
  highlight?: boolean;
}) {
  const colorStyles = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <Card
      className={`border shadow-sm transition-all ${
        highlight
          ? "ring-2 ring-yellow-400 border-yellow-400"
          : "border-slate-200"
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              {title}
            </p>
            <div
              className={`font-bold text-slate-900 ${
                isCurrency ? "text-xl" : "text-2xl"
              }`}
            >
              {value}
            </div>
          </div>
          <div className={`p-3 rounded-xl border ${colorStyles[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
