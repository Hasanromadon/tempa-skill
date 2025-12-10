"use client";

import { formatCurrency } from "@/app/utils/format-currency";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks";
import { useCurrentUser } from "@/hooks/use-auth";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LucideProps,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes, useMemo } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  desc: string;
  icon: ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
  >;
  color: string;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats();
  const { data: user } = useCurrentUser();

  const isInstructor = user?.role === "instructor";
  const isAdmin = user?.role === "admin";

  const statCards = useMemo(() => {
    const cards: StatsCardProps[] = [
      {
        label: "Total Kursus",
        value: stats?.total_courses ?? 0,
        desc: `${stats?.published_courses ?? 0} dipublikasi`,
        icon: BookOpen,
        color: "orange",
      },
      {
        label: isInstructor ? "Siswa Saya" : "Total Siswa",
        value: stats?.total_students ?? 0,
        desc: `${stats?.total_enrollments ?? 0} pendaftaran`,
        icon: Users,
        color: "blue",
      },
    ];

    if (isAdmin) {
      cards.push({
        label: "Total Instruktur",
        value: stats?.total_instructors ?? 0,
        desc: "Pengajar aktif",
        icon: GraduationCap,
        color: "purple",
      });
    }

    cards.push(
      {
        label: "Total Pendapatan",
        value: formatCurrency(stats?.total_revenue ?? 0) as string,
        desc: `${stats?.completed_payments ?? 0} transaksi sukses`,
        icon: DollarSign,
        color: "green",
      },
      {
        label: "Total Pelajaran",
        value: stats?.total_lessons ?? 0,
        desc: "Materi konten",
        icon: FileText,
        color: "indigo",
      },
      {
        label: "Sesi Live",
        value: stats?.upcoming_sessions ?? 0,
        desc: `Dari ${stats?.total_sessions ?? 0} total sesi`,
        icon: Calendar,
        color: "pink",
      },
      {
        label: "Pembayaran Pending",
        value: stats?.pending_payments ?? 0,
        desc: "Menunggu konfirmasi",
        icon: CreditCard,
        color: "yellow",
      },
      {
        label: "Draft Kursus",
        value: stats?.unpublished_courses ?? 0,
        desc: "Belum dipublikasi",
        icon: TrendingUp,
        color: "slate",
      }
    );

    return cards;
  }, [stats, isInstructor, isAdmin]);

  const quickActions = useMemo(() => {
    const actions = [
      {
        href: "/admin/courses/new",
        icon: BookOpen,
        color: "orange",
        label: "Buat Kursus Baru",
        desc: "Tambah kursus ke platform",
      },
    ];

    if (isAdmin) {
      actions.push({
        href: "/admin/users",
        icon: Users,
        color: "blue",
        label: "Kelola Pengguna",
        desc: "Lihat daftar pengguna",
      });
    }

    if (isInstructor) {
      actions.push({
        href: "/instructor/students",
        icon: GraduationCap,
        color: "blue",
        label: "Siswa Saya",
        desc: "Kelola siswa kursus",
      });
    }

    actions.push({
      href: "/admin/settings", // Ganti jika route laporan berbeda
      icon: LayoutDashboard,
      color: "purple",
      label: "Lihat Laporan",
      desc: "Analitik platform",
    });

    return actions;
  }, [isAdmin, isInstructor]);

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Gagal memuat data dashboard. Silakan coba muat ulang halaman.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 🌟 1. HEADER (Sticky) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isInstructor ? "Dashboard Instruktur" : "Dashboard Admin"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ringkasan aktivitas dan performa platform.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 🌟 2. STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? [...Array(8)].map((_, i) => (
                <Card key={i} className="border-slate-200 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat, idx) => (
                <StatsCard
                  key={idx}
                  title={stat.label}
                  value={stat.value}
                  desc={stat.desc}
                  icon={stat.icon}
                  color={
                    stat.color as
                      | "orange"
                      | "slate"
                      | "blue"
                      | "green"
                      | "purple"
                      | "indigo"
                      | "pink"
                      | "yellow"
                  }
                />
              ))}
        </div>

        {/* 🌟 3. QUICK ACTIONS */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Aksi Cepat</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, idx) => (
              <Link key={idx} href={action.href}>
                <Card className="border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group cursor-pointer bg-white">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        getColorClasses(action.color).bg
                      } group-hover:scale-110 transition-transform`}
                    >
                      <action.icon
                        className={`h-6 w-6 ${
                          getColorClasses(action.color).text
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {action.label}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
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
  color:
    | "orange"
    | "blue"
    | "green"
    | "purple"
    | "indigo"
    | "pink"
    | "yellow"
    | "slate";
}) {
  const styles = getColorClasses(color);

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-white">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <div className="text-2xl font-bold text-slate-900 mb-1">{value}</div>
          <p className="text-xs text-slate-400 font-medium">{desc}</p>
        </div>
        <div
          className={`p-2.5 rounded-xl border ${styles.border} ${styles.bg}`}
        >
          <Icon className={`h-5 w-5 ${styles.text}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// Helper for color styles
function getColorClasses(color: string) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      border: "border-green-100",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
    },
    indigo: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
    },
    pink: {
      bg: "bg-pink-50",
      text: "text-pink-600",
      border: "border-pink-100",
    },
    yellow: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border-yellow-100",
    },
    slate: {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-100",
    },
  };
  return colors[color] || colors.slate;
}
