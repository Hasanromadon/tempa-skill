"use client";

import { PaymentListPage } from "@/components/payment/payment-list-page";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, Wallet } from "lucide-react";
import Link from "next/link";

/**
 * Instructor Payments Page
 * - Menampilkan riwayat transaksi masuk (Revenue).
 * - Memberikan akses cepat ke halaman Penarikan (Withdrawals).
 * - Memberikan informasi kebijakan settlement.
 */
export default function InstructorPaymentsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 🌟 1. HEADER (Sticky & Clean) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Pendapatan & Pembayaran
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Kelola pemasukan dari penjualan kursus Anda.
            </p>
          </div>

          {/* Withdrawal Action */}
          <div>
            <Link href="/instructor/withdrawals">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-100 transition-all active:scale-95">
                <Wallet className="h-4 w-4 mr-2" />
                Tarik Dana
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 🌟 2. INFORMATIVE BANNER (UX Improvement) */}
        <Alert className="bg-blue-50 border-blue-100 text-blue-900 shadow-sm">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-bold text-blue-800 text-sm mb-1">
            Informasi Pencairan Dana
          </AlertTitle>
          <AlertDescription className="text-blue-700/90 text-sm leading-relaxed">
            Dana dari penjualan kursus akan masuk ke yang telah diverifikasi
            <strong>Saldo Dapat Ditarik</strong> secara otomatis dalam waktu
            1x24 jam setelah transaksi dinyatakan berhasil (settlement).
          </AlertDescription>
        </Alert>

        {/* 🌟 3. PAYMENT LIST COMPONENT */}
        {/* Kita menggunakan komponen reusable yang sudah ada, namun dibungkus layout halaman ini */}
        <PaymentListPage
          basePath="/instructor"
          title="Riwayat Transaksi Masuk"
          description="Daftar lengkap pembelian kursus oleh siswa."
        />
      </div>
    </div>
  );
}
