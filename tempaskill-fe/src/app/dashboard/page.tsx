"use client";

import { EmptyState, LoadingScreen, PageHeader } from "@/components/common";
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
import { Button } from "@/components/ui/button";
import { useIsAuthenticated, useUserProgress } from "@/hooks";
import { removeAuthToken } from "@/lib/auth-token";
import { MESSAGES, ROUTES } from "@/lib/constants";
import { BookOpen, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useIsAuthenticated();
  const { data: progress, isLoading: progressLoading } = useUserProgress();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    removeAuthToken();
    toast.success(MESSAGES.AUTH.LOGOUT_SUCCESS, {
      description: "Sampai jumpa lagi! Semoga hari Anda menyenangkan.",
    });
    router.push(ROUTES.HOME);
  };

  if (isLoading) {
    return <LoadingScreen message="Memuat dashboard..." />;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={`Selamat datang kembali, ${user.name}!`}
        description="Lanjutkan perjalanan belajar Anda"
        action={
          <div className="flex gap-2">
            <Link href={ROUTES.PROFILE}>
              <Button
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
                aria-label="Buka halaman profil"
              >
                <User className="h-4 w-4 mr-2" aria-hidden="true" />
                Profil
              </Button>
            </Link>
            <Link href={ROUTES.COURSES}>
              <Button
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                aria-label="Jelajahi kursus yang tersedia"
              >
                Jelajahi Kursus
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" aria-label="Keluar dari akun">
                  <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                  Keluar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Keluar dari Akun?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda yakin ingin keluar dari akun Anda? Anda harus login
                    kembali untuk mengakses dashboard dan kursus Anda.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Ya, Keluar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        {progressLoading ? (
          <LoadingScreen message="Memuat kursus Anda..." />
        ) : progress && progress.length > 0 ? (
          <>
            <h2 className="text-2xl font-bold mb-6">Kursus yang Anda Ikuti</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {progress.map((item) => (
                <CourseCard
                  key={item.course_id}
                  course={{
                    id: item.course_id,
                    title: item.course_title,
                    slug: item.course_slug,
                    description: "",
                    thumbnail_url: undefined,
                    difficulty: "beginner",
                    category: "",
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
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Belum Ada Kursus yang Diikuti"
            description="Mulai belajar dengan mendaftar kursus yang tersedia"
            action={{
              label: "Jelajahi Kursus",
              onClick: () => router.push(ROUTES.COURSES),
            }}
          />
        )}
      </div>
    </div>
  );
}
