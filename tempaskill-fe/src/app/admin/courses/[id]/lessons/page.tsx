"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { PageHeader } from "@/components/common/page-header";
import { DraggableLessonList } from "@/components/lesson/draggable-lesson-list";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCourseById } from "@/hooks/use-courses";
import { useCourseLessons } from "@/hooks/use-lessons";
import { ROUTES } from "@/lib/constants";
import { AlertCircle, BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseLessonsPage({ params }: PageProps) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);

  // Fetch course and lessons
  const { data: course, isLoading: courseLoading } = useCourseById(courseId);
  const { data: lessons = [], isLoading: lessonsLoading } =
    useCourseLessons(courseId);

  // Loading state
  if (courseLoading || lessonsLoading) {
    return <LoadingScreen />;
  }

  // Course not found
  if (!course) {
    return (
      <div className="space-y-6">
        <PageHeader title="Kelola Pelajaran" backHref={ROUTES.ADMIN.COURSES} />
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
      {/* Header */}
      <PageHeader
        title="Kelola Pelajaran"
        description={`Kursus: ${course.title}`}
        backHref={ROUTES.ADMIN.COURSES}
        action={
          <Button asChild>
            <Link href={ROUTES.ADMIN.LESSON_NEW(courseId)}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Pelajaran
            </Link>
          </Button>
        }
      />

      {/* Lessons List */}
      <div className="space-y-4">
        {/* Info Card */}
        <Alert className="bg-orange-50 border-orange-200">
          <AlertDescription className="text-orange-800">
            💡 <strong>Tip:</strong> Drag dan lepas untuk mengubah urutan
            pelajaran. Perubahan akan disimpan otomatis.
          </AlertDescription>
        </Alert>

        {lessons.length === 0 ? (
          // Empty state
          <div className="bg-white rounded-lg border">
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum Ada Pelajaran
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Kursus ini belum memiliki pelajaran. Mulai tambahkan pelajaran
                untuk melengkapi kurikulum kursus Anda.
              </p>
              <Button asChild>
                <Link href={ROUTES.ADMIN.LESSON_NEW(courseId)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pelajaran Pertama
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // Draggable List
          <DraggableLessonList
            lessons={lessons.sort((a, b) => a.order_index - b.order_index)}
            courseId={courseId}
            basePath="/admin"
          />
        )}
      </div>
    </div>
  );
}
