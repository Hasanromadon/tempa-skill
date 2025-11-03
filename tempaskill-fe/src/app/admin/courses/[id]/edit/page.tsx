"use client";

import { LoadingScreen, PageHeader } from "@/components/common";
import { CourseForm } from "@/components/course/course-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCourseById, useUpdateCourse } from "@/hooks/use-courses";
import { ROUTES } from "@/lib/constants";
import { courseSchema } from "@/lib/validators";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

type CourseFormData = z.infer<typeof courseSchema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit Course Page - Admin panel page for editing existing courses
 *
 * Features:
 * - Fetches course data by ID
 * - Pre-fills form with existing data
 * - Success toast notification
 * - Redirects to courses list after update
 * - Error handling with form-level error display
 * - Loading and not found states
 */
export default function EditCoursePage({ params }: PageProps) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);

  const router = useRouter();
  const {
    data: course,
    isLoading,
    error: fetchError,
  } = useCourseById(courseId);
  const updateCourse = useUpdateCourse();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CourseFormData) => {
    try {
      setError(null);
      await updateCourse.mutateAsync({ id: courseId, data });

      toast.success("Kursus berhasil diperbarui!", {
        description: `Perubahan pada "${data.title}" telah disimpan.`,
      });

      router.push(ROUTES.ADMIN.COURSES);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Gagal memperbarui kursus. Silakan coba lagi.";
      setError(errorMessage);
      toast.error("Gagal memperbarui kursus", {
        description: errorMessage,
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (fetchError || !course) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Edit Kursus"
          description="Kursus tidak ditemukan"
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Kursus"
        description={`Perbarui informasi kursus "${course.title}"`}
        backHref={ROUTES.ADMIN.COURSES}
      />

      <div className="max-w-4xl">
        <CourseForm
          course={course}
          onSubmit={handleSubmit}
          isLoading={updateCourse.isPending}
          error={error}
        />
      </div>
    </div>
  );
}
