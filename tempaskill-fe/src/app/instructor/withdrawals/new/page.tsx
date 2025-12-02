"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useBalance,
  useBankAccount,
  useCreateWithdrawal,
} from "@/hooks/use-withdrawal";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, ArrowLeft, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NewWithdrawalPage() {
  const router = useRouter();
  const { data: balance, isLoading: balanceLoading } = useBalance();
  const { data: bankAccountData, isLoading: bankLoading } = useBankAccount();
  const createWithdrawal = useCreateWithdrawal();

  const verifiedAccount = bankAccountData?.verified;

  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount);

    if (!amountNum || amountNum < 50000) {
      toast.error("Minimal penarikan Rp 50.000");
      return;
    }

    if (amountNum > 10000000) {
      toast.error("Maksimal penarikan Rp 10.000.000 per transaksi");
      return;
    }

    if (!balance || amountNum > balance.available_balance) {
      toast.error("Saldo tersedia tidak mencukupi");
      return;
    }

    if (!verifiedAccount?.id) {
      toast.error("Rekening bank belum terdaftar atau belum diverifikasi");
      return;
    }

    try {
      await createWithdrawal.mutateAsync({
        amount: amountNum,
        bank_account_id: verifiedAccount.id,
        notes: notes || undefined,
      });

      toast.success("Permintaan penarikan berhasil dibuat");
      router.push("/instructor/withdrawals");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(
        err.response?.data?.error || "Gagal membuat permintaan penarikan"
      );
    }
  };

  if (balanceLoading || bankLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!verifiedAccount) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Anda belum memiliki rekening bank yang terverifikasi.{" "}
            <Link
              href="/instructor/withdrawals/bank-account"
              className="font-medium underline"
            >
              Tambahkan sekarang
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const adminFee = parseFloat(amount) * 0.025 || 0;
  const netAmount = parseFloat(amount) - adminFee || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/instructor/withdrawals">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Tarik Dana</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-600" />
              Saldo Tersedia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(balance?.available_balance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rekening Tujuan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{verifiedAccount.bank_name}</p>
              <p className="text-gray-600">{verifiedAccount.account_number}</p>
              <p className="text-sm text-gray-500">
                {verifiedAccount.account_holder_name}
              </p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detail Penarikan</CardTitle>
              <CardDescription>
                Min: Rp 50.000 | Max: Rp 10.000.000 | Biaya admin: 2,5%
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Jumlah Penarikan</Label>
                <Input
                  id="amount"
                  type="number"
                  min="50000"
                  max="10000000"
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="50000"
                  required
                  className="mt-1"
                />
              </div>

              {amount && parseFloat(amount) >= 50000 && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Jumlah Penarikan:</span>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(amount))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Biaya Admin (2,5%):</span>
                    <span className="font-medium">
                      -{formatCurrency(adminFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t">
                    <span>Total Diterima:</span>
                    <span className="text-green-600">
                      {formatCurrency(netAmount)}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan jika diperlukan"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  Dana akan diproses oleh admin dalam 1-3 hari kerja setelah
                  permintaan disetujui.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={
                  createWithdrawal.isPending ||
                  !amount ||
                  parseFloat(amount) < 50000 ||
                  parseFloat(amount) > (balance?.available_balance || 0)
                }
              >
                {createWithdrawal.isPending
                  ? "Memproses..."
                  : "Ajukan Penarikan"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
