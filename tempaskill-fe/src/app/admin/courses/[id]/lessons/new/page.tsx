"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { PageHeader } from "@/components/common/page-header";
import { LessonForm } from "@/components/lesson";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCourseById } from "@/hooks/use-courses";
import { useCourseLessons, useCreateLesson } from "@/hooks/use-lessons";
import { ROUTES } from "@/lib/constants";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NewLessonPage({ params }: PageProps) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);
  const router = useRouter();

  // Fetch course and existing lessons
  const { data: course, isLoading: courseLoading } = useCourseById(courseId);
  const { data: lessons = [], isLoading: lessonsLoading } =
    useCourseLessons(courseId);

  // Mutations
  const createLesson = useCreateLesson();
  const [error, setError] = useState<string | null>(null);

  // Loading state
  if (courseLoading || lessonsLoading) {
    return <LoadingScreen />;
  }

  // Course not found
  if (!course) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Buat Pelajaran Baru"
          backHref={ROUTES.ADMIN.COURSES}
        />
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Kursus tidak ditemukan atau terjadi kesalahan saat memuat data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Calculate max order index
  const maxOrderIndex =
    lessons.length > 0 ? Math.max(...lessons.map((l) => l.order_index)) : 0;

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    content: string;
    orderIndex: number;
    duration?: number;
    isPublished?: boolean;
  }) => {
    try {
      setError(null);
      await createLesson.mutateAsync({
        courseId: courseId,
        data: {
          title: data.title,
          slug: data.slug,
          content: data.content,
          order_index: data.orderIndex,
          duration: data.duration || 30,
          is_published: data.isPublished || false,
        },
      });

      toast.success("Pelajaran berhasil dibuat!", {
        description: `"${data.title}" telah ditambahkan ke kursus.`,
      });

      router.push(ROUTES.ADMIN.COURSE_LESSONS(courseId));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal membuat pelajaran";
      setError(errorMessage);
      toast.error("Gagal membuat pelajaran", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Pelajaran Baru"
        description={`Kursus: ${course.title}`}
        backHref={ROUTES.ADMIN.COURSE_LESSONS(courseId)}
      />

      <div className="max-w-4xl">
        <LessonForm
          onSubmit={handleSubmit}
          isLoading={createLesson.isPending}
          error={error}
          maxOrderIndex={maxOrderIndex}
        />
      </div>
    </div>
  );
}
