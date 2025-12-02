"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { AlertCircle, ArrowLeft, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(
        err.response?.data?.error || "Gagal menambahkan rekening bank"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/instructor/withdrawals">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Rekening Bank</h1>

      {/* Verified Account Card */}
      {verifiedAccount && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rekening Aktif</CardTitle>
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Terverifikasi
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600">Nama Bank</Label>
              <p className="text-lg font-medium">{verifiedAccount.bank_name}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Nomor Rekening</Label>
              <p className="text-lg font-medium">
                {verifiedAccount.account_number}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">
                Nama Pemegang Rekening
              </Label>
              <p className="text-lg font-medium">
                {verifiedAccount.account_holder_name}
              </p>
            </div>
            {verifiedAccount.verified_at && (
              <div className="text-sm text-gray-500">
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

      {/* Pending Account Card */}
      {pendingAccount && !isRejected && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Pengajuan {verifiedAccount ? "Perubahan " : ""}Rekening
              </CardTitle>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Menunggu Verifikasi
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-600">Nama Bank</Label>
              <p className="text-lg font-medium">{pendingAccount.bank_name}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">Nomor Rekening</Label>
              <p className="text-lg font-medium">
                {pendingAccount.account_number}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-600">
                Nama Pemegang Rekening
              </Label>
              <p className="text-lg font-medium">
                {pendingAccount.account_holder_name}
              </p>
            </div>

            <Alert className="border-yellow-200 bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                {verifiedAccount
                  ? "Pengajuan perubahan rekening sedang dalam proses verifikasi. Rekening aktif Anda akan diganti setelah pengajuan ini disetujui."
                  : "Rekening sedang dalam proses verifikasi oleh admin. Anda akan dapat melakukan penarikan setelah rekening terverifikasi."}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Rejected Account Alert */}
      {isRejected && pendingAccount && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
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
              Silakan ajukan ulang dengan data yang benar menggunakan form di
              bawah.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Form untuk tambah/ganti rekening */}
      {!hasPending && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>
                {verifiedAccount
                  ? "Ajukan Perubahan Rekening"
                  : "Tambah Rekening Bank"}
              </CardTitle>
              <CardDescription>
                {verifiedAccount
                  ? "Rekening baru akan menggantikan rekening aktif setelah diverifikasi admin"
                  : "Rekening ini akan digunakan untuk menerima dana penarikan Anda"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Pastikan data rekening yang Anda masukkan benar. Rekening akan
                  diverifikasi oleh admin sebelum dapat digunakan untuk
                  penarikan.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="bank_name">Nama Bank</Label>
                <Input
                  id="bank_name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Contoh: BCA, Mandiri, BNI"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="account_number">Nomor Rekening</Label>
                <Input
                  id="account_number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Contoh: 1234567890"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="account_holder_name">
                  Nama Pemegang Rekening
                </Label>
                <Input
                  id="account_holder_name"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="Sesuai dengan buku rekening"
                  required
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nama harus sama persis dengan nama di buku rekening bank Anda
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={createBankAccount.isPending}
              >
                {createBankAccount.isPending
                  ? "Menyimpan..."
                  : verifiedAccount
                  ? "Ajukan Perubahan"
                  : "Simpan Rekening"}
              </Button>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}
