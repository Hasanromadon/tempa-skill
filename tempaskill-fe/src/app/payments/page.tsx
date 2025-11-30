"use client";

import { EmptyState, LoadingScreen, PageHeader } from "@/components/common";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsAuthenticated, usePaymentHistory } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  ExternalLink,
  Receipt,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

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
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  paid: {
    label: "Berhasil",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
  failed: {
    label: "Gagal",
    color: "bg-red-100 text-red-800",
    icon: XCircle,
  },
  cancelled: {
    label: "Dibatalkan",
    color: "bg-gray-100 text-gray-800",
    icon: AlertCircle,
  },
  expired: {
    label: "Kadaluarsa",
    color: "bg-orange-100 text-orange-800",
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Riwayat Pembayaran"
        description="Lihat semua transaksi dan status pembayaran Anda"
        backHref={ROUTES.DASHBOARD}
      />

      <div className="container mx-auto px-4 py-8">
        {!payments || payments.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Belum ada pembayaran"
            description="Anda belum melakukan pembayaran untuk kursus manapun."
            action={{
              label: "Jelajahi Kursus",
              onClick: () => router.push(ROUTES.COURSES),
            }}
          />
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Pembayaran
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{payments.length}</div>
                  <p className="text-xs text-muted-foreground">transaksi</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pembayaran Berhasil
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {
                      payments.filter(
                        (p) => p.transaction_status === "settlement"
                      ).length
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">berhasil</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Nominal
                  </CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(
                      payments
                        .filter((p) => p.transaction_status === "settlement")
                        .reduce((sum, p) => sum + p.gross_amount, 0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    berhasil dibayar
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payments List */}
            <Card>
              <CardHeader>
                <CardTitle>Daftar Pembayaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment) => {
                    const statusConfig =
                      STATUS_CONFIG[
                        payment.transaction_status as keyof typeof STATUS_CONFIG
                      ] || STATUS_CONFIG.pending;
                    const StatusIcon = statusConfig.icon;

                    // Calculate if payment is still valid (within 24 hours)
                    const { isExpired, hoursRemaining } = getPaymentTimeInfo(
                      payment.created_at
                    );

                    // Debug log
                    console.log("Payment item:", {
                      order_id: payment.order_id,
                      status: payment.transaction_status,
                      payment_url: payment.payment_url,
                      isExpired,
                      course_id: payment.course_id,
                    });

                    return (
                      <div
                        key={payment.order_id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Receipt className="h-5 w-5 text-orange-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {payment.course_title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Order ID: {payment.order_id}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(
                                payment.transaction_time
                              ).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {payment.transaction_status === "pending" &&
                              !isExpired && (
                                <p className="text-xs text-orange-600 mt-1">
                                  ⏰ Berlaku {hoursRemaining} jam lagi
                                </p>
                              )}
                            {payment.transaction_status === "pending" &&
                              isExpired && (
                                <p className="text-xs text-red-600 mt-1">
                                  ⚠️ Pembayaran kadaluarsa, silakan buat
                                  transaksi baru
                                </p>
                              )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-semibold">
                              {formatCurrency(payment.gross_amount)}
                            </div>
                            <Badge className={statusConfig.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig.label}
                            </Badge>
                          </div>

                          {/* Tombol untuk pending payment yang masih valid */}
                          {payment.transaction_status === "pending" &&
                            !isExpired &&
                            payment.payment_url && (
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-orange-600 hover:bg-orange-700"
                                onClick={() => {
                                  window.open(payment.payment_url, "_blank");
                                  toast.info("Halaman Pembayaran Dibuka", {
                                    description: `Silakan selesaikan pembayaran di tab baru. Pembayaran berlaku ${hoursRemaining} jam lagi.`,
                                  });
                                }}
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Bayar Sekarang
                              </Button>
                            )}

                          {/* Tombol untuk pending payment yang kadaluarsa */}
                          {payment.transaction_status === "pending" &&
                            isExpired && (
                              <Link href={`/courses/${payment.course_id}`}>
                                <Button variant="outline" size="sm">
                                  Bayar Ulang
                                </Button>
                              </Link>
                            )}

                          {/* Tombol untuk payment yang berhasil */}
                          {payment.transaction_status === "settlement" && (
                            <Link href={ROUTES.COURSES}>
                              <Button variant="outline" size="sm">
                                Lihat Kursus
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Help Section */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>
                    <strong>Informasi Pembayaran:</strong>
                  </p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>
                      Pembayaran pending berlaku selama <strong>24 jam</strong>
                    </li>
                    <li>
                      Klik <strong>&quot;Bayar Sekarang&quot;</strong> untuk
                      melanjutkan pembayaran yang belum selesai
                    </li>
                    <li>
                      Jika pembayaran kadaluarsa, klik{" "}
                      <strong>&quot;Bayar Ulang&quot;</strong> untuk membuat
                      transaksi baru
                    </li>
                    <li>
                      Butuh bantuan? Hubungi{" "}
                      <strong>support@tempaskill.com</strong>
                    </li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  );
}
