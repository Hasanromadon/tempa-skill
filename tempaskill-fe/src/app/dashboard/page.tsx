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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAuthenticated, useUserProgress } from "@/hooks";
import { removeAuthToken } from "@/lib/auth-token";
import { MESSAGES, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  PlayCircle,
  TrendingUp,
  User,
  Video,
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

  // --- Statistics Logic ---
  const stats = useMemo(() => {
    if (!progress) return { total: 0, completed: 0, inProgress: 0, average: 0 };
    const total = progress.length;
    const completed = progress.filter((p) => p.is_completed).length;
    const inProgress = total - completed;
    const totalPercent = progress.reduce(
      (acc, curr) => acc + curr.progress_percentage,
      0
    );
    const average = total > 0 ? Math.round(totalPercent / total) : 0;

    return { total, completed, inProgress, average };
  }, [progress]);

  // --- Menu Items (Sidebar) ---
  const menuItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: ROUTES.DASHBOARD },
    { label: "Profil Saya", icon: User, href: ROUTES.PROFILE },
    { label: "Riwayat Pembayaran", icon: CreditCard, href: ROUTES.PAYMENTS },
    { label: "Jadwal Sesi Live", icon: Video, href: ROUTES.SESSIONS },
  ];

  if (isLoading) return <LoadingScreen message="Memuat dashboard..." />;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto px-4 py-8">
        {/* --- Header Section --- */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Halo, {user.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-gray-500 mt-1">
              Selamat datang kembali di TempaSkill. Siap belajar hari ini?
            </p>
          </div>
          <Link href={ROUTES.COURSES}>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20">
              Jelajahi Kursus Baru
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT SIDEBAR --- */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border-gray-100 shadow-sm bg-white overflow-hidden">
              <div className="p-3 space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.href} href={item.href} className="block">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 font-medium transition-all duration-200",
                          isActive
                            ? "bg-orange-50 text-orange-700 hover:bg-orange-100 border-l-4 border-orange-600 rounded-l-none"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4",
                            isActive ? "text-orange-600" : "text-gray-500"
                          )}
                        />
                        {item.label}
                      </Button>
                    </Link>
                  );
                })}
              </div>
              <Separator className="bg-gray-100" />
              <div className="p-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-3 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
                        untuk mengakses materi kursus.
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

            {/* Next Live Session Promo (TempaSkill Feature) */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                    Coming Soon
                  </Badge>
                </div>
                <h3 className="font-bold text-lg mb-1">Sesi Live Mentoring</h3>
                <p className="text-orange-100 text-sm mb-4 leading-relaxed">
                  Jangan lewatkan Q&A dan Live Coding dua minggu sekali bersama
                  instruktur.
                </p>
                <Link href={ROUTES.SESSIONS}>
                  <Button
                    size="sm"
                    className="w-full bg-white text-orange-600 hover:bg-orange-50 border-0 font-semibold"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Cek Jadwal
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* --- RIGHT CONTENT --- */}
          <div className="lg:col-span-9 space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatsCard
                icon={BookOpen}
                label="Total Kursus"
                value={stats.total}
                color="blue"
              />
              <StatsCard
                icon={TrendingUp}
                label="Rata-rata Progres"
                value={`${stats.average}%`}
                color="orange"
              />
              <StatsCard
                icon={CheckCircle2}
                label="Selesai"
                value={stats.completed}
                color="green"
              />
            </div>

            {/* Active Courses */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <PlayCircle className="h-5 w-5 text-orange-600" />
                  Lanjutkan Belajar
                </h2>
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
                      {/* Completed Badge */}
                      {item.is_completed && (
                        <div className="absolute top-3 right-3 z-10">
                          <Badge className="bg-green-500 text-white border-0 shadow-sm flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Selesai
                          </Badge>
                        </div>
                      )}

                      <CourseCard
                        course={{
                          id: item.course_id,
                          title: item.course_title,
                          slug: item.course_slug,
                          description: "", // Not needed for compact dashboard card
                          thumbnail_url: undefined,
                          difficulty: "beginner", // Default fallback
                          category: "Development", // Default fallback
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
                <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 flex flex-col items-center text-center">
                  <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Belum Ada Kursus Aktif
                  </h3>
                  <p className="text-gray-500 max-w-sm mb-6">
                    Anda belum mendaftar di kursus manapun. Mulai perjalanan
                    karir Anda dengan materi berkualitas kami.
                  </p>
                  <Link href={ROUTES.COURSES}>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      Cari Kursus Sekarang
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components for Cleaner Code ---

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: "orange" | "blue" | "green";
}

function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  const colorStyles = {
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
  };

  return (
    <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", colorStyles[color])}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium mb-0.5">{label}</p>
          <h4 className="text-2xl font-bold text-gray-900 tracking-tight">
            {value}
          </h4>
        </div>
      </CardContent>
    </Card>
  );
}
