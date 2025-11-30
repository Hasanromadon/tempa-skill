"use client";

import { LoadingScreen, PageHeader } from "@/components/common";
import { LessonForm } from "@/components/lesson/lesson-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLesson, useUpdateLesson } from "@/hooks";
import { createLessonSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

type LessonFormData = z.infer<typeof createLessonSchema>;

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default function InstructorEditLessonPage({ params }: PageProps) {
  const { id, lessonId } = use(params);
  const courseId = parseInt(id, 10);
  const lessonIdNum = parseInt(lessonId, 10);
  const router = useRouter();

  const { data: lesson, isLoading, isError } = useLesson(lessonIdNum);
  const updateLesson = useUpdateLesson();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: LessonFormData) => {
    try {
      setError(null);

      // Transform camelCase to snake_case for API
      const apiData = {
        title: data.title,
        slug: data.slug,
        content: data.content,
        order_index: data.orderIndex,
        duration: data.duration || 0,
        is_published: data.isPublished || false,
      };

      await updateLesson.mutateAsync({ id: lessonIdNum, data: apiData });

      toast.success("Pelajaran berhasil diperbarui!", {
        description: `"${data.title}" telah diperbarui.`,
      });

      router.push(`/instructor/courses/${courseId}/lessons`);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Gagal memperbarui pelajaran. Silakan coba lagi.";
      setError(errorMessage);
      toast.error("Gagal memperbarui pelajaran", {
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Memuat data pelajaran..." />;
  }

  if (isError || !lesson) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Gagal memuat data pelajaran. Silakan refresh halaman.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Pelajaran"
        description={`Edit pelajaran "${lesson.title}"`}
        backHref={`/instructor/courses/${courseId}/lessons`}
      />

      <LessonForm
        lesson={lesson}
        onSubmit={handleSubmit}
        isLoading={updateLesson.isPending}
        error={error}
      />
    </div>
  );
}
