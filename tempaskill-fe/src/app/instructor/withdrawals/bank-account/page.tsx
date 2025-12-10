"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useBankAccount, useCreateBankAccount } from "@/hooks/use-withdrawal";
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  Clock,
  CreditCard,
  Info,
  Loader2,
  Save,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

// ✅ Type Definitions
interface ApiError {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
  message?: string;
}

export default function BankAccountPage() {
  const router = useRouter();
  const { data: accountsData, isLoading } = useBankAccount();
  const createBankAccount = useCreateBankAccount();

  const verifiedAccount = accountsData?.verified;
  const pendingAccount = accountsData?.pending;
  const isRejected = pendingAccount?.verification_status === "rejected";
  const hasPending = pendingAccount?.verification_status === "pending";

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bankName || !accountNumber || !accountHolderName) {
      toast.error("Semua field harus diisi");
      return;
    }

    try {
      await createBankAccount.mutateAsync({
        bank_name: bankName,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
      });

      toast.success(
        "Rekening bank berhasil ditambahkan. Menunggu verifikasi admin."
      );
      router.push("/instructor/withdrawals");
    } catch (err: unknown) {
      const error = err as ApiError;
      toast.error("Gagal menambahkan rekening", {
        description:
          error.response?.data?.error?.message ||
          error.message ||
          "Terjadi kesalahan saat menyimpan data.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 px-4">
        <div className="container mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 🌟 1. CLEAN HEADER */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-2xl">
          <div className="flex items-center gap-4">
            <Link
              href="/instructor/withdrawals"
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900">
              Pengaturan Rekening
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* 🌟 2. EXISTING ACCOUNT CARD */}
        {verifiedAccount && (
          <Card className="border-green-200 bg-green-50/50 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-green-100 bg-white/50 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-green-900 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" /> Rekening Utama
                </CardTitle>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Terverifikasi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-green-700 font-medium uppercase tracking-wide">
                    Bank
                  </Label>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">
                    {verifiedAccount.bank_name}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-green-700 font-medium uppercase tracking-wide">
                    Nomor Rekening
                  </Label>
                  <p className="text-lg font-mono font-medium text-slate-900 mt-0.5">
                    {verifiedAccount.account_number}
                  </p>
                </div>
              </div>
              <div>
                <Label className="text-xs text-green-700 font-medium uppercase tracking-wide">
                  Atas Nama
                </Label>
                <p className="text-base font-medium text-slate-900 mt-0.5">
                  {verifiedAccount.account_holder_name}
                </p>
              </div>

              {verifiedAccount.verified_at && (
                <div className="pt-4 border-t border-green-200/50 text-xs text-green-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Diverifikasi pada{" "}
                  {new Date(verifiedAccount.verified_at).toLocaleDateString(
                    "id-ID",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 🌟 3. PENDING / REJECTED STATUS */}
        {pendingAccount && !isRejected && (
          <Alert className="bg-yellow-50 border-yellow-200 text-yellow-900 shadow-sm">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 font-bold mb-1">
              Menunggu Verifikasi
            </AlertTitle>
            <AlertDescription>
              <div className="space-y-2">
                <p>
                  {verifiedAccount
                    ? "Pengajuan perubahan rekening sedang diproses admin."
                    : "Rekening baru Anda sedang diproses admin."}
                </p>
                <div className="bg-white/50 p-3 rounded border border-yellow-100 text-sm">
                  <p className="font-medium">
                    {pendingAccount.bank_name} - {pendingAccount.account_number}
                  </p>
                  <p className="text-xs text-yellow-700">
                    a.n {pendingAccount.account_holder_name}
                  </p>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {isRejected && pendingAccount && (
          <Alert className="bg-red-50 border-red-200 text-red-900 shadow-sm">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800 font-bold mb-1">
              Pengajuan Ditolak
            </AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Mohon maaf, pengajuan rekening Anda ditolak. Silakan periksa
                kembali data dan ajukan ulang.
              </p>
              {pendingAccount.verification_notes && (
                <div className="bg-white/50 p-3 rounded border border-red-100 text-sm italic">
                  &quot;{pendingAccount.verification_notes}&quot;
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* 🌟 4. FORM SECTION */}
        {!hasPending && (
          <Card className="border border-slate-200 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900">
                {verifiedAccount
                  ? "Ajukan Perubahan Rekening"
                  : "Tambah Rekening Baru"}
              </CardTitle>
              <CardDescription>
                Pastikan data sesuai dengan buku tabungan Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-2">
                  <Label
                    htmlFor="bank_name"
                    className="text-slate-700 font-medium"
                  >
                    Nama Bank
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="bank_name"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Contoh: BCA, Mandiri, BNI"
                      required
                      className="pl-10 h-11 focus-visible:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="account_number"
                    className="text-slate-700 font-medium"
                  >
                    Nomor Rekening
                  </Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="account_number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Contoh: 1234567890"
                      required
                      className="pl-10 h-11 focus-visible:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label
                    htmlFor="account_holder_name"
                    className="text-slate-700 font-medium"
                  >
                    Nama Pemegang Rekening
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="account_holder_name"
                      value={accountHolderName}
                      onChange={(e) => setAccountHolderName(e.target.value)}
                      placeholder="Harus sama persis dengan buku tabungan"
                      required
                      className="pl-10 h-11 focus-visible:ring-orange-500"
                    />
                  </div>
                  <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mt-1">
                    <Info className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>
                      Nama yang tidak sesuai dapat menyebabkan penolakan
                      verifikasi atau kegagalan transfer.
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white h-11 font-medium shadow-md shadow-orange-100 transition-all active:scale-95"
                    disabled={createBankAccount.isPending}
                  >
                    {createBankAccount.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {verifiedAccount
                          ? "Ajukan Perubahan"
                          : "Simpan Rekening"}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
