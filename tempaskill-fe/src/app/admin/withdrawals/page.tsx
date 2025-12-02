"use client";

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
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Eye, Filter, Search, Wallet } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type WithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "all";

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
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manajemen Penarikan Dana</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Penarikan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Menunggu Approval
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
              Sedang Diproses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.processing}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Nilai
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalAmount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari nama, email, atau bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as WithdrawalStatus)
              }
            >
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Semua Status" />
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
        </CardContent>
      </Card>

      {/* Withdrawals List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penarikan</CardTitle>
        </CardHeader>
        <CardContent>
          {!filteredWithdrawals || filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Tidak ada data penarikan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-lg">
                        {withdrawal.user?.name || "N/A"}
                      </span>
                      <Badge
                        variant={
                          withdrawal.status === "completed"
                            ? "default"
                            : withdrawal.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          withdrawal.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : withdrawal.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : withdrawal.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : ""
                        }
                      >
                        {withdrawal.status === "pending" && "Menunggu"}
                        {withdrawal.status === "processing" && "Diproses"}
                        {withdrawal.status === "completed" && "Selesai"}
                        {withdrawal.status === "failed" && "Gagal"}
                        {withdrawal.status === "cancelled" && "Dibatalkan"}
                      </Badge>
                    </div>

                    <div className="text-sm text-gray-600">
                      {withdrawal.user?.email}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Jumlah: </span>
                        <span className="font-medium">
                          {formatCurrency(withdrawal.amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Diterima: </span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(withdrawal.net_amount)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Biaya: </span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(withdrawal.admin_fee)}
                        </span>
                      </div>
                    </div>

                    {withdrawal.bank_account && (
                      <div className="text-sm text-gray-600">
                        {withdrawal.bank_account.bank_name} -{" "}
                        {withdrawal.bank_account.account_number} a/n{" "}
                        {withdrawal.bank_account.account_holder_name}
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(withdrawal.created_at), {
                        addSuffix: true,
                        locale: localeId,
                      })}
                    </div>
                  </div>

                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/withdrawals/${withdrawal.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Detail
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
