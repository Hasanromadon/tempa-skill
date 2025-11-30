"use client";

import { LoadingScreen, PageHeader } from "@/components/common";
import { DraggableLessonList } from "@/components/lesson/draggable-lesson-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCourseById, useCourseLessons } from "@/hooks";
import { AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InstructorLessonsPage({ params }: PageProps) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);

  const { data: course, isLoading: courseLoading } = useCourseById(courseId);
  const { data: lessons = [], isLoading: lessonsLoading } =
    useCourseLessons(courseId);

  if (courseLoading || lessonsLoading) {
    return <LoadingScreen />;
  }

  if (!course) {
    return (
      <div className="space-y-6">
        <PageHeader title="Kelola Pelajaran" backHref="/instructor/courses" />
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
        title="Kelola Pelajaran"
        description={`Kursus: ${course.title}`}
        backHref="/instructor/courses"
        action={
          <Button asChild>
            <Link href={`/instructor/courses/${courseId}/lessons/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pelajaran
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <Alert className="bg-orange-50 border-orange-200">
          <AlertDescription className="text-orange-800">
            💡 <strong>Tip:</strong> Drag dan lepas untuk mengubah urutan
            pelajaran. Perubahan akan disimpan otomatis.
          </AlertDescription>
        </Alert>

        <DraggableLessonList
          lessons={lessons.sort((a, b) => a.order_index - b.order_index)}
          courseId={courseId}
          basePath="/instructor"
        />
      </div>
    </div>
  );
}
