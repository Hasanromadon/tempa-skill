"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsAuthenticated } from "@/hooks";
import { removeAuthToken } from "@/lib/auth-token";
import { ROUTES } from "@/lib/constants";
import {
  ChevronLeft,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SiteHeaderProps {
  title?: string;
  description?: string;
  backHref?: string;
  children?: React.ReactNode; // Untuk tombol tambahan di kanan (opsional)
}

export function SiteHeader({
  title,
  description,
  backHref,
  children,
}: SiteHeaderProps) {
  const router = useRouter();
  const { user } = useIsAuthenticated();

  const handleLogout = () => {
    removeAuthToken();
    toast.success("Berhasil keluar");
    router.push(ROUTES.LOGIN);
  };

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* --- LEFT SECTION: Navigation & Title --- */}
        <div className="flex items-center gap-4">
          {backHref ? (
            <Link
              href={backHref}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              title="Kembali"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href={ROUTES.DASHBOARD}
              className="flex items-center gap-2 mr-2"
            >
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
            </Link>
          )}

          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">
              {title || "TempaSkill"}
            </h1>
            {description && (
              <p className="text-xs text-slate-500 hidden md:block">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* --- RIGHT SECTION: Actions & Profile --- */}
        <div className="flex items-center gap-3">
          {/* Custom Actions (jika ada) */}
          {children}

          {/* User Dropdown */}
          <div className="pl-3 border-l border-slate-200 ml-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full hover:bg-slate-100 focus:ring-2 focus:ring-orange-200 p-0"
                >
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarImage src={user?.avatar_url} alt={user?.name} />
                    <AvatarFallback className="bg-orange-600 text-white font-bold text-xs">
                      {getInitials(user?.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900">
                      {user?.name}
                    </p>
                    <p className="text-xs leading-none text-slate-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href={ROUTES.DASHBOARD}>
                  <DropdownMenuItem className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500" />
                    <span>Dashboard Saya</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4 text-slate-500" />
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
        </div>
      </div>
    </header>
  );
}
