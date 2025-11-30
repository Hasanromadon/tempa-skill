"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInstructorStudents } from "@/hooks";
import { exportToCSV } from "@/lib/export-csv";
import {
  BookOpen,
  Download,
  Eye,
  Mail,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function InstructorStudentsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("");

  const { data, isLoading, error } = useInstructorStudents({
    page,
    limit,
    search,
    courseId: courseFilter ? parseInt(courseFilter) : undefined,
  });

  // Export to CSV
  const handleExport = () => {
    if (!data?.students || data.students.length === 0) {
      toast.error("Tidak ada data untuk diekspor");
      return;
    }

    exportToCSV(
      data.students,
      [
        { key: "name", label: "Nama" },
        { key: "email", label: "Email" },
        { key: "total_enrollments", label: "Total Kursus" },
        { key: "completed_courses", label: "Kursus Selesai" },
        {
          key: "overall_progress",
          label: "Progress (%)",
          format: (val) => `${(val as number).toFixed(1)}%`,
        },
        { key: "joined_at", label: "Bergabung" },
      ],
      "students-report"
    );

    toast.success("Data berhasil diekspor");
  };

  const totalStudents = data?.total || 0;
  const avgProgress =
    (data?.students?.reduce((sum, s) => sum + s.overall_progress, 0) || 0) /
      (data?.students?.length || 1) || 0;
  const activeStudents =
    data?.students?.filter((s) => s.overall_progress > 0).length || 0;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Siswa Saya</h1>
        <p className="text-gray-600 mt-2">
          Kelola dan pantau progress siswa yang terdaftar di kursus Anda
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            <p className="text-xs text-gray-500 mt-1">
              Sudah mulai belajar
            </p>
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

      {/* Filters & Actions */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari nama atau email siswa..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Course Filter - Placeholder for future enhancement */}
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Semua Kursus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua Kursus</SelectItem>
                {/* TODO: Load instructor's courses dynamically */}
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              variant="outline"
              className="w-full md:w-auto"
            >
              <Download className="h-4 w-4 mr-2" />
              Ekspor CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Siswa</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">Gagal memuat data siswa</p>
              <p className="text-sm text-gray-500 mt-2">
                {error instanceof Error ? error.message : "Terjadi kesalahan"}
              </p>
            </div>
          ) : !data?.students || data.students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Belum ada siswa yang terdaftar
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Siswa akan muncul di sini setelah mendaftar di kursus Anda
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Siswa</TableHead>
                      <TableHead>Kursus Terdaftar</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Bergabung</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="text-orange-600 font-semibold">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-gray-500">
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="secondary">
                              {student.total_enrollments} kursus
                            </Badge>
                            {student.enrolled_courses.length > 0 && (
                              <p className="text-xs text-gray-500 line-clamp-2">
                                {student.enrolled_courses.join(", ")}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                {student.completed_courses}/
                                {student.total_enrollments} selesai
                              </span>
                              <span className="font-medium">
                                {student.overall_progress.toFixed(0)}%
                              </span>
                            </div>
                            <Progress
                              value={student.overall_progress}
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {new Date(student.joined_at).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              title="Lihat Detail"
                            >
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {data.total_pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Menampilkan {(page - 1) * limit + 1} -{" "}
                    {Math.min(page * limit, data.total)} dari {data.total}{" "}
                    siswa
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) => Math.min(data.total_pages, p + 1))
                      }
                      disabled={page === data.total_pages}
                    >
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
