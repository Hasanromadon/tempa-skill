"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminWithdrawals,
  useProcessWithdrawal,
  useVerifyBankAccount,
} from "@/hooks/use-withdrawal";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  Clock,
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
      const err = error as { response?: { data?: { error?: string } } };
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
      const err = error as { response?: { data?: { error?: string } } };
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
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Gagal memverifikasi rekening");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!withdrawal) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Penarikan tidak ditemukan</AlertDescription>
        </Alert>
      </div>
    );
  }

  const canProcess = withdrawal.status === "pending";

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/admin/withdrawals">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Link>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Detail Penarikan</h1>
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
              ? "bg-green-100 text-green-800 text-lg px-4 py-1"
              : withdrawal.status === "pending"
              ? "bg-yellow-100 text-yellow-800 text-lg px-4 py-1"
              : withdrawal.status === "processing"
              ? "bg-blue-100 text-blue-800 text-lg px-4 py-1"
              : "text-lg px-4 py-1"
          }
        >
          {withdrawal.status === "pending" && "Menunggu"}
          {withdrawal.status === "processing" && "Diproses"}
          {withdrawal.status === "completed" && "Selesai"}
          {withdrawal.status === "failed" && "Gagal"}
          {withdrawal.status === "cancelled" && "Dibatalkan"}
        </Badge>
      </div>

      <div className="grid gap-6">
        {/* Instructor Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-orange-600" />
              Informasi Instruktur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm text-gray-600">Nama</Label>
              <p className="text-lg font-medium">
                {withdrawal.user?.name || "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Email</Label>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                {withdrawal.user?.email || "N/A"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Penarikan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">
                  Jumlah Penarikan
                </Label>
                <p className="text-2xl font-bold">
                  {formatCurrency(withdrawal.amount)}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">
                  Biaya Admin (2.5%)
                </Label>
                <p className="text-2xl font-bold text-red-600">
                  -{formatCurrency(withdrawal.admin_fee)}
                </p>
              </div>
            </div>
            <div className="pt-3 border-t">
              <Label className="text-sm text-gray-600">Total Diterima</Label>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(withdrawal.net_amount)}
              </p>
            </div>
            <div className="pt-3 border-t">
              <Label className="text-sm text-gray-600">
                Tanggal Permintaan
              </Label>
              <p>
                {format(
                  new Date(withdrawal.created_at),
                  "dd MMMM yyyy, HH:mm",
                  {
                    locale: localeId,
                  }
                )}
              </p>
            </div>
            {withdrawal.notes && (
              <div>
                <Label className="text-sm text-gray-600">
                  Catatan Instruktur
                </Label>
                <p className="text-gray-700">{withdrawal.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bank Account Info */}
        {withdrawal.bank_account && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-orange-600" />
                  Rekening Tujuan
                </CardTitle>
                {withdrawal.bank_account.verification_status === "verified" ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Terverifikasi
                  </Badge>
                ) : withdrawal.bank_account.verification_status ===
                  "rejected" ? (
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
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600">Nama Bank</Label>
                <p className="text-lg font-medium">
                  {withdrawal.bank_account.bank_name}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Nomor Rekening</Label>
                <p className="text-lg font-medium">
                  {withdrawal.bank_account.account_number}
                </p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Nama Pemegang</Label>
                <p className="text-lg font-medium">
                  {withdrawal.bank_account.account_holder_name}
                </p>
              </div>

              {withdrawal.bank_account.verification_status === "pending" && (
                <div className="pt-4 border-t">
                  <Label htmlFor="verification_notes">
                    Catatan Verifikasi (Opsional)
                  </Label>
                  <Textarea
                    id="verification_notes"
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    placeholder="Tambahkan catatan verifikasi"
                    className="mt-2 mb-3"
                    rows={2}
                  />
                  <Button
                    onClick={handleVerifyBank}
                    disabled={verifyBankAccount.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {verifyBankAccount.isPending
                      ? "Memverifikasi..."
                      : "Verifikasi Rekening"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Processing Notes */}
        {withdrawal.processed_at && (
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pemrosesan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600">Diproses Pada</Label>
                <p>
                  {format(
                    new Date(withdrawal.processed_at),
                    "dd MMMM yyyy, HH:mm",
                    {
                      locale: localeId,
                    }
                  )}
                </p>
              </div>
              {withdrawal.notes && (
                <div>
                  <Label className="text-sm text-gray-600">Catatan Admin</Label>
                  <p className="text-gray-700">{withdrawal.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        {canProcess && (
          <Card>
            <CardHeader>
              <CardTitle>Tindakan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showApproveForm && !showRejectForm && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowApproveForm(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Setujui
                  </Button>
                  <Button
                    onClick={() => setShowRejectForm(true)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak
                  </Button>
                </div>
              )}

              {showApproveForm && (
                <div className="space-y-3">
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Dana akan ditransfer ke rekening instruktur sesuai
                      informasi di atas.
                    </AlertDescription>
                  </Alert>
                  <Label htmlFor="approve_notes">Catatan (Opsional)</Label>
                  <Textarea
                    id="approve_notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tambahkan catatan jika diperlukan"
                    rows={3}
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleApprove}
                      disabled={processWithdrawal.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processWithdrawal.isPending
                        ? "Memproses..."
                        : "Konfirmasi Setujui"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowApproveForm(false);
                        setNotes("");
                      }}
                      variant="outline"
                      disabled={processWithdrawal.isPending}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              )}

              {showRejectForm && (
                <div className="space-y-3">
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      Penarikan akan dibatalkan dan instruktur akan
                      dinotifikasi.
                    </AlertDescription>
                  </Alert>
                  <Label htmlFor="reject_notes">Alasan Penolakan *</Label>
                  <Textarea
                    id="reject_notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Jelaskan alasan penolakan (wajib diisi)"
                    rows={3}
                    required
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleReject}
                      disabled={processWithdrawal.isPending || !notes.trim()}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processWithdrawal.isPending
                        ? "Memproses..."
                        : "Konfirmasi Tolak"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowRejectForm(false);
                        setNotes("");
                      }}
                      variant="outline"
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
