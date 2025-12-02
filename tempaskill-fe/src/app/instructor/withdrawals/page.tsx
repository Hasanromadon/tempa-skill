"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBalance,
  useBankAccount,
  useWithdrawals,
} from "@/hooks/use-withdrawal";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertCircle,
  Clock,
  DollarSign,
  Plus,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function InstructorWithdrawalsPage() {
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals();
  const { data: bankAccountData } = useBankAccount();

  const verifiedAccount = bankAccountData?.verified;
  const pendingAccount = bankAccountData?.pending;
  const isRejected = pendingAccount?.verification_status === "rejected";

  // Check if there's any pending/processing withdrawal
  const hasPendingWithdrawal = withdrawals?.some(
    (w) => w.status === "pending" || w.status === "processing"
  );

  if (balanceLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Determine if user can withdraw
  const canWithdraw =
    verifiedAccount &&
    balance &&
    balance.available_balance >= 50000 &&
    !hasPendingWithdrawal;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Penarikan Dana</h1>
        {canWithdraw && (
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/instructor/withdrawals/new">
              <Plus className="h-4 w-4 mr-2" />
              Tarik Dana
            </Link>
          </Button>
        )}
      </div>

      {!verifiedAccount && !pendingAccount && (
        <Alert className="mb-6 border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Anda belum menambahkan rekening bank.{" "}
            <Link
              href="/instructor/withdrawals/bank-account"
              className="font-medium underline"
            >
              Tambahkan sekarang
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {pendingAccount && pendingAccount.verification_status === "pending" && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {verifiedAccount
              ? "Pengajuan perubahan rekening bank sedang dalam proses verifikasi oleh admin."
              : "Rekening bank Anda sedang dalam proses verifikasi oleh admin."}
          </AlertDescription>
        </Alert>
      )}

      {isRejected && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>
              Pengajuan {verifiedAccount ? "perubahan " : ""}rekening bank
              ditolak.
            </strong>
            {pendingAccount.verification_notes && (
              <p className="mt-1">
                Alasan: {pendingAccount.verification_notes}
              </p>
            )}
            <p className="mt-2">
              <Link
                href="/instructor/withdrawals/bank-account"
                className="font-medium underline"
              >
                Ajukan ulang dengan data yang benar
              </Link>
            </p>
          </AlertDescription>
        </Alert>
      )}

      {hasPendingWithdrawal && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Anda memiliki permintaan penarikan yang sedang diproses. Tunggu
            hingga selesai sebelum mengajukan penarikan baru.
          </AlertDescription>
        </Alert>
      )}

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo Tersedia
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(balance?.available_balance || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Siap ditarik</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Saldo Ditahan
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(balance?.held_balance || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Masa tahan 7 hari</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pendapatan
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balance?.total_earnings || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Sepanjang waktu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Sudah Ditarik
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balance?.withdrawn_amount || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Riwayat penarikan</p>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Penarikan</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : !withdrawals || withdrawals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada riwayat penarikan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">
                        {formatCurrency(withdrawal.amount)}
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
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(withdrawal.created_at), {
                        addSuffix: true,
                        locale: localeId,
                      })}
                    </p>
                    {withdrawal.bank_account && (
                      <p className="text-xs text-gray-500 mt-1">
                        {withdrawal.bank_account.bank_name} -{" "}
                        {withdrawal.bank_account.account_number}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600">
                      +{formatCurrency(withdrawal.net_amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Biaya: {formatCurrency(withdrawal.admin_fee)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
