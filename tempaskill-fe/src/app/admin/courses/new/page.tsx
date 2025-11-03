"use client";

import { PageHeader } from "@/components/common";
import { CourseForm } from "@/components/course/course-form";
import { useCreateCourse } from "@/hooks/use-courses";
import { ROUTES } from "@/lib/constants";
import { courseSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

type CourseFormData = z.infer<typeof courseSchema>;

/**
 * New Course Page - Admin panel page for creating new courses
 *
 * Features:
 * - Uses reusable CourseForm component
 * - Success toast notification
 * - Redirects to courses list after creation
 * - Error handling with form-level error display
 */
export default function NewCoursePage() {
  const router = useRouter();
  const createCourse = useCreateCourse();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CourseFormData) => {
    try {
      setError(null);
      await createCourse.mutateAsync(data);

      toast.success("Kursus berhasil dibuat!", {
        description: `"${data.title}" telah ditambahkan ke daftar kursus.`,
      });

      router.push(ROUTES.ADMIN.COURSES);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Gagal membuat kursus. Silakan coba lagi.";
      setError(errorMessage);
      toast.error("Gagal membuat kursus", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buat Kursus Baru"
        description="Tambahkan kursus baru ke platform TempaSKill"
        backHref={ROUTES.ADMIN.COURSES}
      />

      <div className="max-w-4xl">
        <CourseForm
          onSubmit={handleSubmit}
          isLoading={createCourse.isPending}
          error={error}
        />
      </div>
    </div>
  );
}
