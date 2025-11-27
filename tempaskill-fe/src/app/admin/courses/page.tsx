"use client";

import {
  ActiveFilters,
  LimitSelect,
  Pagination,
  ResultsSummary,
  SearchFilterInput,
  SelectFilter,
  SortHeader,
  TableStatus,
} from "@/components/common";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDeleteCourse,
  useServerTable,
  useTogglePublishCourse,
} from "@/hooks";
import {
  API_ENDPOINTS,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@/types/api";
import { Edit, Eye, EyeOff, MoreVertical, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Admin Courses List Page
 *
 * Demonstrates useServerTable with auto-detect parser
 * The hook automatically detects 'courses' key in response
 *
 * Alternative with explicit parser:
 * ```tsx
 * import { COMMON_PARSERS } from "@/lib/table-response-parsers";
 * const table = useServerTable<Course>({
 *   responseParser: COMMON_PARSERS.courses,
 *   ...
 * });
 * ```
 */
export default function AdminCoursesPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Server-side table with filters
  const table = useServerTable<Course>({
    queryKey: ["admin-courses"],
    endpoint: API_ENDPOINTS.COURSES.LIST,
    initialLimit: 10,
    initialFilters: {
      category: "",
      difficulty: "",
    },
  });

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

      // Refetch courses
      table.refetch();
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

      // Refetch courses
      table.refetch();
    } catch {
      toast.error("Gagal menghapus kursus", {
        description: "Silakan coba lagi.",
      });
    }
  };

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

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
          <CardDescription>
            Cari dan filter kursus berdasarkan kategori dan tingkat kesulitan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <SearchFilterInput
              value={table.filters.search}
              onChange={table.filters.setSearch}
              onClear={table.filters.clearSearch}
              placeholder="Cari berdasarkan judul kursus..."
              disabled={table.isLoading}
            />

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <SelectFilter
                value={String(table.filters.filters.category || "")}
                onChange={(value) =>
                  table.filters.setFilter("category", value || "")
                }
                options={[
                  { value: "", label: "Semua Kategori" },
                  { value: "Web Development", label: "Web Development" },
                  { value: "Mobile Development", label: "Mobile Development" },
                  { value: "Data Science", label: "Data Science" },
                  { value: "DevOps", label: "DevOps" },
                ]}
                placeholder="Semua Kategori"
                disabled={table.isLoading}
                aria="Filter berdasarkan kategori"
              />

              {/* Difficulty Filter */}
              <SelectFilter
                value={String(table.filters.filters.difficulty || "")}
                onChange={(value) =>
                  table.filters.setFilter("difficulty", value || "")
                }
                options={[
                  { value: "", label: "Semua Tingkat" },
                  { value: "beginner", label: "Pemula" },
                  { value: "intermediate", label: "Menengah" },
                  { value: "advanced", label: "Lanjutan" },
                ]}
                placeholder="Semua Tingkat"
                disabled={table.isLoading}
                aria="Filter berdasarkan tingkat kesulitan"
              />

              {/* Limit Selector */}
              <LimitSelect
                value={table.filters.limit}
                onChange={table.filters.setLimit}
                disabled={table.isLoading}
              />
            </div>

            {/* Active Filters */}
            {table.filters.hasActiveFilters && (
              <ActiveFilters
                filters={table.filters.filters}
                labels={{
                  category: "Kategori",
                  difficulty: "Tingkat",
                }}
                onRemove={table.filters.clearFilter}
                onClearAll={table.filters.clearAllFilters}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Daftar Kursus</CardTitle>
            {!table.isLoading && (
              <CardDescription className="mt-1">
                <ResultsSummary
                  total={table.total}
                  page={table.filters.page}
                  limit={table.filters.limit}
                />
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortHeader
                      label="Judul"
                      sortKey="title"
                      currentSort={table.filters.sortBy}
                      currentOrder={table.filters.sortOrder}
                      onSort={table.filters.toggleSort}
                    />
                  </TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>
                    <SortHeader
                      label="Tingkat"
                      sortKey="difficulty"
                      currentSort={table.filters.sortBy}
                      currentOrder={table.filters.sortOrder}
                      onSort={table.filters.toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortHeader
                      label="Harga"
                      sortKey="price"
                      currentSort={table.filters.sortBy}
                      currentOrder={table.filters.sortOrder}
                      onSort={table.filters.toggleSort}
                    />
                  </TableHead>
                  <TableHead>
                    <SortHeader
                      label="Siswa"
                      sortKey="enrollment_count"
                      currentSort={table.filters.sortBy}
                      currentOrder={table.filters.sortOrder}
                      onSort={table.filters.toggleSort}
                    />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.data.map((course) => (
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
                        variant={course.is_published ? "default" : "secondary"}
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
                            <Link href={`/admin/courses/${course.id}/lessons`}>
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
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Table Status (Loading, Error, Empty) */}
          <TableStatus
            isLoading={table.isLoading}
            isError={table.isError}
            isEmpty={table.data.length === 0}
            errorMessage="Gagal memuat daftar kursus. Silakan coba lagi."
            emptyMessage={
              table.filters.hasActiveFilters || table.filters.search
                ? "Tidak ada kursus yang sesuai dengan filter"
                : "Belum ada kursus. Buat kursus pertama Anda!"
            }
            loadingMessage="Memuat daftar kursus..."
          />

          {/* Pagination */}
          {table.data.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <Pagination
                currentPage={table.filters.page}
                totalPages={table.totalPages}
                totalItems={table.total}
                pageSize={table.filters.limit}
                onPageChange={table.filters.setPage}
                onPageSizeChange={table.filters.setLimit}
                pageSizeOptions={[10, 20, 50, 100]}
                showPageSizeSelector
                showPageNumbers
              />
            </div>
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
