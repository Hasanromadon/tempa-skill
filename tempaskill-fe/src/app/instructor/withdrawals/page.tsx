"use client";

import { formatCurrency } from "@/app/utils/format-currency";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBalance,
  useBankAccount,
  useWithdrawals,
} from "@/hooks/use-withdrawal";
import { ROUTES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  Clock,
  History,
  Landmark,
  Loader2,
  LucideProps,
  Plus,
  Wallet,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export default function InstructorWithdrawalsPage() {
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals();
  const { data: bankAccountData, isLoading: bankLoading } = useBankAccount();

  const verifiedAccount = bankAccountData?.verified;
  const pendingAccount = bankAccountData?.pending;
  const isRejected = pendingAccount?.verification_status === "rejected";

  // Check pending withdrawals
  const hasPendingWithdrawal = withdrawals?.some(
    (w) => w.status === "pending" || w.status === "processing"
  );

  // Determine withdrawal eligibility
  const minWithdrawalAmount = 50000;
  const currentBalance = balance?.available_balance || 0;

  const canWithdraw =
    verifiedAccount &&
    currentBalance >= minWithdrawalAmount &&
    !hasPendingWithdrawal;

  // Loading State
  if (balanceLoading || bankLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 px-4">
        <div className="container mx-auto max-w-5xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 🌟 1. STICKY HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.DASHBOARD} // Atau /instructor/dashboard
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Dompet & Penarikan
              </h1>
              <p className="text-sm text-slate-500">
                Kelola saldo dan rekening pencairan dana.
              </p>
            </div>
          </div>

          <div>
            <Button
              asChild
              disabled={!canWithdraw}
              className={`shadow-md transition-all active:scale-95 ${
                canWithdraw
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-100"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none hover:bg-slate-100"
              }`}
            >
              <Link href={canWithdraw ? "/instructor/withdrawals/new" : "#"}>
                <Plus className="h-4 w-4 mr-2" />
                Tarik Dana
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-5xl">
        {/* 🌟 2. ALERTS SECTION (Contextual) */}
        <div className="space-y-4">
          {/* Case: No Bank Account */}
          {!verifiedAccount && !pendingAccount && (
            <Alert className="bg-orange-50 border-orange-200 text-orange-900">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800 font-bold mb-1">
                Rekening Belum Diatur
              </AlertTitle>
              <AlertDescription className="flex items-center justify-between flex-wrap gap-2">
                <span>
                  Anda belum menambahkan rekening bank. Dana tidak dapat
                  dicairkan tanpa rekening valid.
                </span>
                <Link href="/instructor/withdrawals/bank-account">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-300 text-orange-700 hover:bg-orange-100 h-8"
                  >
                    Tambah Rekening <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Case: Pending Verification */}
          {pendingAccount &&
            pendingAccount.verification_status === "pending" && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900">
                <Clock className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800 font-bold mb-1">
                  Verifikasi Rekening
                </AlertTitle>
                <AlertDescription>
                  {verifiedAccount
                    ? "Pengajuan perubahan rekening bank sedang diverifikasi oleh admin."
                    : "Rekening bank Anda sedang dalam antrean verifikasi. Proses ini memakan waktu 1-2 hari kerja."}
                </AlertDescription>
              </Alert>
            )}

          {/* Case: Rejected */}
          {isRejected && (
            <Alert className="bg-red-50 border-red-200 text-red-900">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800 font-bold mb-1">
                Pengajuan Ditolak
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>
                  Pengajuan rekening bank Anda ditolak.
                  {pendingAccount.verification_notes && (
                    <span className="block mt-1 font-medium italic">
                      &quot;{pendingAccount.verification_notes}&quot;
                    </span>
                  )}
                </p>
                <Link
                  href="/instructor/withdrawals/bank-account"
                  className="inline-block"
                >
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 bg-red-600 hover:bg-red-700"
                  >
                    Perbaiki Data
                  </Button>
                </Link>
              </AlertDescription>
            </Alert>
          )}

          {/* Case: Has Pending Withdrawal */}
          {hasPendingWithdrawal && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-900">
              <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
              <AlertTitle className="text-blue-800 font-bold mb-1">
                Penarikan Sedang Diproses
              </AlertTitle>
              <AlertDescription>
                Anda memiliki permintaan penarikan yang sedang berlangsung.
                Harap tunggu hingga selesai sebelum mengajukan lagi.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 🌟 3. STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Saldo Siap Cair"
            value={formatCurrency(balance?.available_balance || 0)}
            icon={Wallet}
            color="green"
            highlight
          />
          <StatsCard
            title="Saldo Ditahan"
            value={formatCurrency(balance?.held_balance || 0)}
            icon={Clock}
            color="yellow"
            desc="Menunggu masa 7 hari"
          />
          <StatsCard
            title="Total Dicairkan"
            value={formatCurrency(balance?.withdrawn_amount || 0)}
            icon={CheckCircle2}
            color="blue"
            desc="Sejak bergabung"
          />
        </div>

        {/* 🌟 4. HISTORY & BANK INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Withdrawal History */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-white border-b border-slate-100 px-6 py-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" /> Riwayat
                  Penarikan
                </CardTitle>
                {/* Optional filter could go here */}
              </CardHeader>
              <CardContent className="p-0">
                {withdrawalsLoading ? (
                  <div className="p-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !withdrawals || withdrawals.length === 0 ? (
                  <div className="text-center py-16 px-6">
                    <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Banknote className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-slate-900 font-medium">
                      Belum ada riwayat
                    </p>
                    <p className="text-slate-500 text-sm">
                      Lakukan penarikan pertama Anda saat saldo mencukupi.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {withdrawals.map((withdrawal) => {
                      const statusConfig = getStatusConfig(withdrawal.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <div
                          key={withdrawal.id}
                          className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className={`p-2.5 rounded-full ${statusConfig.bg}`}
                            >
                              <StatusIcon
                                className={`h-5 w-5 ${statusConfig.text}`}
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {formatCurrency(withdrawal.amount)}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                <span className="capitalize">
                                  {formatDistanceToNow(
                                    new Date(withdrawal.created_at),
                                    { addSuffix: true, locale: localeId }
                                  )}
                                </span>
                                {withdrawal.bank_account && (
                                  <>
                                    <span>•</span>
                                    <span>
                                      {withdrawal.bank_account.bank_name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <Badge
                              variant="outline"
                              className={`${statusConfig.badge} shadow-none`}
                            >
                              {statusConfig.label}
                            </Badge>
                            {withdrawal.admin_fee > 0 && (
                              <p className="text-[10px] text-slate-400 mt-1">
                                Fee: {formatCurrency(withdrawal.admin_fee)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Quick Info / Bank Account Summary */}
          <div className="space-y-6">
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-100 py-4">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-slate-500" /> Rekening
                  Terdaftar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {verifiedAccount ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600 text-xs">
                        {verifiedAccount.bank_name
                          .substring(0, 3)
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {verifiedAccount.bank_name}
                        </p>
                        <p className="text-sm text-slate-500 font-mono">
                          {verifiedAccount.account_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded border border-slate-100">
                      a.n <strong>{verifiedAccount.account_holder_name}</strong>
                    </div>
                    <Link href="/instructor/withdrawals/bank-account">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Ubah Rekening
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500 mb-4">
                      Belum ada rekening aktif.
                    </p>
                    <Link href="/instructor/withdrawals/bank-account">
                      <Button variant="outline" size="sm" className="w-full">
                        Tambah Rekening
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
              <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Syarat Penarikan
              </h4>
              <ul className="text-xs text-blue-800 space-y-2 list-disc list-inside">
                <li>
                  Minimal penarikan <strong>Rp 50.000</strong>.
                </li>
                <li>Rekening bank harus sudah terverifikasi.</li>
                <li>
                  Proses pencairan maksimal <strong>1x24 jam</strong> kerja.
                </li>
                <li>Biaya admin sesuai kebijakan bank.</li>
              </ul>
            </div>
          </div>
        </div>
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
  desc,
  highlight = false,
}: {
  title: string;
  value: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color: "green" | "yellow" | "blue";
  desc?: string;
  highlight?: boolean;
}) {
  const styles = {
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <Card
      className={`border shadow-sm transition-all ${
        highlight
          ? "ring-1 ring-green-500 border-green-200"
          : "border-slate-200"
      }`}
    >
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          {desc && <p className="text-xs text-slate-400 mt-1">{desc}</p>}
        </div>
        <div className={`p-2.5 rounded-xl border ${styles[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

// --- HELPER: Status Config ---
function getStatusConfig(status: string) {
  switch (status) {
    case "completed":
      return {
        label: "Selesai",
        badge: "bg-green-100 text-green-700 border-green-200",
        bg: "bg-green-100",
        text: "text-green-600",
        icon: CheckCircle2,
      };
    case "pending":
      return {
        label: "Menunggu",
        badge: "bg-yellow-100 text-yellow-700 border-yellow-200",
        bg: "bg-yellow-100",
        text: "text-yellow-600",
        icon: Clock,
      };
    case "processing":
      return {
        label: "Diproses",
        badge: "bg-blue-100 text-blue-700 border-blue-200",
        bg: "bg-blue-100",
        text: "text-blue-600",
        icon: Loader2,
      };
    case "failed":
      return {
        label: "Gagal",
        badge: "bg-red-100 text-red-700 border-red-200",
        bg: "bg-red-100",
        text: "text-red-600",
        icon: XCircle,
      };
    default:
      return {
        label: status,
        badge: "bg-slate-100 text-slate-700 border-slate-200",
        bg: "bg-slate-100",
        text: "text-slate-600",
        icon: AlertCircle,
      };
  }
}
