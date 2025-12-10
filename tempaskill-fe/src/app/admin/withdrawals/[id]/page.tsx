"use client";

import { formatCurrency } from "@/app/utils/format-currency";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminWithdrawals,
  useProcessWithdrawal,
  useVerifyBankAccount,
} from "@/hooks/use-withdrawal";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertCircle,
  AlertTriangle,
  Building2,
  CheckCircle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Mail,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WithdrawalDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: withdrawals, isLoading } = useAdminWithdrawals();
  const processWithdrawal = useProcessWithdrawal();
  const verifyBankAccount = useVerifyBankAccount();

  const [notes, setNotes] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Error type definition for consistent handling
  interface ApiError {
    response?: { data?: { error?: string } };
  }

  const withdrawal = withdrawals?.find((w) => w.id === parseInt(id));

  const handleApprove = async () => {
    try {
      await processWithdrawal.mutateAsync({
        id: parseInt(id),
        status: "completed",
        notes: notes || undefined,
      });

      toast.success("Penarikan berhasil disetujui");
      router.push("/admin/withdrawals");
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || "Gagal menyetujui penarikan");
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error("Catatan penolakan harus diisi");
      return;
    }

    try {
      await processWithdrawal.mutateAsync({
        id: parseInt(id),
        status: "failed",
        notes,
      });

      toast.success("Penarikan berhasil ditolak");
      router.push("/admin/withdrawals");
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || "Gagal menolak penarikan");
    }
  };

  const handleVerifyBank = async () => {
    if (!withdrawal?.bank_account?.id) return;

    try {
      await verifyBankAccount.mutateAsync({
        id: withdrawal.bank_account.id,
        status: "verified",
        verification_notes: verificationNotes || undefined,
      });

      toast.success("Rekening bank berhasil diverifikasi");
    } catch (error: unknown) {
      const err = error as ApiError;
      toast.error(err.response?.data?.error || "Gagal memverifikasi rekening");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!withdrawal) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
        <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-8 w-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Data Tidak Ditemukan
        </h2>
        <p className="text-slate-500 mt-2 mb-6">
          Permintaan penarikan dengan ID tersebut tidak tersedia.
        </p>
        <Link href="/admin/withdrawals">
          <Button variant="outline">Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  const canProcess =
    withdrawal.status === "pending" || withdrawal.status === "processing";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
      {/* 🌟 HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/withdrawals"
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />{" "}
              {/* Using ChevronLeft for consistency */}
            </Link>
            <h1 className="text-lg font-bold text-slate-900">
              Detail Penarikan #{withdrawal.id}
            </h1>
          </div>

          {/* Status Badge in Header */}
          <Badge
            variant="outline"
            className={
              withdrawal.status === "completed"
                ? "bg-green-50 text-green-700 border-green-200"
                : withdrawal.status === "pending"
                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                : withdrawal.status === "processing"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : withdrawal.status === "failed"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }
          >
            {withdrawal.status === "pending" && "Menunggu Approval"}
            {withdrawal.status === "processing" && "Sedang Diproses"}
            {withdrawal.status === "completed" && "Selesai"}
            {withdrawal.status === "failed" && "Gagal"}
            {withdrawal.status === "cancelled" && "Dibatalkan"}
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* 🌟 1. INSTRUCTOR INFO CARD */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4" /> Informasi Instruktur
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border border-slate-200">
                <AvatarImage src={withdrawal.user?.avatar_url} />
                <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                  {withdrawal.user?.name?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {withdrawal.user?.name}
                </h3>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {withdrawal.user?.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 🌟 2. WITHDRAWAL DETAIL CARD */}
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
            <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Rincian Dana
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <Label className="text-slate-500 text-xs uppercase tracking-wide">
                  Jumlah Diminta
                </Label>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {formatCurrency(withdrawal.amount)}
                </p>
              </div>
              <div>
                <Label className="text-slate-500 text-xs uppercase tracking-wide">
                  Biaya Admin (2.5%)
                </Label>
                <p className="text-2xl font-bold text-red-500 mt-1">
                  -{formatCurrency(withdrawal.admin_fee)}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center bg-green-50 p-4 rounded-lg border border-green-100">
              <div>
                <Label className="text-green-700 font-semibold">
                  Total Transfer Bersih
                </Label>
                <p className="text-xs text-green-600">
                  Nominal yang harus dikirim ke rekening.
                </p>
              </div>
              <p className="text-3xl font-bold text-green-700">
                {formatCurrency(withdrawal.net_amount)}
              </p>
            </div>

            <div className="mt-6 text-sm text-slate-500 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Dibuat pada:{" "}
              {format(new Date(withdrawal.created_at), "dd MMMM yyyy, HH:mm", {
                locale: localeId,
              })}
            </div>
          </CardContent>
        </Card>

        {/* 🌟 3. BANK ACCOUNT CARD */}
        {withdrawal.bank_account && (
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building2 className="h-4 w-4" /> Rekening Tujuan
              </CardTitle>
              {withdrawal.bank_account.verification_status === "verified" ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700 flex gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" /> Terverifikasi
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-700"
                >
                  Belum Verifikasi
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-slate-500 text-xs">Bank</Label>
                  <p className="font-semibold text-slate-900 text-lg">
                    {withdrawal.bank_account.bank_name}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">
                    Nomor Rekening
                  </Label>
                  <p className="font-mono text-slate-900 text-lg">
                    {withdrawal.bank_account.account_number}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-500 text-xs">Atas Nama</Label>
                  <p className="font-semibold text-slate-900 text-lg">
                    {withdrawal.bank_account.account_holder_name}
                  </p>
                </div>
              </div>

              {/* Verification Action (If needed) */}
              {withdrawal.bank_account.verification_status === "pending" && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <Alert className="bg-blue-50 border-blue-100 mb-4">
                    <InfoIcon className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800 font-bold">
                      Verifikasi Diperlukan
                    </AlertTitle>
                    <AlertDescription className="text-blue-700 text-xs">
                      Pastikan data rekening valid sebelum menyetujui penarikan.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Catatan verifikasi (opsional)"
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleVerifyBank}
                      disabled={verifyBankAccount.isPending}
                      className="bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      {verifyBankAccount.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Verifikasi & Simpan"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 🌟 4. PROCESSING ACTION AREA */}
        {canProcess && (
          <Card className="border border-slate-200 shadow-lg ring-1 ring-slate-200">
            <CardHeader className="py-4">
              <CardTitle className="text-base font-bold text-slate-900">
                Tindakan Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              {!showApproveForm && !showRejectForm ? (
                <div className="flex gap-4">
                  <Button
                    onClick={() => setShowApproveForm(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 text-base shadow-sm"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Setujui & Transfer
                  </Button>
                  <Button
                    onClick={() => setShowRejectForm(true)}
                    variant="outline"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 text-base"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Tolak Permintaan
                  </Button>
                </div>
              ) : showApproveForm ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800 font-bold">
                      Konfirmasi Persetujuan
                    </AlertTitle>
                    <AlertDescription className="text-green-700 text-xs">
                      Pastikan Anda telah melakukan transfer manual sejumlah{" "}
                      <span className="font-bold">
                        {formatCurrency(withdrawal.net_amount)}
                      </span>{" "}
                      ke rekening di atas. Tindakan ini tidak dapat dibatalkan.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label>Catatan Transfer / Bukti (Opsional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Masukkan nomor referensi atau catatan transfer..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleApprove}
                      disabled={processWithdrawal.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processWithdrawal.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        "Ya, Saya Sudah Transfer"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowApproveForm(false)}
                      disabled={processWithdrawal.isPending}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800 font-bold">
                      Konfirmasi Penolakan
                    </AlertTitle>
                    <AlertDescription className="text-red-700 text-xs">
                      Dana akan dikembalikan ke saldo dompet instruktur. Anda
                      wajib memberikan alasan penolakan.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label className="text-red-600">Alasan Penolakan *</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Contoh: Nomor rekening tidak valid, nama tidak sesuai..."
                      rows={3}
                      className="border-red-200 focus-visible:ring-red-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleReject}
                      disabled={processWithdrawal.isPending || !notes.trim()}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    >
                      {processWithdrawal.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        "Tolak Permintaan"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectForm(false)}
                      disabled={processWithdrawal.isPending}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper Icon
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}
