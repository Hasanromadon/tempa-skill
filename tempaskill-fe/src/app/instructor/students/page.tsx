"use client";

import { ColumnDef, DataTable } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerTable } from "@/hooks";
import { ExportColumn, exportToCSV } from "@/lib/export-csv";
import type { InstructorStudent } from "@/types/api";
import {
  BookOpen,
  Download,
  Eye,
  Mail,
  Search,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

// Response type from backend /instructor/students endpoint
interface InstructorStudentsApiResponse {
  students: InstructorStudent[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Instructor Students Management Page
 *
 * Uses same pattern as Admin Users Page:
 * - useServerTable hook for server-side pagination/filtering
 * - DataTable component for consistent UI
 * - Filter controls for search and course
 */
export default function InstructorStudentsPage() {
  // Server-side table with filters
  const table = useServerTable<InstructorStudent>({
    queryKey: ["instructor-students"],
    endpoint: "instructor/students",
    initialLimit: 10,
    initialFilters: {},
    responseParser: {
      getItems: (res: unknown) =>
        (res as InstructorStudentsApiResponse)?.students || [],
      getTotal: (res: unknown) =>
        (res as InstructorStudentsApiResponse)?.total || 0,
      getTotalPages: (res: unknown) =>
        (res as InstructorStudentsApiResponse)?.total_pages || 1,
    },
  });

  // Calculate stats from current data
  const totalStudents = table.total;
  const avgProgress = useMemo(() => {
    if (table.data.length === 0) return 0;
    const sum = table.data.reduce((acc, s) => acc + s.overall_progress, 0);
    return sum / table.data.length;
  }, [table.data]);

  const activeStudents = useMemo(() => {
    return table.data.filter((s) => s.overall_progress > 0).length;
  }, [table.data]);

  // Handle export to CSV
  const handleExportCSV = useCallback(() => {
    const columns: ExportColumn<InstructorStudent>[] = [
      { key: "id", label: "ID" },
      { key: "name", label: "Nama" },
      { key: "email", label: "Email" },
      {
        key: "total_enrollments",
        label: "Kursus Terdaftar",
        format: (value) => String(value || 0),
      },
      {
        key: "completed_courses",
        label: "Kursus Selesai",
        format: (value) => String(value || 0),
      },
      {
        key: "overall_progress",
        label: "Progress (%)",
        format: (value) => `${Number(value).toFixed(1)}%`,
      },
      {
        key: "joined_at",
        label: "Bergabung",
        format: (value) => {
          const date = new Date(String(value));
          return date.toLocaleDateString("id-ID");
        },
      },
    ];

    const filename = `siswa_saya_${new Date().toISOString().split("T")[0]}.csv`;

    exportToCSV(table.data, columns, filename);

    toast.success("Data berhasil diekspor", {
      description: `File ${filename} telah diunduh.`,
    });
  }, [table.data]);

  // Column definitions for DataTable
  const columns = useMemo<ColumnDef<InstructorStudent>[]>(
    () => [
      {
        id: "name",
        accessor: "name",
        header: "Siswa",
        enableSorting: false,
        cell: (ctx) => {
          const student = ctx.row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <span className="text-orange-600 font-semibold">
                  {student.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium">{student.name}</p>
                <p className="text-sm text-gray-500">{student.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "enrollments",
        accessor: "total_enrollments",
        header: "Kursus Terdaftar",
        enableSorting: false,
        cell: (ctx) => {
          const student = ctx.row.original;
          return (
            <div className="space-y-1">
              <Badge variant="secondary">
                {student.total_enrollments} kursus
              </Badge>
              {student.enrolled_courses &&
                student.enrolled_courses.length > 0 && (
                  <p className="text-xs text-gray-500 line-clamp-2 max-w-[200px]">
                    {student.enrolled_courses.join(", ")}
                  </p>
                )}
            </div>
          );
        },
      },
      {
        id: "progress",
        accessor: "overall_progress",
        header: "Progress",
        enableSorting: false,
        cell: (ctx) => {
          const student = ctx.row.original;
          return (
            <div className="space-y-2 min-w-[150px]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {student.completed_courses}/{student.total_enrollments}{" "}
                  selesai
                </span>
                <span className="font-medium">
                  {student.overall_progress.toFixed(0)}%
                </span>
              </div>
              <Progress value={student.overall_progress} className="h-2" />
            </div>
          );
        },
      },
      {
        id: "joined_at",
        accessor: "joined_at",
        header: "Bergabung",
        enableSorting: false,
        cell: (ctx) => {
          const date = new Date(ctx.getValue() as string);
          return (
            <span className="text-sm text-gray-600">
              {date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "Aksi",
        cell: (ctx) => {
          const student = ctx.row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm" asChild title="Lihat Detail">
                <Link href={`/users/${student.id}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = `mailto:${student.email}`;
                }}
                title="Kirim Email"
              >
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Siswa Saya</h1>
          <p className="text-gray-600 mt-1">
            Kelola dan pantau progress siswa yang terdaftar di kursus Anda
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={table.data.length === 0}
          aria-label="Ekspor data ke CSV"
        >
          <Download className="h-4 w-4 mr-2" aria-hidden="true" />
          Ekspor CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Siswa
            </CardTitle>
            <Users className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalStudents}</div>
            <p className="text-xs text-gray-500 mt-1">
              Terdaftar di kursus Anda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Siswa Aktif
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeStudents}</div>
            <p className="text-xs text-gray-500 mt-1">Sudah mulai belajar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Rata-rata Progress
            </CardTitle>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgProgress.toFixed(1)}%</div>
            <Progress value={avgProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama atau email..."
                value={table.filters.search || ""}
                onChange={(e) => table.filters.setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Course Filter - Placeholder for future */}
            <Select
              value={(table.filters.filters.courseId as string) || " "}
              onValueChange={(value) => {
                if (value === " ") {
                  table.filters.clearFilter("courseId");
                } else {
                  table.filters.setFilter("courseId", value);
                }
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Semua Kursus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Semua Kursus</SelectItem>
                {/* TODO: Load instructor's courses dynamically */}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {table.filters.hasActiveFilters && (
              <Button
                variant="outline"
                onClick={table.filters.clearAllFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Siswa
            {table.total > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({table.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable<InstructorStudent>
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
            pageSizeOptions={[10, 20, 50]}
            showPagination={true}
            showPageSizeSelector={true}
            showPageNumbers={true}
            emptyMessage={
              table.filters.hasActiveFilters || table.filters.search
                ? "Tidak ada siswa yang sesuai dengan filter"
                : "Belum ada siswa yang terdaftar di kursus Anda"
            }
            loadingMessage="Memuat daftar siswa..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
