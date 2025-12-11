"use client";

import { LoadingScreen, PageHeader } from "@/components/common";
import { CourseForm } from "@/components/course/course-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCourseById, useUpdateCourse } from "@/hooks/use-courses";
import { ApiError, getError } from "@/lib/get-error";
import { courseSchema } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

type CourseFormData = z.infer<typeof courseSchema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InstructorEditCoursePage({ params }: PageProps) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);
  const router = useRouter();

  const { data: course, isLoading, isError } = useCourseById(courseId);
  const updateCourse = useUpdateCourse();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CourseFormData) => {
    try {
      setError(null);
      await updateCourse.mutateAsync({ id: courseId, data });

      toast.success("Kursus berhasil diperbarui!", {
        description: `"${data.title}" telah diperbarui.`,
      });

      router.push("/instructor/courses");
    } catch (err: unknown) {
      const message = getError(err as ApiError, "Gagal memperbarui kursus");

      toast.error("Gagal memperbarui kursus", {
        description: message,
      });
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
        title="Edit Kursus"
        description={`Edit detail kursus "${course.title}"`}
        backHref="/instructor/courses"
      />

      <CourseForm
        course={course}
        onSubmit={handleSubmit}
        isLoading={updateCourse.isPending}
        error={error}
      />
    </div>
  );
}
