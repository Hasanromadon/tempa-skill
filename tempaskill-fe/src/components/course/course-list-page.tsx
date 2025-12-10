"use client";

import { formatCurrency } from "@/app/utils/format-currency";
import { SearchAndFilters } from "@/components/admin/search-and-filters";
import { ColumnDef, DataTable } from "@/components/common";
import { CourseActions } from "@/components/course/course-actions";
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
  useDeleteCourse,
  useServerTable,
  useTogglePublishCourse,
} from "@/hooks";
import {
  API_ENDPOINTS,
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
} from "@/lib/constants";
import type { Course } from "@/types/api";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface CourseListPageProps {
  /**
   * Base path for navigation (e.g., "/admin" or "/instructor")
   */
  basePath: string;
  /**
   * Page title
   */
  title?: string;
  /**
   * Page description
   */
  description?: string;
}

/**
 * Reusable Course List Component
 * Can be used by both Admin and Instructor
 */
export function CourseListPage({
  basePath,
  title = "Kelola Kursus",
  description = "Kelola semua kursus di platform TempaSKill",
}: CourseListPageProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Use different endpoint for instructor (auto-filters by JWT)
  // Admin uses general endpoint to see all courses
  const endpoint =
    basePath === "/instructor"
      ? API_ENDPOINTS.INSTRUCTOR.MY_COURSES
      : API_ENDPOINTS.COURSES.LIST;

  // Server-side table with filters
  const table = useServerTable<Course>({
    queryKey: ["courses", basePath],
    endpoint,
    initialLimit: 10,
    initialFilters: {},
  });

  const togglePublish = useTogglePublishCourse();
  const deleteCourse = useDeleteCourse();

  // Handle publish/unpublish
  const handleTogglePublish = useCallback(
    async (courseId: number, currentStatus: boolean, courseTitle: string) => {
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

        table.refetch();
      } catch (error: unknown) {
        let errorMessage = "Silakan coba lagi.";

        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: { data?: { error?: string } };
          };
          if (axiosError.response?.data?.error) {
            errorMessage = axiosError.response.data.error;
          }
        }

        toast.error("Gagal mengubah status kursus", {
          description: errorMessage,
        });
      }
    },
    [togglePublish, table]
  );

  // Handle delete
  const handleDeleteClick = useCallback(
    (courseId: number, courseTitle: string) => {
      setCourseToDelete({ id: courseId, title: courseTitle });
      setDeleteDialogOpen(true);
    },
    []
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!courseToDelete) return;

    try {
      await deleteCourse.mutateAsync(courseToDelete.id);

      toast.success("Kursus berhasil dihapus", {
        description: `"${courseToDelete.title}" telah dihapus dari platform.`,
      });

      setDeleteDialogOpen(false);
      setCourseToDelete(null);
      table.refetch();
    } catch {
      toast.error("Gagal menghapus kursus", {
        description: "Silakan coba lagi.",
      });
    }
  }, [courseToDelete, deleteCourse, table]);

  // Column definitions
  const columns = useMemo<ColumnDef<Course>[]>(
    () => [
      {
        id: "title",
        accessor: "title",
        header: "Judul",
        enableSorting: true,
        sortKey: "title",
      },
      {
        id: "category",
        accessor: "category",
        header: "Kategori",
      },
      {
        id: "difficulty",
        accessor: "difficulty",
        header: "Tingkat",
        enableSorting: true,
        sortKey: "difficulty",
        cell: (ctx) => {
          const difficulty = ctx.getValue() as string;
          return (
            <Badge
              className={
                DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS]
              }
            >
              {DIFFICULTY_LABELS[difficulty as keyof typeof DIFFICULTY_LABELS]}
            </Badge>
          );
        },
      },
      {
        id: "price",
        accessor: "price",
        header: "Harga",
        enableSorting: true,
        sortKey: "price",
        cell: (ctx) => formatCurrency(ctx.getValue() as number),
      },
      {
        id: "enrolled_count",
        accessor: "enrolled_count",
        header: "Siswa",
        enableSorting: true,
        sortKey: "enrollment_count",
        cell: (ctx) => <>{ctx.getValue() || 0}</>,
      },
      {
        id: "is_published",
        accessor: "is_published",
        header: "Status",
        cell: (ctx) => {
          const isPublished = ctx.getValue() as boolean;
          return (
            <Badge
              variant={isPublished ? "default" : "secondary"}
              className={
                isPublished
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }
            >
              {isPublished ? "Aktif" : "Draft"}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        cell: (ctx) => {
          const course = ctx.row.original;
          return (
            <CourseActions
              course={course}
              onTogglePublish={handleTogglePublish}
              onDelete={handleDeleteClick}
              isToggling={togglePublish.isPending}
              basePath={basePath}
            />
          );
        },
      },
    ],
    [handleTogglePublish, handleDeleteClick, togglePublish.isPending, basePath]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <Link href={`${basePath}/courses/new`}>
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
          <SearchAndFilters
            isLoading={table.isLoading}
            onSearchChange={table.filters.setSearch}
            onSearchClear={table.filters.clearSearch}
            filters={table.filters.filters}
            onFilterChange={table.filters.setFilter}
            onFilterClear={table.filters.clearFilter}
            onClearAllFilters={table.filters.clearAllFilters}
            hasActiveFilters={table.filters.hasActiveFilters}
          />
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kursus</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable<Course>
            columns={columns}
            data={table.data}
            page={table.filters.page}
            limit={table.filters.limit}
            total={table.total}
            totalPages={table.totalPages}
            isLoading={table.isLoading}
            isError={table.isError}
            sortBy={table.filters.sortBy}
            sortOrder={table.filters.sortOrder}
            onSort={table.filters.toggleSort}
            onPageChange={table.filters.setPage}
            onPageSizeChange={table.filters.setLimit}
            pageSizeOptions={[10, 20, 50, 100]}
            showPagination={true}
            showPageSizeSelector={true}
            showPageNumbers={true}
            emptyMessage={
              table.filters.hasActiveFilters || table.filters.search
                ? "Tidak ada kursus yang sesuai dengan filter"
                : "Belum ada kursus. Buat kursus pertama Anda!"
            }
            loadingMessage="Memuat daftar kursus..."
          />
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
