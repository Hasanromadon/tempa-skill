"use client";

import { LoadingScreen, PageHeader } from "@/components/common";
import { LessonForm } from "@/components/lesson/lesson-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCourseById, useCreateLesson } from "@/hooks";
import { ApiError, getError } from "@/lib/get-error";
import { createLessonSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

type LessonFormData = z.infer<typeof createLessonSchema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InstructorNewLessonPage({ params }: PageProps) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);
  const router = useRouter();

  const { data: course, isLoading, isError } = useCourseById(courseId);
  const createLesson = useCreateLesson();
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
        duration: data.duration ?? 0,
        is_published: data.isPublished ?? false,
      };

      // Wait for mutation to complete and cache to invalidate
      await createLesson.mutateAsync({ courseId, data: apiData });

      toast.success("Pelajaran berhasil dibuat!", {
        description: `"${data.title}" telah ditambahkan.`,
      });

      router.push(`/instructor/courses/${courseId}/lessons`);
    } catch (err) {
      const messageMessage = getError(
        err as ApiError,
        "Gagal membuat pelajaran"
      );
      setError(messageMessage);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Memuat data kursus..." />;
  }

  if (isError || !course) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Gagal memuat data kursus. Silakan refresh halaman.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tambah Pelajaran Baru"
        description={`Tambah pelajaran ke kursus "${course.title}"`}
        backHref={`/instructor/courses/${courseId}/lessons`}
      />

      <LessonForm
        onSubmit={handleSubmit}
        isLoading={createLesson.isPending}
        error={error}
      />
    </div>
  );
}
