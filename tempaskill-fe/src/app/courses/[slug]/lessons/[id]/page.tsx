"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  Loader2,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { MDXContent } from "@/components/mdx/mdx-content";

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useIsAuthenticated();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const slug = params.slug as string;
  const lessonId = Number.parseInt(params.id as string);

  const { data: course, isLoading: courseLoading } = useCourse(slug);
  const { data: lessons, isLoading: lessonsLoading } = useCourseLessons(
    course?.id || 0
  );
  const { data: currentLesson, isLoading: lessonLoading } = useLesson(lessonId);
  const { data: progress } = useCourseProgress(course?.id || 0);
  const markComplete = useMarkLessonComplete();

  // Find lesson index for navigation
  const currentIndex = lessons?.findIndex((l) => l.id === lessonId) ?? -1;
  const prevLesson = currentIndex > 0 ? lessons?.[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && lessons && currentIndex < lessons.length - 1
      ? lessons[currentIndex + 1]
      : null;

  // Check if lesson is completed
  const isCompleted =
    progress?.completed_lesson_ids?.includes(lessonId) ?? false;

  const handleMarkComplete = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!course || !currentLesson) return;

    try {
      await markComplete.mutateAsync({
        lessonId,
        courseId: course.id,
      });

      toast.success("Pelajaran selesai!", {
        description: `"${
          currentLesson.title
        }" telah ditandai sebagai selesai. ${
          nextLesson
            ? "Lanjut ke pelajaran berikutnya?"
            : "Selamat! Anda telah menyelesaikan semua pelajaran."
        }`,
      });
    } catch (error) {
      console.error("Error marking lesson complete:", error);
      toast.error("Gagal menandai selesai", {
        description: "Terjadi kesalahan. Silakan coba lagi.",
      });
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} menit`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
  };

  if (courseLoading || lessonsLoading || lessonLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-96 lg:col-span-1" />
          <Skeleton className="h-96 lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Pelajaran tidak ditemukan atau Anda tidak memiliki akses ke
            pelajaran ini.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/courses/${slug}`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-lg">{course.title}</h1>
                <p className="text-sm text-gray-600">
                  {progress?.completed_lessons} dari {progress?.total_lessons}{" "}
                  pelajaran selesai
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          {progress && (
            <Progress
              value={progress.progress_percentage}
              className="h-1 rounded-none"
            />
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Lesson List */}
          <aside
            className={`${
              sidebarOpen ? "block" : "hidden"
            } lg:block lg:col-span-1`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Daftar Pelajaran
                </CardTitle>
                <CardDescription>
                  {lessons?.length || 0} pelajaran
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {lessons?.map((lesson, index) => {
                    const isLessonCompleted =
                      progress?.completed_lesson_ids?.includes(lesson.id) ??
                      false;
                    const isCurrent = lesson.id === lessonId;

                    return (
                      <Link
                        key={lesson.id}
                        href={`/courses/${slug}/lessons/${lesson.id}`}
                        className={`block px-4 py-3 border-b hover:bg-gray-50 transition-colors ${
                          isCurrent
                            ? "bg-blue-50 border-l-4 border-l-blue-600"
                            : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="shrink-0 mt-1">
                            {(() => {
                              if (isLessonCompleted) {
                                return (
                                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                                );
                              }
                              if (isCurrent) {
                                return (
                                  <Circle className="h-5 w-5 text-blue-600 fill-blue-600" />
                                );
                              }
                              return (
                                <Circle className="h-5 w-5 text-gray-400" />
                              );
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {index + 1}. {lesson.title}
                            </p>
                            {lesson.duration > 0 && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(lesson.duration)}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">
                      {currentLesson.title}
                    </CardTitle>
                    {currentLesson.duration > 0 && (
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatDuration(currentLesson.duration)}
                      </CardDescription>
                    )}
                  </div>
                  {isCompleted ? (
                    <Badge className="bg-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Selesai
                    </Badge>
                  ) : (
                    <Button
                      onClick={handleMarkComplete}
                      disabled={markComplete.isPending}
                      className="flex items-center gap-2"
                    >
                      {markComplete.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Tandai Selesai
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Lesson Content */}
                <MDXContent content={currentLesson.content} />

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t">
                  {prevLesson ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(`/courses/${slug}/lessons/${prevLesson.id}`)
                      }
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Sebelumnya
                    </Button>
                  ) : (
                    <div />
                  )}

                  {nextLesson ? (
                    <Button
                      onClick={() =>
                        router.push(`/courses/${slug}/lessons/${nextLesson.id}`)
                      }
                      className="flex items-center gap-2"
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => router.push(`/courses/${slug}`)}
                      className="flex items-center gap-2"
                    >
                      Kembali ke Kursus
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}
