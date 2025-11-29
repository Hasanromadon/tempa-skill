"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks";
import {
  BookOpen,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount === 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statCards = [
    {
      label: "Total Kursus",
      value: stats?.total_courses ?? 0,
      subtitle: `${stats?.published_courses ?? 0} dipublikasi`,
      icon: BookOpen,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      label: "Total Siswa",
      value: stats?.total_students ?? 0,
      subtitle: `${stats?.total_enrollments ?? 0} pendaftaran`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Total Instruktur",
      value: stats?.total_instructors ?? 0,
      subtitle: `Pengajar aktif`,
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      label: "Total Pendapatan",
      value: formatCurrency(stats?.total_revenue ?? 0),
      subtitle: `${stats?.completed_payments ?? 0} transaksi berhasil`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Total Pelajaran",
      value: stats?.total_lessons ?? 0,
      subtitle: "Konten pembelajaran",
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      label: "Sesi Mendatang",
      value: stats?.upcoming_sessions ?? 0,
      subtitle: `dari ${stats?.total_sessions ?? 0} total sesi`,
      icon: Calendar,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      label: "Pembayaran Pending",
      value: stats?.pending_payments ?? 0,
      subtitle: "Menunggu konfirmasi",
      icon: CreditCard,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Kursus Tidak Dipublikasi",
      value: stats?.unpublished_courses ?? 0,
      subtitle: "Draft kursus",
      icon: TrendingUp,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang di panel admin TempaSKill
        </p>
      </div>

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Gagal memuat statistik dashboard. Silakan refresh halaman.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? // Loading skeleton
            [...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-9 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))
          : // Real data
            statCards.map((stat) => (
              <Card
                key={stat.label}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/courses/new"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Buat Kursus Baru</p>
                <p className="text-sm text-gray-500">
                  Tambah kursus ke platform
                </p>
              </div>
            </a>

            <a
              href="/admin/users"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Kelola Pengguna</p>
                <p className="text-sm text-gray-500">Lihat daftar pengguna</p>
              </div>
            </a>

            <a
              href="/admin/settings"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Lihat Laporan</p>
                <p className="text-sm text-gray-500">Analitik platform</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
