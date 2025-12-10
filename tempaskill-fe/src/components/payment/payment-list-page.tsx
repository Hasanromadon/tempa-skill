"use client";

import { formatCurrency } from "@/app/utils/format-currency";
import { formatDate } from "@/app/utils/format-date";
import { ColumnDef, DataTable } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useCurrentUser, useServerTable } from "@/hooks";
import { usePaymentStats } from "@/hooks/use-payments";
import { API_ENDPOINTS } from "@/lib/constants";

import type { PaymentWithDetails } from "@/types/api";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Filter,
  LucideProps,
  Mail,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  ForwardRefExoticComponent,
  RefAttributes,
  useMemo,
  useState,
} from "react";

interface PaymentListPageProps {
  basePath: string;
  title?: string;
  description?: string;
}

// Helper untuk status config
const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref">> &
      RefAttributes<SVGSVGElement>;
  }
> = {
  settlement: {
    label: "Berhasil",
    className: "bg-green-50 text-green-700 border-green-200",
    icon: CheckCircle2,
  },
  pending: {
    label: "Menunggu",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: Clock,
  },
  expired: {
    label: "Kadaluarsa",
    className: "bg-orange-50 text-orange-700 border-orange-200",
    icon: AlertCircle,
  },
  failed: {
    label: "Gagal",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  // Default fallback
  default: {
    label: "Unknown",
    className: "bg-slate-50 text-slate-700 border-slate-200",
    icon: AlertCircle,
  },
};

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
          <div className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded w-fit">
            {row.original.order_id}
          </div>
        ),
      },
      {
        accessorKey: "user_name",
        header: "Siswa",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-slate-900">
              {row.original.user_name}
            </div>
            <div className="text-xs text-slate-500">
              {row.original.user_email}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "course_title",
        header: "Kursus",
        cell: ({ row }) => (
          <div className="max-w-[200px]">
            <div
              className="font-medium text-slate-900 truncate"
              title={row.original.course_title}
            >
              {row.original.course_title}
            </div>
            {isAdmin && (
              <div className="text-xs text-slate-500 truncate">
                Oleh: {row.original.instructor_name}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "gross_amount",
        header: "Jumlah",
        cell: ({ row }) => (
          <div className="font-semibold text-slate-900">
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
                const config = STATUS_CONFIG[status] || STATUS_CONFIG.default;
                const Icon = config.icon;

                return (
                  <Badge
                    variant="outline"
                    className={`${config.className} gap-1 shadow-none font-medium`}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </Badge>
                );
              },
            },
          ]
        : []),
      {
        accessorKey: "transaction_time",
        header: "Tanggal",
        cell: ({ row }) => (
          <div className="text-sm text-slate-600">
            {formatDate(row.original.transaction_time)}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Aksi",
        cell: ({ row }) =>
          isAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
              onClick={() => {
                setSelectedPayment(row.original);
                setViewDetailsOpen(true);
              }}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Detail</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50"
              asChild
            >
              <a
                href={`mailto:${row.original.user_email}?subject=Mengenai Kursus ${row.original.course_title}`}
                className="flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="text-xs">Email</span>
              </a>
            </Button>
          ),
      },
    ],
    [isAdmin]
  );

  return (
    <div className="space-y-8">
      {/* 🌟 STATS CARDS */}
      <div
        className={`grid grid-cols-1 gap-4 ${
          isAdmin ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        <StatsCard
          title={isAdmin ? "Total Pendapatan" : "Pendapatan Saya"}
          value={formatCurrency(stats?.total_revenue ?? 0)}
          desc="Dari transaksi berhasil"
          icon={Wallet}
          color="green"
        />

        {isAdmin && (
          <StatsCard
            title="Pembayaran Pending"
            value={formatCurrency(stats?.pending_amount ?? 0)}
            desc="Menunggu pembayaran"
            icon={Clock}
            color="yellow"
          />
        )}

        <StatsCard
          title="Total Transaksi"
          value={stats?.total_transactions ?? 0}
          desc={isAdmin ? "Semua status" : "Pembayaran berhasil"}
          icon={FileText}
          color="blue"
        />
      </div>

      {/* 🌟 FILTERS & TABLE */}
      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <CardTitle className="text-base font-bold text-slate-800">
              {isAdmin ? "Semua Transaksi" : "Riwayat Transaksi"}
            </CardTitle>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder={isAdmin ? "Cari siswa..." : "Cari siswa..."}
                  value={table.filters.search}
                  onChange={(e) => table.filters.setSearch(e.target.value)}
                  className="pl-9 h-9 border-slate-200 text-sm"
                />
              </div>

              {/* Status Filter (Admin Only) */}
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
                  <SelectTrigger className="w-full sm:w-[160px] h-9 border-slate-200 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Filter className="h-3.5 w-3.5" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="settlement">Berhasil</SelectItem>
                    <SelectItem value="pending">Menunggu</SelectItem>
                    <SelectItem value="expired">Kadaluarsa</SelectItem>
                    <SelectItem value="failed">Gagal</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
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
            emptyMessage="Belum ada data transaksi."
          />
        </CardContent>
      </Card>

      {/* 🌟 VIEW DETAILS DIALOG (Admin Only) */}
      {isAdmin && (
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-2xl gap-0 p-0 overflow-hidden border-none shadow-xl">
            <DialogHeader className="px-6 py-4 border-b bg-slate-50">
              <DialogTitle className="text-lg font-bold text-slate-900">
                Detail Transaksi
              </DialogTitle>
              <DialogDescription className="text-slate-500">
                Informasi lengkap mengenai pembayaran ini.
              </DialogDescription>
            </DialogHeader>

            {selectedPayment && (
              <div className="p-6 space-y-6">
                {/* 1. Status Banner */}
                <div
                  className={`p-4 rounded-lg flex items-center justify-between ${
                    STATUS_CONFIG[selectedPayment.transaction_status]
                      ?.className || "bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold">
                    {/* Icon logic here if needed, simplified for brevity */}
                    Status:{" "}
                    {STATUS_CONFIG[selectedPayment.transaction_status]?.label ||
                      selectedPayment.transaction_status}
                  </div>
                  <div className="text-sm font-mono opacity-80">
                    #{selectedPayment.order_id}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Informasi Siswa
                      </h4>
                      <p className="font-medium text-slate-900">
                        {selectedPayment.user_name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {selectedPayment.user_email}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Metode Pembayaran
                      </h4>
                      <p className="font-medium text-slate-900 capitalize flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-slate-400" />
                        {selectedPayment.payment_type.replace("_", " ")}
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Kursus
                      </h4>
                      <p className="font-medium text-slate-900 line-clamp-2">
                        {selectedPayment.course_title}
                      </p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        Instruktur: {selectedPayment.instructor_name}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Waktu Transaksi
                      </h4>
                      <p className="text-sm text-slate-700">
                        {formatDate(selectedPayment.transaction_time)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-slate-500 font-medium">
                    Total Pembayaran
                  </span>
                  <span className="text-2xl font-bold text-slate-900">
                    {formatCurrency(selectedPayment.gross_amount)}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setViewDetailsOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// --- SUB COMPONENT: Stats Card ---
function StatsCard({
  title,
  value,
  desc,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  desc: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color: "green" | "yellow" | "blue";
}) {
  const styles = {
    green: "bg-green-50 text-green-600 border-green-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="text-2xl font-bold text-slate-900 mt-1 mb-0.5">
            {value}
          </div>
          <p className="text-xs text-slate-400">{desc}</p>
        </div>
        <div className={`p-2.5 rounded-xl border ${styles[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
