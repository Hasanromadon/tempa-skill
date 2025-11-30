"use client";

import { ColumnDef, DataTable } from "@/components/common";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser, useServerTable } from "@/hooks";
import { usePaymentStats } from "@/hooks/use-payments";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentWithDetails } from "@/types/api";
import { CreditCard, DollarSign, FileText, Mail, Search } from "lucide-react";
import { useMemo, useState } from "react";

interface PaymentListPageProps {
  /**
   * Base path for navigation (e.g., "/admin" or "/instructor")
   */
  basePath: string;
  /**
   * Page title
   */
  title?: string;
  /**
   * Page description
   */
  description?: string;
}

/**
 * Reusable Payment List Component
 * Supports both Admin and Instructor roles with conditional features:
 *
 * ADMIN MODE:
 * - View all transactions (all statuses)
 * - 3 stats cards (Total Revenue, Pending Amount, Total Transactions)
 * - Status filter dropdown
 * - View Details dialog
 * - Shows instructor name in course column
 *
 * INSTRUCTOR MODE:
 * - View only settlement transactions (auto-filtered by backend)
 * - 2 stats cards (My Revenue, Total Transactions)
 * - No status filter (settlement only)
 * - Email Student action instead of View Details
 * - No instructor name column (redundant)
 */
export function PaymentListPage({
  basePath,
  title = "Pembayaran",
  description = "Kelola dan pantau semua transaksi pembayaran",
}: PaymentListPageProps) {
  const { data: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] =
    useState<PaymentWithDetails | null>(null);

  // Server-side table with filters
  const table = useServerTable<PaymentWithDetails>({
    queryKey: ["payments", basePath],
    endpoint: API_ENDPOINTS.PAYMENT.LIST,
    initialLimit: 10,
    initialFilters: {},
  });

  // Payment statistics
  const { data: statsData, isLoading: statsLoading } = usePaymentStats();
  const stats = statsData?.data;

  // Table columns (conditional based on role)
  const columns = useMemo<ColumnDef<PaymentWithDetails>[]>(
    () => [
      {
        accessorKey: "order_id",
        header: "Order ID",
        cell: ({ row }) => (
          <div className="font-mono text-sm">{row.original.order_id}</div>
        ),
      },
      {
        accessorKey: "user_name",
        header: "Siswa",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.user_name}</div>
            <div className="text-xs text-gray-500">
              {row.original.user_email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "course_title",
        header: "Kursus",
        cell: ({ row }) => (
          <div className="max-w-xs">
            <div className="font-medium truncate">
              {row.original.course_title}
            </div>
            {/* Only show instructor name for admin */}
            {isAdmin && (
              <div className="text-xs text-gray-500">
                oleh {row.original.instructor_name}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "gross_amount",
        header: "Jumlah",
        cell: ({ row }) => (
          <div className="font-semibold">
            {formatCurrency(row.original.gross_amount)}
          </div>
        ),
      },
      // Status column only for admin
      ...(isAdmin
        ? [
            {
              accessorKey: "transaction_status" as const,
              header: "Status",
              cell: ({ row }: { row: { original: PaymentWithDetails } }) => {
                const status = row.original.transaction_status;
                const statusConfig: Record<
                  string,
                  { label: string; className: string }
                > = {
                  settlement: {
                    label: "Berhasil",
                    className: "bg-green-100 text-green-800",
                  },
                  pending: {
                    label: "Pending",
                    className: "bg-yellow-100 text-yellow-800",
                  },
                  expired: {
                    label: "Kadaluarsa",
                    className: "bg-gray-100 text-gray-800",
                  },
                  failed: {
                    label: "Gagal",
                    className: "bg-red-100 text-red-800",
                  },
                };

                const config = statusConfig[status] || {
                  label: status,
                  className: "bg-gray-100 text-gray-800",
                };

                return (
                  <Badge className={config.className} variant="secondary">
                    {config.label}
                  </Badge>
                );
              },
            },
          ]
        : []),
      {
        accessorKey: "payment_type",
        header: "Metode",
        cell: ({ row }) => (
          <div className="text-sm capitalize">
            {row.original.payment_type.replace("_", " ")}
          </div>
        ),
      },
      {
        accessorKey: "transaction_time",
        header: "Tanggal",
        cell: ({ row }) => (
          <div className="text-sm">
            {formatDate(row.original.transaction_time)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) =>
          isAdmin ? (
            // Admin: View Details
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPayment(row.original);
                setViewDetailsOpen(true);
              }}
            >
              Detail
            </Button>
          ) : (
            // Instructor: Email Student
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`mailto:${row.original.user_email}?subject=Mengenai Kursus ${row.original.course_title}`}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </Button>
          ),
      },
    ],
    [isAdmin]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>

      {/* Statistics Cards - Conditional based on role */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {isAdmin ? "Total Pendapatan" : "Pendapatan Saya"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.total_revenue ?? 0)}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Dari transaksi berhasil
            </p>
          </CardContent>
        </Card>

        {/* Pending Amount - Admin only */}
        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pembayaran Pending
              </CardTitle>
              <CreditCard className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.pending_amount ?? 0)}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">Menunggu pembayaran</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Transaksi
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {stats?.total_transactions ?? 0}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isAdmin ? "Semua status" : "Pembayaran berhasil"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters - Conditional based on role */}
      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? "Filter & Pencarian" : "Pencarian"}</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Gunakan filter untuk menemukan transaksi tertentu"
              : "Cari transaksi berdasarkan nama siswa"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={
                  isAdmin
                    ? "Cari nama atau email siswa..."
                    : "Cari nama siswa..."
                }
                value={table.filters.search}
                onChange={(e) => table.filters.setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter - Admin only */}
            {isAdmin && (
              <Select
                value={(table.filters.filters.status as string) || "all"}
                onValueChange={(value) =>
                  table.filters.setFilter(
                    "status",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="settlement">Berhasil</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="expired">Kadaluarsa</SelectItem>
                  <SelectItem value="failed">Gagal</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isAdmin ? "Daftar Transaksi" : "Daftar Pembayaran"}
          </CardTitle>
          <CardDescription>
            Menampilkan {table.total}{" "}
            {isAdmin ? "transaksi" : "transaksi berhasil"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable<PaymentWithDetails>
            columns={columns}
            data={table.data ?? []}
            page={table.filters.page}
            limit={table.filters.limit}
            total={table.total}
            totalPages={table.totalPages}
            isLoading={table.isLoading}
            isError={table.isError}
            onPageChange={table.filters.setPage}
            onPageSizeChange={table.filters.setLimit}
            pageSizeOptions={[10, 20, 50]}
            showPagination={true}
            showPageSizeSelector={true}
            emptyMessage="Tidak ada transaksi"
          />
        </CardContent>
      </Card>

      {/* View Details Dialog - Admin only */}
      {isAdmin && (
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detail Pembayaran</DialogTitle>
              <DialogDescription>
                Informasi lengkap transaksi pembayaran
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="space-y-4">
                {/* Order Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-500">
                    Informasi Order
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <p className="font-mono font-medium">
                        {selectedPayment.order_id}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium capitalize">
                        {selectedPayment.transaction_status}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Jumlah:</span>
                      <p className="font-semibold text-lg">
                        {formatCurrency(selectedPayment.gross_amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Metode Pembayaran:</span>
                      <p className="font-medium capitalize">
                        {selectedPayment.payment_type.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-500">
                    Informasi Siswa
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nama:</span>
                      <p className="font-medium">{selectedPayment.user_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">
                        {selectedPayment.user_email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Information */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-500">
                    Informasi Kursus
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Judul Kursus:</span>
                      <p className="font-medium">
                        {selectedPayment.course_title}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Instruktur:</span>
                      <p className="font-medium">
                        {selectedPayment.instructor_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transaction Dates */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-500">
                    Waktu Transaksi
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Dibuat:</span>
                      <p className="font-medium">
                        {formatDate(selectedPayment.transaction_time)}
                      </p>
                    </div>
                    {selectedPayment.settlement_time && (
                      <div>
                        <span className="text-gray-600">Selesai:</span>
                        <p className="font-medium">
                          {formatDate(selectedPayment.settlement_time)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
