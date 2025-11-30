"use client";

import { LoadingScreen } from "@/components/common";
import { CourseCard } from "@/components/course";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAuthenticated, useUserProgress } from "@/hooks";
import { removeAuthToken } from "@/lib/auth-token";
import { MESSAGES, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  User,
  Video,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();
  const { data: progress, isLoading: progressLoading } = useUserProgress();

  // --- Auth Check ---
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  // --- Logout Logic ---
  const handleLogout = () => {
    removeAuthToken();
    toast.success(MESSAGES.AUTH.LOGOUT_SUCCESS);
    router.push(ROUTES.HOME);
  };

  // --- Logic: Get Last Active Course & Stats ---
  const { stats, lastActiveCourse } = useMemo(() => {
    if (!progress)
      return {
        stats: { total: 0, completed: 0, inProgress: 0, average: 0 },
        lastActiveCourse: null,
      };

    const total = progress.length;
    const completed = progress.filter((p) => p.is_completed).length;
    const inProgress = total - completed;
    const totalPercent = progress.reduce(
      (acc, curr) => acc + curr.progress_percentage,
      0
    );
    const average = total > 0 ? Math.round(totalPercent / total) : 0;

    // Cari kursus yang belum selesai dengan progress tertinggi (asumsi "last active")
    const lastActive = progress
      .filter((p) => !p.is_completed)
      .sort(
        (a, b) => b.enrolled_at?.localeCompare(a.enrolled_at || "") || 0
      )[0];

    return {
      stats: { total, completed, inProgress, average },
      lastActiveCourse: lastActive,
    };
  }, [progress]);

  // --- Menu Items (Sidebar) ---
  const menuItems = [
    { label: "Ringkasan", icon: LayoutDashboard, href: ROUTES.DASHBOARD },
    { label: "Profil Saya", icon: User, href: ROUTES.PROFILE },
    { label: "Riwayat Transaksi", icon: CreditCard, href: ROUTES.PAYMENTS },
    { label: "Jadwal Mentoring", icon: Video, href: ROUTES.SESSIONS },
  ];

  if (isLoading) return <LoadingScreen message="Memuat dashboard..." />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* 🌟 1. WELCOME HEADER (Modern & Clean) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-1">
              <span className="text-orange-600">Dashboard Siswa</span>
              <span>/</span>
              <span>Overview</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Selamat Datang, {user.name?.split(" ")[0]}!
            </h1>
            <p className="text-gray-500 mt-1 max-w-xl">
              Setiap langkah kecil membawamu lebih dekat ke tujuan. Mari
              lanjutkan pembelajaranmu hari ini.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href={ROUTES.COURSES}>
              <Button
                variant="outline"
                className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
              >
                <BookOpen className="w-4 h-4 mr-2" /> Katalog Kursus
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR (Sticky & Profile Focused) --- */}
          <div className="lg:col-span-3 space-y-6">
            {/* Profile Mini Card */}
            <Card className="border-none shadow-sm bg-white overflow-hidden pt-0">
              <div className="h-24 bg-linear-to-r from-orange-500 to-amber-500"></div>
              <div className="px-4 pb-4 -mt-14 text-center">
                <Avatar className="w-20 h-20 border-4 border-white mx-auto shadow-md">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="bg-slate-800 text-white font-bold text-xl">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg mt-2">{user.name}</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
                <Badge
                  variant="secondary"
                  className="mt-2 bg-orange-100 text-orange-700 hover:bg-orange-100"
                >
                  Student
                </Badge>
              </div>
            </Card>

            {/* Navigation Menu */}
            <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
              <div className="p-2 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} className="block">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 font-medium h-11 px-4",
                          isActive
                            ? "bg-orange-50 text-orange-700 hover:bg-orange-100"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-orange-600" : "text-gray-400"
                          )}
                        />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              <Separator className="bg-gray-100 my-1" />
              <div className="p-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 h-11 px-4 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Keluar</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin keluar? Anda perlu masuk kembali
                        untuk mengakses materi.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                      >
                        Ya, Keluar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>

            {/* Live Session Widget (Compact) */}
            <Card className="bg-linear-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg overflow-hidden relative group cursor-pointer hover:shadow-xl transition-shadow">
              <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Video className="w-24 h-24 rotate-12" />
              </div>
              <CardContent className="p-5 relative z-10">
                <div className="flex items-center gap-2 text-orange-400 text-sm font-bold mb-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                  </span>
                  UPCOMING LIVE
                </div>
                <h4 className="font-bold text-lg leading-tight mb-4">
                  Q&A: Bedah Kode React.js
                </h4>
                <div className="flex items-center gap-2 text-slate-300 text-sm mb-4">
                  <Calendar className="w-4 h-4" />{" "}
                  <span>Sabtu, 20 Nov • 19:00</span>
                </div>
                <Button
                  size="sm"
                  className="w-full bg-white text-slate-900 hover:bg-gray-100"
                >
                  Lihat Detail
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* --- RIGHT CONTENT --- */}
          <div className="lg:col-span-9 space-y-8">
            {/* 🌟 2. HERO ACTION: Resume Learning (Paling Penting) */}
            {progress && lastActiveCourse && (
              <div className="w-full bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="border-orange-200 text-orange-600 bg-orange-50"
                    >
                      <Zap className="w-3 h-3 mr-1 fill-orange-600" /> Sedang
                      Dipelajari
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {lastActiveCourse.course_title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />{" "}
                      {lastActiveCourse.total_lessons -
                        lastActiveCourse.completed_lessons}{" "}
                      Pelajaran Tersisa
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Est. 30 Menit
                    </span>
                  </div>

                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-gray-700">Progress Anda</span>
                      <span className="text-orange-600">
                        {Math.round(lastActiveCourse.progress_percentage)}%
                      </span>
                    </div>
                    <Progress
                      value={lastActiveCourse.progress_percentage}
                      className="h-2.5 bg-gray-100"
                    />
                  </div>

                  <Link href={`/courses/${lastActiveCourse.course_slug}`}>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white px-8 h-12 text-base  w-full md:w-auto">
                      Lanjutkan Belajar <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block w-1/3 bg-gray-100 relative">
                  {/* Placeholder Image or Pattern */}
                  <div className="absolute inset-0 bg-linear-to-br from-orange-400/20 to-orange-600/20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-orange-600 opacity-80" />
                  </div>
                </div>
              </div>
            )}

            {/* 🌟 3. STATS ROW (Clean & Informatif) */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-600" /> Statistik Belajar
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  icon={BookOpen}
                  label="Total Kursus"
                  value={stats.total}
                  subValue="Diambil"
                  color="blue"
                />
                <StatsCard
                  icon={CheckCircle2}
                  label="Diselesaikan"
                  value={stats.completed}
                  subValue="Kursus Lulus"
                  color="green"
                />
                <StatsCard
                  icon={Trophy}
                  label="Sertifikat"
                  value={stats.completed}
                  subValue="Diraih"
                  color="orange"
                />
              </div>
            </div>

            {/* 🌟 4. COURSE LIST GRID */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-600" />
                  Kursus Saya
                </h2>
                {progress && progress.length > 0 && (
                  <Link
                    href={ROUTES.COURSES}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    Lihat Semua
                  </Link>
                )}
              </div>

              {progressLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                      <Skeleton className="h-40 w-full rounded-xl" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : progress && progress.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {progress.map((item) => (
                    <div key={item.course_id} className="relative group">
                      {/* CourseCard component reuse */}
                      <CourseCard
                        course={{
                          id: item.course_id,
                          title: item.course_title,
                          slug: item.course_slug,
                          description: "",
                          thumbnail_url: undefined, // Bisa diisi jika API support
                          difficulty: "intermediate", // Placeholder
                          category: "Development", // Placeholder
                          price: 0,
                          lesson_count: item.total_lessons,
                          enrolled_count: 0,
                          is_enrolled: true,
                        }}
                        showProgress={true}
                        progress={{
                          completed_lessons: item.completed_lessons,
                          total_lessons: item.total_lessons,
                          progress_percentage: item.progress_percentage,
                          is_completed: item.is_completed,
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyStateDashboard />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS FOR CLEANER CODE ---

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue: string;
  color: "orange" | "blue" | "green";
}

function StatsCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: StatsCardProps) {
  const colorStyles = {
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
  };

  return (
    <Card
      className={cn(
        "border shadow-sm hover:shadow-md transition-all",
        colorStyles[color].replace("bg-", "border-")
      )}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
            <h4 className="text-3xl font-bold text-gray-900 tracking-tight">
              {value}
            </h4>
            <p className="text-xs text-gray-400 mt-1">{subValue}</p>
          </div>
          <div
            className={cn(
              "p-3 rounded-xl bg-white bg-opacity-60",
              colorStyles[color]
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyStateDashboard() {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl opacity-50"></div>
        <div className="relative h-20 w-20 bg-orange-50 rounded-full flex items-center justify-center">
          <BookOpen className="h-10 w-10 text-orange-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Mulai Perjalanan Belajarmu
      </h3>
      <p className="text-gray-500 max-w-md mb-8">
        Anda belum mendaftar di kursus manapun. Temukan ribuan materi
        berkualitas dan tingkatkan skill Anda hari ini.
      </p>
      <Link href={ROUTES.COURSES}>
        <Button
          size="lg"
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8 shadow-lg shadow-orange-600/20"
        >
          <Sparkles className="w-4 h-4 mr-2" /> Jelajahi Katalog
        </Button>
      </Link>
    </div>
  );
}
