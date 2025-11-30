"use client";

import { LoadingScreen } from "@/components/common";
import { LessonList } from "@/components/lesson";
import { PaymentModal } from "@/components/payment/payment-modal";
import { ReviewForm, ReviewList } from "@/components/review";
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
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCourse,
  useCourseLessons,
  useCourseProgress,
  useEnrollCourse,
  useIsAuthenticated,
  useUnenrollCourse,
  useUser,
} from "@/hooks";
import {
  useCertificate,
  useDownloadCertificate,
  useIssueCertificate,
} from "@/hooks/use-certificate";
import { DIFFICULTY_LABELS, ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Award,
  BarChart,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Globe,
  Loader2,
  PlayCircle,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

// --- Types ---

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Define the expected structure of the API error response
interface ApiError {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
}

// --- Icons Components ---

const TargetIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const RocketIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

// --- Main Component ---

export default function CourseDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const { isAuthenticated } = useIsAuthenticated();

  // Data Fetching
  const { data: course, isLoading, error } = useCourse(slug);
  const { data: lessons, isLoading: lessonsLoading } = useCourseLessons(
    course?.id || 0
  );
  const { data: progress } = useCourseProgress(course?.id || 0);
  const { data: instructor } = useUser(course?.instructor_id || 0);
  const { data: certificate, refetch: refetchCertificate } = useCertificate(
    course?.id
  );

  // Mutations
  const enrollCourse = useEnrollCourse();
  const unenrollCourse = useUnenrollCourse();
  const issueCertificate = useIssueCertificate();
  const downloadCertificate = useDownloadCertificate();

  // Local State
  const [enrollError, setEnrollError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // --- Handlers ---

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?redirect=/courses/${slug}`);
      return;
    }

    if (!course) return;

    if (course.price > 0) {
      setShowPaymentModal(true);
      return;
    }

    setEnrollError("");
    try {
      await enrollCourse.mutateAsync(course.id);
      toast.success("Berhasil mendaftar!", {
        description: `Selamat belajar di kursus "${course.title}"`,
      });
    } catch (err: unknown) {
      const apiError = err as ApiError;
      const msg = apiError.response?.data?.error?.message || "Gagal mendaftar.";
      setEnrollError(msg);
      toast.error(msg);
    }
  };

  const handleUnenroll = async () => {
    if (!course) return;
    try {
      await unenrollCourse.mutateAsync(course.id);
      toast.success("Berhasil keluar dari kursus");
    } catch (err) {
      console.error(err);
      toast.error("Gagal keluar dari kursus");
    }
  };

  const handleDownloadCertificate = async () => {
    if (!certificate?.certificate?.certificate_id) return;

    setDownloading(true);
    setCertificateError("");
    try {
      const pdf = await downloadCertificate.mutateAsync(
        certificate.certificate.certificate_id
      );
      // Ensure pdf is a blob or compatible type
      const blob = new Blob([pdf], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Sertifikat-${course?.slug}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setCertificateError("Gagal mengunduh sertifikat.");
    } finally {
      setDownloading(false);
    }
  };

  // --- Render States ---

  if (isLoading) return <LoadingScreen message="Memuat detail kursus..." />;

  if (error || !course) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <BookOpen className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Kursus Tidak Ditemukan
          </h2>
          <p className="text-gray-500">
            Kursus yang Anda cari mungkin telah dihapus atau URL tidak valid.
          </p>
          <Button
            onClick={() => router.push(ROUTES.COURSES)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Kembali ke Daftar Kursus
          </Button>
        </div>
      </div>
    );
  }

  const progressPercentage = progress?.percentage || 0;
  const isCompleted = progressPercentage === 100;

  // Safe access for difficulty label
  const difficultyLabel =
    DIFFICULTY_LABELS[course.difficulty as keyof typeof DIFFICULTY_LABELS] ||
    course.difficulty;

  const difficultyColorClass =
    course.difficulty === "beginner"
      ? "text-green-300 border-green-300/30"
      : course.difficulty === "intermediate"
      ? "text-yellow-300 border-yellow-300/30"
      : "text-red-300 border-red-300/30";

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* --- Hero Section --- */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="mb-6">
            <Link
              href={ROUTES.COURSES}
              className="inline-flex items-center text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Katalog
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex flex-wrap gap-3">
                <Badge className="bg-orange-600 hover:bg-orange-700 text-white border-none px-3 py-1">
                  {course.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={`border-white/20 text-slate-200 capitalize ${difficultyColorClass}`}
                >
                  {difficultyLabel}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white">
                {course.title}
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed max-w-2xl line-clamp-3">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-orange-500" />
                  <span>{course.lesson_count} Pelajaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-orange-500" />
                  <span>{course.enrolled_count.toLocaleString()} Siswa</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-orange-500" />
                  <span>Bahasa Indonesia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span>Akses Selamanya</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column: Content Tabs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Card (Only if Enrolled) */}
            {course.is_enrolled && (
              <Card className="border-orange-100 shadow-sm bg-white overflow-hidden py-0">
                <div className="bg-orange-50/50 p-4 sm:p-6 border-b border-orange-100">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <PlayCircle className="h-5 w-5 text-orange-600" />
                        Status Belajar
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {isCompleted
                          ? "Luar biasa! Kursus selesai."
                          : "Lanjutkan progres belajar Anda."}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">
                      {progressPercentage}%
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                </div>

                {isCompleted && (
                  <div className="p-4 sm:p-6 bg-yellow-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-2 rounded-full">
                        <Award className="h-6 w-6 text-yellow-700" />
                      </div>
                      <div>
                        <p className="font-medium text-yellow-900">
                          Sertifikat Kompetensi
                        </p>
                        <p className="text-sm text-yellow-700">
                          Bukti keahlian Anda siap diunduh.
                        </p>
                      </div>
                    </div>

                    {certificate?.certificate ? (
                      <Button
                        onClick={handleDownloadCertificate}
                        disabled={downloading}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto"
                      >
                        {downloading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Unduh PDF
                      </Button>
                    ) : certificate?.eligible ? (
                      <Button
                        onClick={() => issueCertificate.mutate(course.id)}
                        disabled={issueCertificate.isPending}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white w-full sm:w-auto"
                      >
                        {issueCertificate.isPending
                          ? "Memproses..."
                          : "Klaim Sertifikat"}
                      </Button>
                    ) : null}
                  </div>
                )}
              </Card>
            )}

            {/* Content Tabs */}
            <Card className="shadow-sm border-gray-200 overflow-hidden">
              <Tabs defaultValue="overview" className="w-full">
                <div className="border-b px-4 sm:px-6 bg-gray-50/50">
                  <TabsList className="bg-transparent h-auto p-0 space-x-6">
                    <TabsTrigger
                      value="overview"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none px-0 py-4 text-gray-500 data-[state=active]:text-orange-600 font-medium transition-all"
                    >
                      Ringkasan
                    </TabsTrigger>
                    <TabsTrigger
                      value="curriculum"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none px-0 py-4 text-gray-500 data-[state=active]:text-orange-600 font-medium transition-all"
                    >
                      Materi ({course.lesson_count})
                    </TabsTrigger>
                    <TabsTrigger
                      value="instructor"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none px-0 py-4 text-gray-500 data-[state=active]:text-orange-600 font-medium transition-all"
                    >
                      Instruktur
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none px-0 py-4 text-gray-500 data-[state=active]:text-orange-600 font-medium transition-all"
                    >
                      Ulasan
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab: Ringkasan */}
                <TabsContent
                  value="overview"
                  className="p-6 m-0 focus-visible:ring-0"
                >
                  <div className="prose prose-orange max-w-none">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Tentang Kursus Ini
                    </h3>
                    {course.description ? (
                      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {course.description}
                      </p>
                    ) : (
                      <div className="text-gray-500 italic">
                        Deskripsi belum tersedia.
                      </div>
                    )}

                    <div className="mt-8 grid sm:grid-cols-2 gap-4">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                          <TargetIcon className="h-5 w-5" />
                          Target Peserta
                        </h4>
                        <p className="text-sm text-orange-800/80">
                          Cocok untuk pemula hingga menengah yang ingin
                          mendalami topik ini secara praktis.
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                          <RocketIcon className="h-5 w-5" />
                          Metode Belajar
                        </h4>
                        <p className="text-sm text-blue-800/80">
                          Kombinasi materi teks interaktif, studi kasus nyata,
                          dan kuis evaluasi.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab: Materi */}
                <TabsContent
                  value="curriculum"
                  className="p-0 m-0 focus-visible:ring-0"
                >
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">
                      Kurikulum Pembelajaran
                    </h3>
                    <p className="text-sm text-gray-500">
                      Terdiri dari {course.lesson_count} modul komprehensif
                    </p>
                  </div>
                  <div className="p-6 pt-2">
                    <LessonList
                      lessons={lessons || []}
                      completedLessonIds={progress?.completed_lesson_ids || []}
                      canAccess={course.is_enrolled}
                      isLoading={lessonsLoading}
                      onLessonClick={(lessonId) => {
                        router.push(`/courses/${slug}/lessons/${lessonId}`);
                      }}
                      emptyMessage="Materi sedang disusun oleh instruktur."
                    />
                  </div>
                </TabsContent>

                {/* Tab: Instruktur */}
                <TabsContent
                  value="instructor"
                  className="p-6 m-0 focus-visible:ring-0"
                >
                  {instructor ? (
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden shrink-0 border-4 border-white shadow-md">
                        {/* Placeholder avatar logic */}
                        <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <User className="h-10 w-10" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {instructor.name}
                        </h3>
                        <p className="text-orange-600 font-medium capitalize">
                          {instructor.role || "Senior Instructor"}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> 500+ Siswa
                          </span>
                          <span className="flex items-center gap-1">
                            <PlayCircle className="h-3 w-3" /> 12 Kursus
                          </span>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {instructor.bio ||
                            "Instruktur berpengalaman di bidang teknologi dan pengembangan perangkat lunak. Berkomitmen untuk mencetak talenta digital berkualitas di Indonesia."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Informasi instruktur tidak tersedia.
                    </p>
                  )}
                </TabsContent>

                {/* Tab: Ulasan */}
                <TabsContent
                  value="reviews"
                  className="p-6 m-0 focus-visible:ring-0"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-900">
                      Apa Kata Mereka?
                    </h3>
                    {course.is_enrolled && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:text-orange-800"
                      >
                        {showReviewForm ? "Batal Tulis" : "Tulis Ulasan"}
                      </Button>
                    )}
                  </div>

                  {showReviewForm && course.is_enrolled && (
                    <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
                      <ReviewForm
                        courseId={course.id}
                        onSuccess={() => setShowReviewForm(false)}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    </div>
                  )}

                  <ReviewList courseId={course.id} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-lg border-0 ring-1 ring-gray-200 overflow-hidden pt-0 group">
                {/* Header Image Area */}
                <div className="h-40 relative overflow-hidden bg-gray-100">
                  {/* Logic: Tampilkan Gambar jika ada, jika tidak tampilkan Pattern */}
                  {course.thumbnail_url ? (
                    <>
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        priority
                      />
                      {/* Overlay gradient tipis agar badge lebih terbaca */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    /* Fallback Pattern (Jika tidak ada gambar) */
                    <>
                      <div className="absolute inset-0 bg-orange-50" />
                      <div className="absolute inset-0 bg-[url('/pattern-grid.svg')] opacity-10" />
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-orange-200 rounded-full blur-3xl opacity-50" />
                      <div className="absolute top-[-20%] left-[-10%] w-24 h-24 bg-orange-300 rounded-full blur-2xl opacity-20" />
                    </>
                  )}

                  {/* Badges (Posisi Absolute di atas Gambar) */}
                  <div className="absolute top-4 left-4 z-10 flex gap-2">
                    {course.is_enrolled ? (
                      <Badge className="bg-green-500/90 hover:bg-green-500 text-white shadow-sm border-0 backdrop-blur-sm">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Terdaftar
                      </Badge>
                    ) : (
                      <Badge className="bg-white/90 text-orange-700 backdrop-blur-md shadow-sm border-orange-100/50">
                        Kursus Populer
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="relative pt-0">
                  {/* Price Tag (Floating Overlap) */}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      Harga Kursus
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {course.price === 0
                          ? "Gratis"
                          : formatCurrency(course.price)}
                      </span>
                    </div>
                  </div>

                  {enrollError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{enrollError}</AlertDescription>
                    </Alert>
                  )}

                  {/* Action Buttons */}
                  {!course.is_enrolled ? (
                    <Button
                      className="w-full h-12 text-lg font-semibold bg-orange-600 hover:bg-orange-700  transition-all active:scale-[0.98]"
                      onClick={handleEnroll}
                      disabled={enrollCourse.isPending}
                    >
                      {enrollCourse.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Memproses...
                        </>
                      ) : course.price === 0 ? (
                        "Daftar Gratis Sekarang"
                      ) : (
                        "Beli Kursus Ini"
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        className="w-full h-12 text-lg font-semibold bg-orange-600 hover:bg-orange-700  active:scale-[0.98]"
                        onClick={() => {
                          const nextLesson =
                            lessons?.find(
                              (l) =>
                                !progress?.completed_lesson_ids?.includes(l.id)
                            ) || lessons?.[0];
                          if (nextLesson)
                            router.push(
                              `/courses/${slug}/lessons/${nextLesson.id}`
                            );
                        }}
                      >
                        {progress && progress.completed_lessons > 0
                          ? "Lanjutkan Belajar"
                          : "Mulai Belajar"}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50"
                          >
                            Batalkan Pendaftaran
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Konfirmasi Pembatalan
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin berhenti dari kursus ini?
                              Progress belajar Anda akan tetap tersimpan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleUnenroll}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Ya, Berhenti
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}

                  <Separator className="my-6" />

                  {/* Feature List */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 text-sm">
                      Yang akan Anda dapatkan:
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-gray-600 group/item">
                        <div className="p-1 rounded-full bg-orange-50 group-hover/item:bg-orange-100 transition-colors">
                          <FileText className="h-4 w-4 text-orange-600 shrink-0" />
                        </div>
                        <span className="mt-0.5">
                          Akses {course.lesson_count} materi pelajaran
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-600 group/item">
                        <div className="p-1 rounded-full bg-orange-50 group-hover/item:bg-orange-100 transition-colors">
                          <ShieldCheck className="h-4 w-4 text-orange-600 shrink-0" />
                        </div>
                        <span className="mt-0.5">
                          Jaminan akses seumur hidup
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-600 group/item">
                        <div className="p-1 rounded-full bg-orange-50 group-hover/item:bg-orange-100 transition-colors">
                          <BarChart className="h-4 w-4 text-orange-600 shrink-0" />
                        </div>
                        <span className="mt-0.5">
                          Tingkat kesulitan: {difficultyLabel}
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-sm text-gray-600 group/item">
                        <div className="p-1 rounded-full bg-orange-50 group-hover/item:bg-orange-100 transition-colors">
                          <Award className="h-4 w-4 text-orange-600 shrink-0" />
                        </div>
                        <span className="mt-0.5">
                          Sertifikat kelulusan digital
                        </span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Support Card */}
              <Card className="bg-blue-50/50 border-blue-100 shadow-sm">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm">
                      Butuh Bantuan?
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Tim support kami siap membantu Anda 24/7 jika mengalami
                      kendala akses.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {course && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          courseId={course.id}
          courseTitle={course.title}
          coursePrice={course.price}
          onSuccess={() => window.location.reload()}
        />
      )}
    </div>
  );
}
