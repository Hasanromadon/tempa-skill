"use client";

import { EmptyState, LoadingScreen } from "@/components/common";
import { SiteHeader } from "@/components/common/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsAuthenticated, usePaymentHistory } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  History,
  Receipt,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { formatCurrency } from "../utils/format-currency";

// Helper function to calculate payment expiry
function getPaymentTimeInfo(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const hoursOld = (now - createdTime) / (1000 * 60 * 60);
  const isExpired = hoursOld >= 24;
  const hoursRemaining = Math.max(0, 24 - Math.floor(hoursOld));

  return { isExpired, hoursRemaining };
}

const STATUS_CONFIG = {
  pending: {
    label: "Menunggu Pembayaran",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  paid: {
    label: "Berhasil",
    color: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  settlement: {
    label: "Berhasil",
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
    icon: XCircle,
  },
  expired: {
    label: "Kadaluarsa",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    icon: AlertCircle,
  },
} as const;

export default function PaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();
  const { data: payments, isLoading: paymentsLoading } = usePaymentHistory();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || paymentsLoading) {
    return <LoadingScreen message="Memuat riwayat pembayaran..." />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 🌟 1. CLEAN HEADER */}
      <SiteHeader title="Riwayat Pembayaran" backHref={ROUTES.DASHBOARD} />
      <div className="container mx-auto px-4 py-8">
        {!payments || payments.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={Receipt}
              title="Belum ada transaksi"
              description="Anda belum melakukan pembayaran untuk kursus manapun."
              action={{
                label: "Jelajahi Kursus",
                onClick: () => router.push(ROUTES.COURSES),
              }}
            />
          </div>
        ) : (
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* 🌟 2. SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Total Transaksi
                  </CardTitle>
                  <History className="h-4 w-4 text-slate-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {payments.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    riwayat pembayaran
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">
                    Pembayaran Berhasil
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {
                      payments.filter((p) =>
                        ["settlement", "paid"].includes(p.transaction_status)
                      ).length
                    }
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    transaksi sukses
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-slate-200 shadow-sm bg-linear-to-br from-orange-50 to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">
                    Total Pengeluaran
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      payments
                        .filter((p) =>
                          ["settlement", "paid"].includes(p.transaction_status)
                        )
                        .reduce((sum, p) => sum + p.gross_amount, 0)
                    )}
                  </div>
                  <p className="text-xs text-orange-600/80 mt-1">
                    investasi untuk ilmu
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 🌟 3. TRANSACTION LIST */}
            <Card className="border border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
                <CardTitle className="text-base font-bold text-slate-900">
                  Daftar Transaksi Terakhir
                </CardTitle>
              </CardHeader>
              <div className="divide-y divide-slate-100">
                {payments.map((payment) => {
                  const statusConfig =
                    STATUS_CONFIG[
                      payment.transaction_status as keyof typeof STATUS_CONFIG
                    ] || STATUS_CONFIG.pending;
                  const StatusIcon = statusConfig.icon;

                  const { isExpired, hoursRemaining } = getPaymentTimeInfo(
                    payment.created_at
                  );

                  return (
                    <div
                      key={payment.order_id}
                      className="group flex flex-col md:flex-row md:items-center justify-between p-6 hover:bg-slate-50/50 transition-colors gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-50 rounded-xl shrink-0 group-hover:bg-orange-100 transition-colors">
                          <Receipt className="h-6 w-6 text-orange-600" />
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1">
                            {payment.course_title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mb-2">
                            <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                              #{payment.order_id}
                            </span>
                            <span>
                              {new Date(
                                payment.transaction_time
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {/* Status Messages */}
                          {payment.transaction_status === "pending" &&
                            !isExpired && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 w-fit px-2 py-1 rounded">
                                <Clock className="w-3 h-3" />
                                Menunggu pembayaran (Sisa {hoursRemaining} jam)
                              </div>
                            )}
                          {payment.transaction_status === "pending" &&
                            isExpired && (
                              <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 w-fit px-2 py-1 rounded">
                                <AlertCircle className="w-3 h-3" />
                                Pembayaran kadaluarsa
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="flex flex-col md:items-end gap-3 ml-14 md:ml-0">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg text-slate-900">
                            {formatCurrency(payment.gross_amount)}
                          </span>
                          <Badge
                            variant="outline"
                            className={`${statusConfig.color} border shadow-none`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1.5" />
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 w-full md:w-auto">
                          {payment.transaction_status === "pending" &&
                            !isExpired &&
                            payment.payment_url && (
                              <Button
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm w-full md:w-auto"
                                onClick={() => {
                                  window.open(payment.payment_url, "_blank");
                                  toast.info("Halaman Pembayaran Dibuka", {
                                    description:
                                      "Silakan selesaikan pembayaran di tab baru.",
                                  });
                                }}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Bayar Sekarang
                              </Button>
                            )}

                          {payment.transaction_status === "pending" &&
                            isExpired && (
                              <Link
                                href={`/courses/${payment.course_id}`}
                                className="w-full md:w-auto"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                                >
                                  <ArrowRight className="h-4 w-4 mr-2" />
                                  Beli Ulang
                                </Button>
                              </Link>
                            )}

                          {["settlement", "paid"].includes(
                            payment.transaction_status
                          ) && (
                            <Link
                              href={ROUTES.COURSES}
                              className="w-full md:w-auto"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                              >
                                Lihat Kursus
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 🌟 4. HELP SECTION */}
            <Alert className="bg-blue-50 border-blue-100 text-blue-900">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800 font-bold mb-2">
                Panduan Pembayaran
              </AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm space-y-1 text-blue-700/90 ml-1">
                  <li>
                    Pembayaran pending berlaku selama <strong>24 jam</strong>{" "}
                    dari waktu pemesanan.
                  </li>
                  <li>
                    Klik tombol <strong>&quot;Bayar Sekarang&quot;</strong>{" "}
                    untuk melanjutkan ke halaman pembayaran Midtrans.
                  </li>
                  <li>
                    Jika pembayaran kadaluarsa, silakan lakukan pemesanan ulang
                    pada halaman kursus.
                  </li>
                  <li>
                    Butuh bantuan? Hubungi tim support kami di{" "}
                    <strong>support@tempaskill.com</strong>.
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
