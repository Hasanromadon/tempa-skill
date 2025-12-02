"use client";

import { LoadingScreen } from "@/components/common";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useIsAdmin, useIsAuthenticated } from "@/hooks/use-auth";
import { removeAuthToken } from "@/lib/auth-token";
import { ROUTES } from "@/lib/constants";
import {
  BookOpen,
  Building2,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
  const { isAdmin, isLoading: roleLoading, user } = useIsAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isLoading = authLoading || roleLoading;
  const isInstructor = user?.role === "instructor";

  // Admin navigation (only for admin role)
  const navItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Kursus",
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      label: "Pengguna",
      href: "/admin/users",
      icon: Users,
    },
    {
      label: "Pembayaran",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      label: "Penarikan Dana",
      href: "/admin/withdrawals",
      icon: Wallet,
    },
    {
      label: "Validasi Rekening",
      href: "/admin/withdrawals/bank-accounts",
      icon: Building2,
    },
    {
      label: "Pengaturan",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  useEffect(() => {
    if (!isLoading) {
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        router.replace(ROUTES.LOGIN);
        return;
      }

      // Only admin can access /admin routes
      if (!isAdmin) {
        toast.error("Akses Ditolak", {
          description: "Halaman ini hanya untuk admin.",
        });
        // Redirect instructor to their dashboard
        if (isInstructor) {
          router.replace("/instructor/dashboard");
        } else {
          router.replace(ROUTES.DASHBOARD);
        }
        return;
      }
    }
  }, [isAuthenticated, isAdmin, isInstructor, isLoading, router]);

  const handleLogout = () => {
    removeAuthToken();
    toast.success("Berhasil keluar", {
      description: "Anda telah keluar dari panel admin.",
    });
    router.push(ROUTES.HOME);
  };

  if (isLoading) {
    return <LoadingScreen message="Memuat panel admin..." />;
  }

  // Block non-admin users - don't render anything
  if (!isAuthenticated || !isAdmin || !user) {
    return <LoadingScreen message="Mengalihkan..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-200 w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between p-4 border-b">
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                TempaSKill
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              aria-label="Tutup sidebar"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-label={`Buka halaman ${item.label}`}
                >
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full"
                  aria-label="Keluar dari panel admin"
                >
                  <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                  Keluar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Keluar dari Panel Admin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Anda yakin ingin keluar dari panel admin? Anda harus login
                    kembali untuk mengakses panel ini.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Ya, Keluar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all ${sidebarOpen ? "lg:ml-64" : "ml-0"}`}>
        {/* Top Bar (Mobile) */}
        <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka sidebar"
            >
              <Menu className="h-6 w-6" />
            </Button>
            <span className="text-lg font-semibold">Panel Admin</span>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>
        </div>

        {/* Page Content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>

      {/* Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
