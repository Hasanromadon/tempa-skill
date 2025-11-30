"use client";

import { EmptyState, LoadingScreen } from "@/components/common";
import {
  FilterSidebar,
  SortDropdown,
  type CourseFilters,
} from "@/components/course";
import { CourseCardPublic } from "@/components/course/course-card-public";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCourses, useIsAuthenticated, useLogout } from "@/hooks";
import { removeAuthToken } from "@/lib/auth-token";
import { ROUTES } from "@/lib/constants";
import {
  BookOpen,
  Code,
  Database,
  Filter,
  LayoutDashboard,
  LogOut,
  MonitorPlay,
  Palette,
  Rocket,
  Search,
  ShieldCheck,
  Terminal,
  Trophy,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

export default function CoursesPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Memuat Marketplace..." />}>
      <CoursesPageContent />
    </Suspense>
  );
}

function CoursesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ AUTH STATE
  const { user, isAuthenticated } = useIsAuthenticated();
  const logout = useLogout();

  // --- STATE MANAGEMENT ---
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

  // --- LOGIC ---
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

  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = () => {
    logout();
    removeAuthToken();
    router.push(ROUTES.LOGIN);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* 🌟 1. HERO SECTION: DARK MODE (Anti-Silau) */}
      <div className="bg-slate-950 text-white relative overflow-hidden">
        {/* Abstract Shapes for subtle detail */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* Navbar Row */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                TempaSKill
              </span>
            </div>

            {/* User Profile / Auth Buttons */}
            <div>
              {!isAuthenticated ? (
                <div className="flex gap-3">
                  <Link href={ROUTES.LOGIN}>
                    <Button
                      variant="ghost"
                      className="text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Masuk
                    </Button>
                  </Link>
                  <Link href={ROUTES.REGISTER}>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white border-none">
                      Daftar Gratis
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link
                    href={ROUTES.DASHBOARD || "/dashboard"}
                    className="hidden sm:block"
                  >
                    <Button
                      variant="ghost"
                      className="text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-full hover:bg-white/10"
                      >
                        <Avatar className="h-9 w-9 border border-white/20">
                          <AvatarImage
                            src={user?.avatar_url}
                            alt={user?.name}
                          />
                          <AvatarFallback className="bg-orange-600 text-white font-bold">
                            {getInitials(user?.name || "U")}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    {/* ... (Dropdown Content sama seperti sebelumnya) ... */}
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>
                        {user?.name}
                        <p className="text-xs font-normal text-gray-500">
                          {user?.email}
                        </p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => router.push("/dashboard")}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push("/profile")}>
                        <UserIcon className="mr-2 h-4 w-4" /> Profil
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" /> Keluar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center pb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
              Kuasai Skill Masa Depan <br />
              <span className="text-orange-500">Tanpa Video Buffer</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Platform belajar pemrograman berbasis teks interaktif. Lebih
              cepat, lebih hemat kuota, dan fokus pada praktik coding.
            </p>

            {/* Search Bar Embedded in Hero */}
            <div className="max-w-2xl mx-auto bg-white p-2 rounded-full shadow-2xl flex items-center">
              <div className="pl-4 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Cari Python, React, atau Data Science..."
                className="flex-1 px-4 py-3 outline-none text-gray-800 placeholder:text-gray-400"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              <Button
                size="lg"
                className="rounded-full bg-orange-600 hover:bg-orange-700 px-8"
              >
                Cari
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex flex-wrap justify-center gap-8 md:gap-16 text-sm font-medium text-gray-300">
            <span className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Sertifikat Valid
            </span>
            <span className="flex items-center gap-2">
              <MonitorPlay className="w-4 h-4 text-blue-400" /> Live Mentoring
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" /> Garansi Update
            </span>
          </div>
        </div>
      </div>

      {/* 🌟 2. VARIATION: POPULAR CATEGORIES (Breaking the grid monotony) */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">
              Kategori Populer
            </h2>
            <Link
              href="#"
              className="text-sm text-orange-600 font-semibold hover:underline"
            >
              Lihat Semua
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Hardcoded visual categories for UI appeal */}
            <CategoryCard
              icon={Code}
              label="Web Development"
              color="bg-blue-100 text-blue-600"
            />
            <CategoryCard
              icon={Terminal}
              label="Backend"
              color="bg-green-100 text-green-600"
            />
            <CategoryCard
              icon={Database}
              label="Data Science"
              color="bg-purple-100 text-purple-600"
            />
            <CategoryCard
              icon={Palette}
              label="UI/UX Design"
              color="bg-pink-100 text-pink-600"
            />
            <CategoryCard
              icon={Rocket}
              label="Startup"
              color="bg-orange-100 text-orange-600"
            />
          </div>
        </div>
      </div>

      {/* 🌟 3. MAIN CONTENT: FILTER & GRID */}
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Jelajahi Kursus
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Menampilkan {data?.total || 0} kursus tersedia
            </p>
          </div>

          <div className="flex items-center gap-3">
            <SortDropdown
              value={`${sortBy}-${sortOrder}`}
              onValueChange={handleSortChange}
            />
            <Button
              variant="outline"
              onClick={toggleFilters}
              className={`gap-2 ${
                showFilters ? "bg-gray-100 border-gray-300" : ""
              }`}
            >
              {showFilters ? (
                <X className="h-4 w-4" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
              Filter
            </Button>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar */}
          <FilterSidebar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isOpen={showFilters}
            onToggle={toggleFilters}
            className={`hidden lg:block w-64 shrink-0 sticky top-24 ${
              showFilters ? "block" : "hidden lg:hidden"
            }`}
          />

          <div className="flex-1 min-w-0">
            {isFetching ? (
              <div className="py-20">
                <LoadingScreen message="Memuat materi..." />
              </div>
            ) : error ? (
              <div className="text-center py-20 bg-white border rounded-xl">
                <p className="text-red-500">Gagal memuat data.</p>
                <Button variant="link" onClick={() => window.location.reload()}>
                  Coba Lagi
                </Button>
              </div>
            ) : data && data.courses.length > 0 ? (
              <div className="space-y-12">
                {/* GRID UTAMA */}
                <div
                  className={`grid gap-6 ${
                    showFilters
                      ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1 md:grid-cols-3 xl:grid-cols-4"
                  }`}
                >
                  {data.courses.map((course) => (
                    <CourseCardPublic key={course.id} course={course} />
                  ))}
                </div>

                {/* 🌟 4. VARIATION: PROMO BANNER DI TENGAH (Visual Break) */}
                <div className="rounded-2xl bg-linear-to-r from-gray-900 to-slate-800 p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  <div className="relative z-10 max-w-lg">
                    <Badge className="bg-orange-500 hover:bg-orange-600 mb-4 border-none">
                      Untuk Pengajar
                    </Badge>
                    <h3 className="text-2xl font-bold mb-2">
                      Bagikan Pengetahuan Anda
                    </h3>
                    <p className="text-gray-400 mb-6">
                      Bergabunglah dengan komunitas instruktur kami dan bantu
                      ribuan siswa belajar skill baru.
                    </p>
                    <Button className="bg-white text-gray-900 hover:bg-gray-100">
                      Mulai Mengajar
                    </Button>
                  </div>
                  {/* Decorative element replacing image for simplicity */}
                  <div className="relative z-10 bg-white/5 p-6 rounded-xl border border-white/10 backdrop-blur-sm transform rotate-3 hover:rotate-0 transition-transform">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-xl font-bold">
                        Rp
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          Potensi Penghasilan
                        </p>
                        <p className="text-lg font-bold">
                          Rp 5.000.000
                          <span className="text-xs font-normal text-gray-400">
                            /bln
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination */}
                {data.total > limit && (
                  <div className="flex justify-center pt-4">
                    <div className="flex items-center gap-2 bg-white border p-1 rounded-lg">
                      <Button
                        variant="ghost"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Sebelumnya
                      </Button>
                      <span className="px-4 font-medium text-sm">
                        Halaman {page}
                      </span>
                      <Button
                        variant="ghost"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= Math.ceil(data.total / limit)}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="Kursus tidak ditemukan"
                description="Coba kata kunci lain."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Sub-component untuk Kategori (Visual Only)
function CategoryCard({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  color: string;
}) {
  return (
    <div className="min-w-40 p-4 rounded-xl border border-gray-100 bg-white hover:shadow-md transition-shadow cursor-pointer group flex flex-col items-center text-center gap-3">
      <div
        className={`p-3 rounded-full ${color} group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-medium text-gray-700 text-sm">{label}</span>
    </div>
  );
}
