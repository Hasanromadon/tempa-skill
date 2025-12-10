"use client";

import { formatCurrency } from "@/app/utils/format-currency";
import { EmptyState, LoadingScreen, PageHeader } from "@/components/common";
import {
  FilterSidebar,
  SearchBar,
  SortDropdown,
  type CourseFilters,
} from "@/components/course";
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
import { useCourses, useIsAuthenticated } from "@/hooks";
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, ROUTES } from "@/lib/constants";
import { BookOpen, Filter, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL parameters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [sortBy, setSortBy] = useState(
    searchParams.get("sort_by") || "created_at"
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get("sort_order") || "desc"
  );
  const [filters, setFilters] = useState<CourseFilters>({
    category: searchParams.get("category") || undefined,
    difficulty:
      (searchParams.get("difficulty") as
        | "beginner"
        | "intermediate"
        | "advanced") || undefined,
    minPrice: searchParams.get("min_price")
      ? parseFloat(searchParams.get("min_price")!)
      : undefined,
    maxPrice: searchParams.get("max_price")
      ? parseFloat(searchParams.get("max_price")!)
      : undefined,
    instructorId: searchParams.get("instructor_id")
      ? parseInt(searchParams.get("instructor_id")!)
      : undefined,
  });
  const [showFilters, setShowFilters] = useState(false);

  const limit = 12;

  // Update URL when filters change
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (page > 1) params.set("page", page.toString());
    if (sortBy !== "created_at") params.set("sort_by", sortBy);
    if (sortOrder !== "desc") params.set("sort_order", sortOrder);

    if (filters.category) params.set("category", filters.category);
    if (filters.difficulty) params.set("difficulty", filters.difficulty);
    if (filters.minPrice && filters.minPrice > 0)
      params.set("min_price", filters.minPrice.toString());
    if (filters.maxPrice && filters.maxPrice < 1000000)
      params.set("max_price", filters.maxPrice.toString());
    if (filters.instructorId)
      params.set("instructor_id", filters.instructorId.toString());

    const queryString = params.toString();
    const newURL = queryString ? `/courses?${queryString}` : "/courses";

    router.replace(newURL, { scroll: false });
  }, [search, page, sortBy, sortOrder, filters, router]);

  // Update URL when state changes
  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const { data, isLoading, error } = useCourses({
    page,
    limit,
    search: search || undefined,
    category: filters.category,
    difficulty: filters.difficulty,
    sortBy,
    sortOrder,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    instructorId: filters.instructorId,
    published: true,
  });

  const { isAuthenticated } = useIsAuthenticated();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page
  };

  const handleFiltersChange = (newFilters: CourseFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
    setPage(1); // Reset to first page
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

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

      {/* Search and Controls */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari kursus..."
                className="max-w-md"
              />
            </div>

            {/* Sort and Filter Controls */}
            <div className="flex items-center gap-4">
              <SortDropdown
                value={`${sortBy}-${sortOrder}`}
                onValueChange={handleSortChange}
              />

              <Button
                variant="outline"
                size="sm"
                onClick={toggleFilters}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={showFilters}
            onToggle={toggleFilters}
            className="hidden lg:block"
          />

          {/* Courses Grid */}
          <div className="flex-1">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                description="Coba sesuaikan pencarian atau filter Anda."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
