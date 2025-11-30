"use client";

import { ColumnDef, DataTable } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useServerTable } from "@/hooks";
import { usePaymentStats } from "@/hooks/use-payments";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PaymentWithDetails } from "@/types/api";
import { DollarSign, FileText, Mail, Search } from "lucide-react";
import { useMemo } from "react";

/**
 * Instructor Payments Page
 *
 * Features:
 * - View only SETTLEMENT transactions from instructor's courses
 * - Filter by course, search student
 * - Stats: My Revenue (settlement only), Total Transactions
 * - Email student action
 * - NO status filter (auto-filtered to settlement)
 * - NO View Details button
 * - NO instructor column (redundant)
 */
export default function InstructorPaymentsPage() {
  // Server-side table with filters
  // Backend automatically filters to settlement + instructor's courses
  const table = useServerTable<PaymentWithDetails>({
    queryKey: ["instructor-payments"],
    endpoint: API_ENDPOINTS.PAYMENT.LIST,
    initialLimit: 10,
    initialFilters: {},
  });

  // Payment statistics (only settlement revenue for instructor)
  const { data: statsData, isLoading: statsLoading } = usePaymentStats();
  const stats = statsData?.data;

  // Table columns (simplified for instructor)
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
        cell: ({ row }) => (
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
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Pembayaran Saya</h1>
        <p className="text-gray-600 mt-1">Pantau pendapatan dari kursus Anda</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pendapatan Saya
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
            <p className="text-xs text-gray-500 mt-1">Pembayaran berhasil</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Pencarian</CardTitle>
          <CardDescription>
            Cari transaksi berdasarkan nama siswa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari nama siswa..."
              value={table.filters.search}
              onChange={(e) => table.filters.setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
          <CardDescription>
            Menampilkan {table.total} transaksi berhasil
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
    </div>
  );
}
