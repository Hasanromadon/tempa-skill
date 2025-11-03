"use client";

import { EmptyState, LoadingScreen, PageHeader } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCourses, useIsAuthenticated } from "@/hooks";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, ROUTES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, Search, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, error } = useCourses({
    page,
    limit,
    search: search || undefined,
    published: true,
  });
  const { isAuthenticated } = useIsAuthenticated();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <PageHeader
        title="Jelajahi Kursus"
        description="Temukan kursus berbasis teks dengan sesi langsung"
        action={
          !isAuthenticated ? (
            <div className="flex gap-2">
              <Link href={ROUTES.LOGIN}>
                <Button
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                >
                  Masuk
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  Mulai
                </Button>
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* Search */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari kursus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <LoadingScreen message="Memuat kursus..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">
              Gagal memuat kursus. Silakan coba lagi.
            </p>
          </div>
        ) : data && data.courses.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.courses.map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    {/* Course Thumbnail */}
                    <div className="relative w-full h-48 bg-gray-200">
                      {course.thumbnail_url ? (
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600">
                          <BookOpen className="h-16 w-16 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Badge
                          className={
                            DIFFICULTY_COLORS[
                              course.difficulty as keyof typeof DIFFICULTY_COLORS
                            ] || DIFFICULTY_COLORS.beginner
                          }
                        >
                          {DIFFICULTY_LABELS[
                            course.difficulty as keyof typeof DIFFICULTY_LABELS
                          ] || course.difficulty}
                        </Badge>
                        {course.is_enrolled && (
                          <Badge variant="outline">Terdaftar</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.lesson_count} pelajaran</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.enrolled_count} siswa</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-gray-500 capitalize">
                          {course.category}
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                          {formatCurrency(course.price)}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className={
                          course.is_enrolled
                            ? "w-full border-orange-600 text-orange-600 hover:bg-orange-50"
                            : "w-full bg-orange-600 hover:bg-orange-700 text-white"
                        }
                        variant={course.is_enrolled ? "outline" : "default"}
                      >
                        {course.is_enrolled
                          ? "Lanjutkan Belajar"
                          : "Lihat Kursus"}
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.total > limit && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <span className="text-sm text-gray-600">
                  Halaman {page} dari {Math.ceil(data.total / limit)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(data.total / limit)}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="Tidak ada kursus ditemukan"
            description="Coba sesuaikan pencarian Anda atau coba lagi nanti."
          />
        )}
      </div>
    </div>
  );
}
