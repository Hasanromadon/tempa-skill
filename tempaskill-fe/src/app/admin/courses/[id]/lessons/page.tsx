"use client";

import { LoadingScreen } from "@/components/common/loading-screen";
import { PageHeader } from "@/components/common/page-header";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCourseById } from "@/hooks/use-courses";
import { useCourseLessons, useDeleteLesson } from "@/hooks/use-lessons";
import { ROUTES } from "@/lib/constants";
import {
  AlertCircle,
  BookOpen,
  Clock,
  Edit,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";

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

  // Mutations
  const deleteLesson = useDeleteLesson();

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

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

  // Delete handlers
  const handleDeleteClick = (lessonId: number, lessonTitle: string) => {
    setLessonToDelete({ id: lessonId, title: lessonTitle });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!lessonToDelete) return;

    try {
      await deleteLesson.mutateAsync(lessonToDelete.id);
      toast.success("Pelajaran berhasil dihapus", {
        description: `"${lessonToDelete.title}" telah dihapus dari kursus.`,
      });
      setDeleteDialogOpen(false);
      setLessonToDelete(null);
    } catch {
      toast.error("Gagal menghapus pelajaran", {
        description: "Terjadi kesalahan saat menghapus pelajaran.",
      });
    }
  };

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
  };

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

      {/* Lessons Table */}
      <div className="bg-white rounded-lg border">
        {lessons.length === 0 ? (
          // Empty state
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
        ) : (
          // Table
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Urutan</TableHead>
                <TableHead>Judul Pelajaran</TableHead>
                <TableHead className="w-32">Durasi</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons
                .sort((a, b) => a.order_index - b.order_index)
                .map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell className="font-medium">
                      {lesson.order_index}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{lesson.title}</div>
                        <div className="text-sm text-gray-500">
                          {lesson.slug}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(lesson.duration)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lesson.is_published ? (
                        <Badge className="bg-green-100 text-green-800">
                          <Eye className="h-3 w-3 mr-1" />
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={ROUTES.ADMIN.LESSON_EDIT(
                                courseId,
                                lesson.id
                              )}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              handleDeleteClick(lesson.id, lesson.title)
                            }
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pelajaran?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus pelajaran{" "}
              <strong>&quot;{lessonToDelete?.title}&quot;</strong>? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLesson.isPending}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLesson.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLesson.isPending ? "Menghapus..." : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
