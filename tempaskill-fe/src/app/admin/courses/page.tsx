"use client";

import { LoadingScreen, Pagination } from "@/components/common";
import { DeleteCourseDialog } from "@/components/course/delete-course-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useCourses,
  useDataTable,
  useDeleteCourse,
  useTogglePublishCourse,
} from "@/hooks";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import {
  Edit,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCoursesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const { data: coursesData, isLoading } = useCourses();
  const courses = coursesData?.courses || [];
  const togglePublish = useTogglePublishCourse();
  const deleteCourse = useDeleteCourse();

  // Handle publish/unpublish
  const handleTogglePublish = async (
    courseId: number,
    currentStatus: boolean,
    courseTitle: string
  ) => {
    try {
      await togglePublish.mutateAsync({
        id: courseId,
        isPublished: !currentStatus,
      });

      toast.success(
        !currentStatus ? "Kursus dipublikasikan" : "Kursus di-unpublish",
        {
          description: `"${courseTitle}" sekarang ${
            !currentStatus ? "aktif" : "tidak aktif"
          }.`,
        }
      );
    } catch {
      toast.error("Gagal mengubah status kursus", {
        description: "Silakan coba lagi.",
      });
    }
  };

  // Handle delete
  const handleDeleteClick = (courseId: number, courseTitle: string) => {
    setCourseToDelete({ id: courseId, title: courseTitle });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse.mutateAsync(courseToDelete.id);

      toast.success("Kursus berhasil dihapus", {
        description: `"${courseToDelete.title}" telah dihapus dari platform.`,
      });

      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    } catch {
      toast.error("Gagal menghapus kursus", {
        description: "Silakan coba lagi.",
      });
    }
  };

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      search === "" ||
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;

    const matchesDifficulty =
      difficultyFilter === "all" || course.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Pagination hook
  const {
    currentPage,
    pageSize: currentPageSize,
    paginatedData: displayedCourses,
    totalPages,
    totalItems: totalFiltered,
    goToPage,
    setPageSize,
  } = useDataTable({
    data: filteredCourses,
    pageSize: 10,
  });

  if (isLoading) {
    return <LoadingScreen message="Memuat daftar kursus..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Kursus</h1>
          <p className="text-gray-600 mt-1">
            Kelola semua kursus di platform TempaSKill
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button
            className="bg-orange-600 hover:bg-orange-700"
            aria-label="Buat kursus baru"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Buat Kursus
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Kursus</CardTitle>
          <CardDescription>
            Cari dan filter kursus berdasarkan kategori dan tingkat kesulitan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari kursus..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Cari kursus"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger aria-label="Filter berdasarkan kategori">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="Mobile Development">
                  Mobile Development
                </SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="DevOps">DevOps</SelectItem>
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger aria-label="Filter berdasarkan tingkat kesulitan">
                <SelectValue placeholder="Semua Tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tingkat</SelectItem>
                <SelectItem value="beginner">Pemula</SelectItem>
                <SelectItem value="intermediate">Menengah</SelectItem>
                <SelectItem value="advanced">Lanjutan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kursus ({totalFiltered})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Tingkat</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Siswa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedCourses.length > 0 ? (
                  displayedCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      <TableCell>{course.category}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            DIFFICULTY_COLORS[
                              course.difficulty as keyof typeof DIFFICULTY_COLORS
                            ]
                          }
                        >
                          {
                            DIFFICULTY_LABELS[
                              course.difficulty as keyof typeof DIFFICULTY_LABELS
                            ]
                          }
                        </Badge>
                      </TableCell>
                      <TableCell>{formatCurrency(course.price)}</TableCell>
                      <TableCell>{course.enrolled_count || 0}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            course.is_published ? "default" : "secondary"
                          }
                          className={
                            course.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {course.is_published ? "Aktif" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Aksi untuk ${course.title}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/courses/${course.id}/edit`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/courses/${course.id}/lessons`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Kelola Pelajaran
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleTogglePublish(
                                  course.id,
                                  course.is_published,
                                  course.title
                                )
                              }
                              disabled={togglePublish.isPending}
                            >
                              {course.is_published ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Unpublish
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Publish
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleDeleteClick(course.id, course.title)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-gray-500">
                        {search ||
                        categoryFilter !== "all" ||
                        difficultyFilter !== "all"
                          ? "Tidak ada kursus yang sesuai dengan filter"
                          : "Belum ada kursus. Buat kursus pertama Anda!"}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalFiltered > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalFiltered}
              pageSize={currentPageSize}
              onPageChange={goToPage}
              onPageSizeChange={setPageSize}
              pageSizeOptions={[5, 10, 20, 50]}
              showPageSizeSelector
              showPageNumbers
            />
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteCourseDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        courseName={courseToDelete?.title || ""}
        isDeleting={deleteCourse.isPending}
      />
    </div>
  );
}
