"use client";

import { cn } from "@/app/utils/cn-classes";
import { MDXContent } from "@/components/mdx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCourse,
  useCourseLessons,
  useCourseProgress,
  useIsAuthenticated,
  useLesson,
  useMarkLessonComplete,
} from "@/hooks";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Layout,
  List,
  Lock,
  PlayCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();

  // Mobile sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const slug = params.slug as string;
  const lessonId = Number.parseInt(params.id as string);

  const { data: course, isLoading: courseLoading } = useCourse(slug);
  const { data: lessons, isLoading: lessonsLoading } = useCourseLessons(
    course?.id || 0
  );
  const { data: currentLesson, isLoading: lessonLoading } = useLesson(lessonId);
  const { data: progress } = useCourseProgress(course?.id || 0);
  const markComplete = useMarkLessonComplete();

  // Navigation Logic
  const currentIndex = lessons?.findIndex((l) => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? lessons?.[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && lessons && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;

  const isCompleted =
    progress?.completed_lesson_ids?.includes(lessonId) ?? false;

  // Protect Route
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/courses/${slug}/lessons/${lessonId}`);
    }
  }, [authLoading, isAuthenticated, router, slug, lessonId]);

  const handleMarkComplete = async () => {
    if (!course || !currentLesson) return;

    try {
      await markComplete.mutateAsync({
        lessonId,
        courseId: course.id,
      });

      toast.success("Pelajaran Selesai!", {
        description: nextLesson
          ? "Siap untuk materi selanjutnya?"
          : "Selamat! Anda telah menyelesaikan kursus ini.",
        action: nextLesson
          ? {
              label: "Lanjut",
              onClick: () =>
                router.push(`/courses/${slug}/lessons/${nextLesson.id}`),
            }
          : undefined,
      });
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      toast.error("Gagal menyimpan progress", {
        description: "Silakan coba lagi nanti.",
      });
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
  };

  // Loading State
  if (courseLoading || lessonsLoading || lessonLoading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <div className="h-16 border-b bg-white flex items-center px-4">
          <Skeleton className="h-8 w-8 rounded-full mr-4" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex-1 container mx-auto px-4 py-8 grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="hidden lg:block lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // Not Found / Access Denied
  if (!course || !currentLesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-100 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 p-3 rounded-full w-fit mb-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-900">Akses Ditolak</CardTitle>
            <CardDescription>
              Pelajaran tidak ditemukan atau Anda belum terdaftar di kursus ini.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href={`/courses/${slug}`}>
              <Button variant="outline">Kembali ke Detail Kursus</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 🌟 1. LEARNING HEADER (Sticky) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm h-16">
        <div className="container h-full mx-auto flex px-4 items-center justify-between">
          <div className="flex items-center gap-4 ">
            <Link
              href={`/courses/${slug}`}
              className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              title="Kembali ke Kursus"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex flex-col border-l border-slate-200 pl-4">
              <h1 className="text-sm font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">
                {course.title}
              </h1>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {progress?.completed_lessons}
                  /{progress?.total_lessons} Selesai
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Progress Bar (Compact) */}
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-xs font-medium text-slate-600 mb-1">
                {Math.round(progress?.percentage || 0)}%
              </span>
              <Progress value={progress?.percentage} className="w-24 h-1.5" />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <List className="w-4 h-4 mr-2" /> Daftar Isi
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 🌟 2. MAIN CONTENT (Immersive Reader) */}
          <main className="lg:col-span-8 order-2 lg:order-1">
            <Card className="border-none shadow-sm overflow-hidden bg-white min-h-[80vh] flex flex-col">
              {/* --- HEADER: Compact & Clean --- */}
              <div className="px-6 py-6 border-b border-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                      Bagian {currentIndex + 1}
                    </span>
                    {currentLesson.duration > 0 && (
                      <span className="flex items-center gap-1">
                        • <Clock className="w-3 h-3" />{" "}
                        {formatDuration(currentLesson.duration)}
                      </span>
                    )}
                  </div>

                  {/* Quick Mark Complete (Top Right) for Power Users */}
                  {!isCompleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkComplete}
                      disabled={markComplete.isPending}
                      className="h-8 text-xs text-slate-400 hover:text-green-600 hover:bg-green-50"
                      title="Tandai Selesai"
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Selesai
                    </Button>
                  )}
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                  {currentLesson.title}
                </h1>
              </div>

              {/* --- CONTENT: Optimized for Reading --- */}
              <div className="flex-1 bg-white">
                <CardContent className="p-6 md:px-10 md:py-8">
                  <article className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-orange-600 hover:prose-a:text-orange-700 prose-img:rounded-xl prose-code:text-orange-600 prose-pre:bg-slate-900">
                    <MDXContent content={currentLesson.content} />
                  </article>
                </CardContent>
              </div>

              {/* --- FOOTER: Minimalist Navigation --- */}
              <div className="bg-white border-t border-slate-100 p-4 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
                  {/* PREV BUTTON */}
                  <div className="flex-1 max-w-[200px]">
                    {prevLesson ? (
                      <Link href={`/courses/${slug}/lessons/${prevLesson.id}`}>
                        <Button
                          variant="ghost"
                          className="group w-full justify-start pl-0 hover:bg-transparent h-auto py-2"
                        >
                          <ChevronLeft className="w-5 h-5 text-slate-400 mr-2 shrink-0 transition-transform group-hover:-translate-x-1 group-hover:text-orange-600" />
                          <div className="flex flex-col items-start overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 group-hover:text-orange-600 transition-colors">
                              Sebelumnya
                            </span>
                            <span className="text-sm font-semibold text-slate-700 truncate w-full max-w-[120px] md:max-w-[160px] group-hover:text-slate-900">
                              {prevLesson.title}
                            </span>
                          </div>
                        </Button>
                      </Link>
                    ) : (
                      <div /> /* Spacer */
                    )}
                  </div>

                  {/* NEXT BUTTON */}
                  <div className="flex-1 max-w-[200px] flex justify-end">
                    {nextLesson ? (
                      <Link href={`/courses/${slug}/lessons/${nextLesson.id}`}>
                        <Button
                          variant="ghost"
                          className="group w-full justify-end pr-0 hover:bg-transparent h-auto py-2"
                        >
                          <div className="flex flex-col items-end overflow-hidden">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 group-hover:text-orange-600 transition-colors">
                              Selanjutnya
                            </span>
                            <span className="text-sm font-semibold text-slate-700 truncate w-full max-w-[120px] md:max-w-[160px] text-right group-hover:text-slate-900">
                              {nextLesson.title}
                            </span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400 ml-2 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-orange-600" />
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/courses/${slug}`}>
                        <Button
                          size="sm"
                          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-5 h-9 shadow-sm text-xs font-medium"
                        >
                          Selesai Kursus
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </main>

          {/* 🌟 3. SIDEBAR (Curriculum) */}
          <aside
            className={`
             lg:col-span-4 order-1 lg:order-2 lg:sticky lg:top-24
             ${sidebarOpen ? "block" : "hidden lg:block"}
          `}
          >
            <Card className=" overflow-hidden pt-0 ">
              <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 ">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Layout className="w-4 h-4" /> Daftar Materi
                  </span>
                  <span className="text-xs font-normal text-slate-500">
                    {Math.round(progress?.percentage || 0)}% Selesai
                  </span>
                </CardTitle>
              </CardHeader>
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="p-2 pt-1 space-y-1">
                  {lessons?.map((lesson, idx) => {
                    const isActive = lesson.id === lessonId;
                    const isLessonDone =
                      progress?.completed_lesson_ids?.includes(lesson.id);
                    const isLocked =
                      !isLessonDone &&
                      lesson.id !== lessonId &&
                      idx > 0 &&
                      !progress?.completed_lesson_ids?.includes(
                        lessons[idx - 1].id
                      );

                    return (
                      <Link
                        key={lesson.id}
                        href={
                          isLocked
                            ? "#"
                            : `/courses/${slug}/lessons/${lesson.id}`
                        }
                        className={cn(
                          "group flex items-start gap-3 p-3 rounded-lg transition-all text-sm relative",
                          isActive
                            ? "bg-orange-50 text-orange-900 ring-1 ring-orange-200"
                            : "hover:bg-slate-50 text-slate-700",
                          isLocked &&
                            "opacity-50 cursor-not-allowed hover:bg-transparent"
                        )}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isLessonDone ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : isLocked ? (
                            <Lock className="w-4 h-4 text-slate-400" />
                          ) : isActive ? (
                            <PlayCircle className="w-4 h-4 text-orange-600 fill-orange-100" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <span
                            className={cn(
                              "font-medium block mb-0.5",
                              isActive && "text-orange-700"
                            )}
                          >
                            {lesson.title}
                          </span>
                          {lesson.duration > 0 && (
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{" "}
                              {formatDuration(lesson.duration)}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
