"use client";

import { EmptyState, LoadingScreen, PageHeader } from "@/components/common";
import {
  FilterSidebar,
  SearchBar,
  SortDropdown,
  type CourseFilters,
} from "@/components/course";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// ✅ IMPORT SHADCN COMPONENTS
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// ✅ UPDATE HOOK IMPORT
import { CourseCardPublic } from "@/components/course/course-card-public";
import { useCourses, useIsAuthenticated, useLogout } from "@/hooks"; // Gunakan useAuth untuk dapat data user
import { removeAuthToken } from "@/lib/auth-token";
import { ROUTES } from "@/lib/constants";
import {
  BookOpen,
  Filter,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Memuat..." />}>
      <CoursesPageContent />
    </Suspense>
  );
}

function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ AUTH STATE: Ambil user dan logout dari hook
  const { user, isAuthenticated } = useIsAuthenticated();
  const logout = useLogout();

  // ... (State search, page, sortBy, filters TETAP SAMA seperti sebelumnya) ...
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

  // ... (useMemo activeFiltersCount, updateURL, dan useCourses TETAP SAMA) ...
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category) count++;
    if (filters.difficulty) count++;
    if (filters.minPrice && filters.minPrice > 0) count++;
    if (filters.maxPrice) count++;
    if (filters.instructorId) count++;
    return count;
  }, [filters]);

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

  useEffect(() => {
    updateURL();
  }, [updateURL]);

  const { data, isFetching, error } = useCourses({
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

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFiltersChange = (newFilters: CourseFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split("-");
    setSortBy(field);
    setSortOrder(order);
    setPage(1);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Helper untuk inisial nama
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logout(); // Memanggil fungsi dari useAuth
    removeAuthToken();
    router.push(ROUTES.LOGIN); // Redirect ke login
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header dengan User Profile & Logout */}
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
          ) : (
            <div className="flex items-center gap-4">
              {/* Tombol Dashboard Cepat */}
              <Link
                href={ROUTES.DASHBOARD || "/dashboard"}
                className="hidden sm:block"
              >
                <Button
                  variant="ghost"
                  className="text-gray-600 hover:text-orange-600"
                >
                  Dashboard
                </Button>
              </Link>

              {/* User Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full hover:bg-orange-50 focus:ring-2 focus:ring-orange-200"
                  >
                    <Avatar className="h-10 w-10 border border-gray-200">
                      {/* Ganti src dengan user.avatar jika ada */}
                      <AvatarImage src={user?.avatar_url} alt={user?.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-700 font-bold">
                        {getInitials(user?.name || "U")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-gray-900">
                        {user?.name || "Pengguna"}
                      </p>
                      <p className="text-xs leading-none text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <Link href={ROUTES.DASHBOARD || "/dashboard"}>
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
                      <LayoutDashboard className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Dashboard Saya</span>
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-50">
                      <UserIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <span>Profil Akun</span>
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }
      />
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={search}
                onChange={handleSearchChange}
                placeholder="Cari topik yang ingin Anda pelajari..."
                className="max-w-md w-full"
              />
            </div>
            <div className="flex items-center gap-3">
              <SortDropdown
                value={`${sortBy}-${sortOrder}`}
                onValueChange={handleSortChange}
              />
              <Button
                variant={
                  showFilters || activeFiltersCount > 0
                    ? "secondary"
                    : "outline"
                }
                size="sm"
                onClick={toggleFilters}
                className={`gap-2 h-10 px-4 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    : "hover:bg-gray-100"
                }`}
              >
                {showFilters ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Filter className="h-4 w-4" />
                )}
                Filter
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 h-5 min-w-5 px-1.5 flex items-center justify-center bg-orange-600 text-white rounded-full text-xs font-bold"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid (Sama seperti sebelumnya) */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8 items-start">
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={showFilters}
            onToggle={toggleFilters}
            className={`hidden ${
              showFilters ? "lg:block" : "lg:hidden"
            } transition-all duration-300 ease-in-out`}
          />

          <div className="flex-1 min-w-0">
            {/* ... Logika Loading/Error/Data Kursus sama seperti kode sebelumnya ... */}
            {isFetching ? (
              <LoadingScreen message="Memuat kursus..." />
            ) : error ? (
              // ... Error state
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-red-500 font-medium">Gagal memuat kursus.</p>
              </div>
            ) : data && data.courses.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  showFilters
                    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-3 xl:grid-cols-5"
                }`}
              >
                {/* Mapping CourseCard */}
                {data.courses.map((course) => (
                  <CourseCardPublic key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Tidak ada kursus"
                description="Coba filter lain."
              />
            )}

            {/* Pagination Logic (Sama seperti sebelumnya) */}
            {data && data.total > limit && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  Sebelumnya
                </Button>
                <span className="text-sm font-medium">{page}</span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(data.total / limit)}
                >
                  Selanjutnya
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
