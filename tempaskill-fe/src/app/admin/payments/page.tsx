"use client";

import { LoadingScreen } from "@/components/common";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useIsAuthenticated,
  usePaymentHistory,
  type PaymentTransaction,
} from "@/hooks";
import { ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();
  const { data: payments, isLoading: paymentsLoading } = usePaymentHistory();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading || paymentsLoading) {
    return <LoadingScreen message="Memuat data pembayaran..." />;
  }

  if (!user || user.role !== "admin") return null;

  // Calculate analytics
  const totalPayments = payments?.length || 0;
  const successfulPayments =
    payments?.filter((p) => p.transaction_status === "settlement") || [];
  const totalRevenue = successfulPayments.reduce(
    (sum, p) => sum + p.gross_amount,
    0
  );
  const pendingPayments =
    payments?.filter((p) => p.transaction_status === "pending") || [];

  // Group payments by status for charts
  const statusCounts =
    payments?.reduce((acc, payment) => {
      acc[payment.transaction_status] =
        (acc[payment.transaction_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Manajemen Pembayaran
          </h1>
          <p className="text-gray-600 mt-1">
            Pantau transaksi dan analisis pendapatan platform
          </p>
        </div>
        <Link href={ROUTES.ADMIN.DASHBOARD}>
          <Button variant="outline">Kembali ke Dashboard</Button>
        </Link>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transaksi
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPayments}</div>
            <p className="text-xs text-muted-foreground">semua transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transaksi Berhasil
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {successfulPayments.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalPayments > 0
                ? Math.round((successfulPayments.length / totalPayments) * 100)
                : 0}
              % sukses rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pendapatan
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              dari pembayaran berhasil
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Menunggu Pembayaran
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingPayments.length}
            </div>
            <p className="text-xs text-muted-foreground">perlu perhatian</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Status Pembayaran</CardTitle>
          <CardDescription>Distribusi status semua transaksi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = statusCounts[status] || 0;
              const Icon = config.icon;
              return (
                <div key={status} className="text-center">
                  <div
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${config.color}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{count}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{config.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
          <CardDescription>
            Semua transaksi pembayaran di platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">Semua ({totalPayments})</TabsTrigger>
              <TabsTrigger value="pending">
                Menunggu ({pendingPayments.length})
              </TabsTrigger>
              <TabsTrigger value="paid">
                Berhasil ({successfulPayments.length})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Gagal ({statusCounts.failed || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <PaymentTable payments={payments || []} />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <PaymentTable payments={pendingPayments} />
            </TabsContent>

            <TabsContent value="paid" className="mt-6">
              <PaymentTable payments={successfulPayments} />
            </TabsContent>

            <TabsContent value="failed" className="mt-6">
              <PaymentTable
                payments={
                  payments?.filter((p) => p.transaction_status === "failure") ||
                  []
                }
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Activity Alert */}
      {pendingPayments.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>
              {pendingPayments.length} transaksi menunggu pembayaran.
            </strong>{" "}
            Monitor transaksi ini secara berkala untuk memastikan kelancaran
            proses pembayaran.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function PaymentTable({ payments }: { payments: PaymentTransaction[] }) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Tidak ada transaksi dalam kategori ini
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Pengguna</TableHead>
          <TableHead>Kursus</TableHead>
          <TableHead>Jumlah</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal</TableHead>
          <TableHead>Aksi</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => {
          const statusConfig =
            STATUS_CONFIG[
              payment.transaction_status as keyof typeof STATUS_CONFIG
            ] || STATUS_CONFIG.pending;
          const StatusIcon = statusConfig.icon;

          return (
            <TableRow key={payment.order_id}>
              <TableCell className="font-mono text-sm">
                {payment.order_id}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{payment.user_name}</div>
                  <div className="text-sm text-gray-500">
                    User ID: {payment.user_id}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{payment.course_title}</div>
                  <div className="text-sm text-gray-500">
                    {formatCurrency(payment.gross_amount)}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(payment.gross_amount)}
              </TableCell>
              <TableCell>
                <Badge className={statusConfig.color}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {statusConfig.label}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(payment.transaction_time).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {payment.payment_url &&
                    payment.transaction_status === "pending" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(payment.payment_url, "_blank")
                        }
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Link
                      </Button>
                    )}
                  <Button variant="outline" size="sm">
                    Kursus
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
