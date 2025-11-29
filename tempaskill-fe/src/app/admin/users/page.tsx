"use client";

import { ColumnDef, DataTable } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useServerTable } from "@/hooks";
import type { User } from "@/hooks/use-users";
import { Search, X } from "lucide-react";
import { useMemo } from "react";

// Response type from backend /users endpoint
interface UsersApiResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Admin Users List Page
 *
 * Uses same pattern as Admin Courses Page:
 * - useServerTable hook for server-side pagination/filtering
 * - DataTable component for consistent UI
 * - Filter controls for role and search
 */
export default function AdminUsersPage() {
  // Server-side table with filters
  // Custom response parser for users endpoint
  const table = useServerTable<User>({
    queryKey: ["admin-users"],
    endpoint: "users",
    initialLimit: 10,
    initialFilters: {},
    responseParser: {
      getItems: (res: unknown) => (res as UsersApiResponse)?.users || [],
      getTotal: (res: unknown) => (res as UsersApiResponse)?.total || 0,
      getTotalPages: (res: unknown) =>
        (res as UsersApiResponse)?.total_pages || 1,
    },
  });

  // Role badge renderer
  const getRoleBadge = (role: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      admin: { color: "bg-red-100 text-red-800", label: "Admin" },
      instructor: {
        color: "bg-purple-100 text-purple-800",
        label: "Instruktur",
      },
      student: { color: "bg-blue-100 text-blue-800", label: "Siswa" },
    };
    const variant = variants[role] || variants.student;
    return (
      <Badge className={variant.color} variant="secondary">
        {variant.label}
      </Badge>
    );
  };

  // Column definitions for DataTable
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "name",
        accessor: "name",
        header: "Nama",
        enableSorting: false,
        cell: (ctx) => (
          <span className="font-medium">{ctx.getValue() as string}</span>
        ),
      },
      {
        id: "email",
        accessor: "email",
        header: "Email",
        enableSorting: false,
        cell: (ctx) => (
          <span className="text-gray-600">{ctx.getValue() as string}</span>
        ),
      },
      {
        id: "role",
        accessor: "role",
        header: "Role",
        enableSorting: false,
        cell: (ctx) => getRoleBadge(ctx.getValue() as string),
      },
      {
        id: "created_at",
        accessor: "created_at",
        header: "Bergabung",
        enableSorting: false,
        cell: (ctx) => {
          const date = new Date(ctx.getValue() as string);
          return (
            <span className="text-gray-600">
              {date.toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
        <p className="text-gray-600 mt-1">
          Lihat dan kelola semua pengguna platform
        </p>
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

            {/* Role Filter */}
            <Select
              value={(table.filters.filters.role as string) || " "}
              onValueChange={(value) => {
                if (value === " ") {
                  table.filters.clearFilter("role");
                } else {
                  table.filters.setFilter("role", value);
                }
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Semua Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=" ">Semua Role</SelectItem>
                <SelectItem value="student">Siswa</SelectItem>
                <SelectItem value="instructor">Instruktur</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
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

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Pengguna
            {table.total > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({table.total} total)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DataTable<User>
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
                ? "Tidak ada pengguna yang sesuai dengan filter"
                : "Belum ada pengguna terdaftar"
            }
            loadingMessage="Memuat daftar pengguna..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
