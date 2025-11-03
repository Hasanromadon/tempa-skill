"use client";

import { LoadingScreen } from "@/components/common";
import { LessonList } from "@/components/lesson";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  useCourse,
  useCourseLessons,
  useCourseProgress,
  useEnrollCourse,
  useIsAuthenticated,
  useUnenrollCourse,
  useUser,
} from "@/hooks";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Loader2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params); // Unwrap the Promise
  const { isAuthenticated } = useIsAuthenticated();
  const { data: course, isLoading, error } = useCourse(slug);
  const { data: lessons, isLoading: lessonsLoading } = useCourseLessons(
    course?.id || 0
  );
  const { data: progress } = useCourseProgress(course?.id || 0);
  const { data: instructor } = useUser(course?.instructor_id || 0);
  const enrollCourse = useEnrollCourse();
  const unenrollCourse = useUnenrollCourse();
  const [enrollError, setEnrollError] = useState("");

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (!course) return;

    setEnrollError("");
    try {
      await enrollCourse.mutateAsync(course.id);
      toast.success("Berhasil mendaftar!", {
        description: `Anda sekarang terdaftar di kursus "${course.title}". Mulai belajar sekarang!`,
      });
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message ||
        "Gagal mendaftar. Silakan coba lagi.";
      setEnrollError(errorMessage);
      toast.error("Gagal mendaftar", {
        description: errorMessage,
      });
    }
  };

  const handleUnenroll = async () => {
    if (!course) return;

    try {
      await unenrollCourse.mutateAsync(course.id);
      toast.success("Berhasil keluar dari kursus", {
        description: `Anda telah keluar dari kursus "${course.title}".`,
      });
    } catch (err) {
      console.error("Unenroll failed:", err);
      toast.error("Gagal keluar dari kursus", {
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Memuat detail kursus..." />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Kursus Tidak Ditemukan</CardTitle>
            <CardDescription>
              Kursus yang Anda cari tidak ada atau telah dihapus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={ROUTES.COURSES}>
              <Button className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Kursus
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <Link
            href={ROUTES.COURSES}
            className="inline-flex items-center text-orange-100 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Kursus
          </Link>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge
                  className={
                    DIFFICULTY_COLORS[
                      course.difficulty as keyof typeof DIFFICULTY_COLORS
                    ] || DIFFICULTY_COLORS.beginner
                  }
                >
                  {DIFFICULTY_LABELS[
                    course.difficulty as keyof typeof DIFFICULTY_LABELS
                  ] || course.difficulty}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-white/20 text-white border-white/30"
                >
                  {course.category}
                </Badge>
                {course.is_enrolled && (
                  <Badge className="bg-green-500 text-white border-0 px-3 py-1 text-sm font-semibold shadow-lg">
                    ✓ Anda Sudah Terdaftar
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-orange-100 mb-6 max-w-3xl">
                {course.description}
              </p>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{course.lesson_count} Pelajaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrolled_count} Siswa</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-2xl font-bold">
                    {formatCurrency(course.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrolled Status Alert */}
            {course.is_enrolled && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 font-medium">
                  Selamat! Anda sudah terdaftar di kursus ini. Mulai belajar
                  sekarang atau lanjutkan dari terakhir kali Anda berhenti.
                </AlertDescription>
              </Alert>
            )}

            {/* Progress Section (if enrolled) */}
            {course.is_enrolled && progress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    Kemajuan Anda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {progress.completed_lessons} dari{" "}
                        {progress.total_lessons} pelajaran selesai
                      </span>
                      <span className="text-sm font-medium">
                        {progress.progress_percentage}%
                      </span>
                    </div>
                    <Progress value={progress.progress_percentage} />
                  </div>
                  {progress.is_completed && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Selamat! Anda telah menyelesaikan kursus ini!
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Course Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Kursus</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <h3>Apa yang akan Anda pelajari</h3>
                <ul>
                  <li>
                    Menguasai fundamental melalui materi berbasis teks yang
                    komprehensif
                  </li>
                  <li>
                    Berpartisipasi dalam sesi Q&A dan coding langsung dua minggu
                    sekali
                  </li>
                  <li>
                    Membangun proyek nyata dan mendapatkan pengalaman praktis
                  </li>
                  <li>
                    Mendapatkan feedback personal dari instruktur berpengalaman
                  </li>
                </ul>

                <h3>Format Kursus</h3>
                <p>
                  Kursus ini menggunakan pendekatan pembelajaran hybrid unik
                  TempaSKill:
                </p>
                <ul>
                  <li>
                    <strong>Pelajaran Berbasis Teks:</strong> Baca dan belajar
                    sesuai kecepatan Anda
                  </li>
                  <li>
                    <strong>Sesi Langsung:</strong> Ikuti sesi interaktif setiap
                    2 minggu
                  </li>
                  <li>
                    <strong>Pelacakan Kemajuan:</strong> Pantau perkembangan
                    Anda dalam kursus
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Lessons List */}
            <Card>
              <CardHeader>
                <CardTitle>Konten Kursus</CardTitle>
                <CardDescription>
                  {course.lesson_count} pelajaran dalam kursus ini
                  {!course.is_enrolled && (
                    <span className="block mt-1 text-orange-600 font-medium">
                      Daftar terlebih dahulu untuk mengakses semua pelajaran
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LessonList
                  lessons={lessons || []}
                  completedLessonIds={progress?.completed_lesson_ids || []}
                  canAccess={course.is_enrolled}
                  isLoading={lessonsLoading}
                  onLessonClick={(lessonId) => {
                    router.push(`/courses/${slug}/lessons/${lessonId}`);
                  }}
                  emptyMessage="Belum ada pelajaran tersedia. Periksa kembali nanti!"
                />
              </CardContent>
            </Card>

            {/* Instructor */}
            {instructor && (
              <Card>
                <CardHeader>
                  <CardTitle>Instruktur</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                      <User className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">
                        {instructor.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {instructor.role}
                      </p>
                      {instructor.bio && (
                        <p className="mt-2 text-gray-700">{instructor.bio}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Enrollment Card */}
          <div>
            <Card className="sticky top-6">
              {course.is_enrolled && (
                <div className="bg-green-500 text-white px-4 py-3 rounded-t-lg">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Anda Sudah Terdaftar</span>
                  </div>
                </div>
              )}
              <CardHeader>
                <div className="text-3xl font-bold text-orange-600">
                  {formatCurrency(course.price)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {enrollError && (
                  <Alert variant="destructive">
                    <AlertDescription>{enrollError}</AlertDescription>
                  </Alert>
                )}

                {!course.is_enrolled ? (
                  <Button
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrollCourse.isPending}
                  >
                    {enrollCourse.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mendaftar...
                      </>
                    ) : course.price === 0 ? (
                      "Daftar Gratis"
                    ) : (
                      "Daftar Sekarang"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      size="lg"
                      onClick={() => {
                        if (lessons && lessons.length > 0) {
                          const nextLesson =
                            lessons.find(
                              (l) =>
                                !progress?.completed_lesson_ids?.includes(l.id)
                            ) || lessons[0];
                          router.push(
                            `/courses/${slug}/lessons/${nextLesson.id}`
                          );
                        }
                      }}
                    >
                      {progress && progress.completed_lessons > 0
                        ? "Lanjutkan Belajar"
                        : "Mulai Belajar"}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                          disabled={unenrollCourse.isPending}
                        >
                          {unenrollCourse.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Membatalkan...
                            </>
                          ) : (
                            "Batalkan Pendaftaran"
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Keluar dari Kursus?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Anda yakin ingin keluar dari kursus &quot;
                            {course.title}&quot;? Progress Anda akan tetap
                            tersimpan jika Anda mendaftar kembali nanti.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleUnenroll}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Ya, Keluar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}

                <div className="border-t pt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Pelajaran</span>
                    <span className="font-medium">{course.lesson_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Siswa</span>
                    <span className="font-medium">{course.enrolled_count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Tingkat Kesulitan</span>
                    <Badge
                      className={
                        DIFFICULTY_COLORS[
                          course.difficulty as keyof typeof DIFFICULTY_COLORS
                        ] || DIFFICULTY_COLORS.beginner
                      }
                    >
                      {DIFFICULTY_LABELS[
                        course.difficulty as keyof typeof DIFFICULTY_LABELS
                      ] || course.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Kategori</span>
                    <span className="font-medium capitalize">
                      {course.category}
                    </span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <Alert>
                    <AlertDescription className="text-sm">
                      <Link
                        href={ROUTES.LOGIN}
                        className="text-blue-600 hover:underline"
                      >
                        Masuk
                      </Link>{" "}
                      atau{" "}
                      <Link
                        href={ROUTES.REGISTER}
                        className="text-blue-600 hover:underline"
                      >
                        buat akun
                      </Link>{" "}
                      untuk mendaftar
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
