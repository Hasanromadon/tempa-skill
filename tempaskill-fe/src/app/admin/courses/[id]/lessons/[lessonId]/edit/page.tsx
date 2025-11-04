"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { PageHeader } from "@/components/common/page-header";
import { LessonForm } from "@/components/lesson";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCourseById } from "@/hooks/use-courses";
import { useLesson, useUpdateLesson } from "@/hooks/use-lessons";
import { ROUTES } from "@/lib/constants";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default function EditLessonPage({ params }: PageProps) {
  const { id, lessonId } = use(params);
  const courseId = parseInt(id, 10);
  const lessonIdNum = parseInt(lessonId, 10);
  const router = useRouter();

  // Fetch course and lesson
  const { data: course, isLoading: courseLoading } = useCourseById(courseId);
  const {
    data: lesson,
    isLoading: lessonLoading,
    error: fetchError,
  } = useLesson(lessonIdNum);

  // Mutations
  const updateLesson = useUpdateLesson();
  const [error, setError] = useState<string | null>(null);

  // Loading state
  if (courseLoading || lessonLoading) {
    return <LoadingScreen />;
  }

  // Course or lesson not found
  if (!course || fetchError || !lesson) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit Pelajaran" backHref={ROUTES.ADMIN.COURSES} />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Pelajaran tidak ditemukan atau terjadi kesalahan saat memuat data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    content: string;
    orderIndex: number;
    duration?: number;
  }) => {
    try {
      setError(null);
      await updateLesson.mutateAsync({
        id: lessonIdNum,
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          order_index: data.orderIndex,
          duration: data.duration,
        },
      });

      toast.success("Pelajaran berhasil diperbarui!", {
        description: `"${data.title}" telah diperbarui.`,
      });

      router.push(ROUTES.ADMIN.COURSE_LESSONS(courseId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal memperbarui pelajaran";
      setError(errorMessage);
      toast.error("Gagal memperbarui pelajaran", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Pelajaran"
        description={`Kursus: ${course.title} / ${lesson.title}`}
        backHref={ROUTES.ADMIN.COURSE_LESSONS(courseId)}
      />

      <div className="max-w-4xl">
        <LessonForm
          lesson={lesson}
          onSubmit={handleSubmit}
          isLoading={updateLesson.isPending}
          error={error}
        />
      </div>
    </div>
  );
}
