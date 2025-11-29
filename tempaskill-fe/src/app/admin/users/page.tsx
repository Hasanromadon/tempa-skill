"use client";

import { ColumnDef, DataTable } from "@/components/common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChangeRoleDialog } from "@/components/user/change-role-dialog";
import { DeleteUserDialog } from "@/components/user/delete-user-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useChangeUserRole,
  useDeleteUser,
  useServerTable,
  useToggleUserStatus,
} from "@/hooks";
import type { User } from "@/hooks/use-users";
import { ExportColumn, exportToCSV } from "@/lib/export-csv";
import {
  Ban,
  CheckCircle,
  Download,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  Search,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

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
  // Bulk selection state
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userToChangeRole, setUserToChangeRole] = useState<{
    id: number;
    name: string;
    currentRole: string;
  } | null>(null);

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

  const deleteUser = useDeleteUser();
  const changeUserRole = useChangeUserRole();
  const toggleUserStatus = useToggleUserStatus();

  // Bulk selection handlers
  const toggleUserSelection = useCallback((userId: number) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedUsers.size === table.data.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(table.data.map((user) => user.id)));
    }
  }, [selectedUsers.size, table.data]);

  const clearSelection = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  // Bulk actions
  const handleBulkDelete = useCallback(async () => {
    const count = selectedUsers.size;
    if (count === 0) return;

    const confirmMsg = `Apakah Anda yakin ingin menghapus ${count} pengguna yang dipilih?`;
    if (!confirm(confirmMsg)) return;

    const errors: string[] = [];

    for (const userId of selectedUsers) {
      try {
        await deleteUser.mutateAsync(userId);
      } catch {
        const user = table.data.find((u) => u.id === userId);
        errors.push(user?.name || `User #${userId}`);
      }
    }

    if (errors.length === 0) {
      toast.success(`${count} pengguna berhasil dihapus`);
    } else {
      toast.error(`Gagal menghapus ${errors.length} pengguna`, {
        description: errors.join(", "),
      });
    }

    clearSelection();
    table.refetch();
  }, [selectedUsers, deleteUser, table, clearSelection]);

  const handleBulkSuspend = useCallback(async () => {
    const count = selectedUsers.size;
    if (count === 0) return;

    const confirmMsg = `Suspend ${count} pengguna yang dipilih?`;
    if (!confirm(confirmMsg)) return;

    const errors: string[] = [];

    for (const userId of selectedUsers) {
      try {
        await toggleUserStatus.mutateAsync({ userId, suspend: true });
      } catch {
        const user = table.data.find((u) => u.id === userId);
        errors.push(user?.name || `User #${userId}`);
      }
    }

    if (errors.length === 0) {
      toast.success(`${count} pengguna berhasil di-suspend`);
    } else {
      toast.error(`Gagal suspend ${errors.length} pengguna`, {
        description: errors.join(", "),
      });
    }

    clearSelection();
    table.refetch();
  }, [selectedUsers, toggleUserStatus, table, clearSelection]);

  const handleBulkActivate = useCallback(async () => {
    const count = selectedUsers.size;
    if (count === 0) return;

    const confirmMsg = `Aktifkan ${count} pengguna yang dipilih?`;
    if (!confirm(confirmMsg)) return;

    const errors: string[] = [];

    for (const userId of selectedUsers) {
      try {
        await toggleUserStatus.mutateAsync({ userId, suspend: false });
      } catch {
        const user = table.data.find((u) => u.id === userId);
        errors.push(user?.name || `User #${userId}`);
      }
    }

    if (errors.length === 0) {
      toast.success(`${count} pengguna berhasil diaktifkan`);
    } else {
      toast.error(`Gagal aktifkan ${errors.length} pengguna`, {
        description: errors.join(", "),
      });
    }

    clearSelection();
    table.refetch();
  }, [selectedUsers, toggleUserStatus, table, clearSelection]);

  // Handle export to CSV
  const handleExportCSV = useCallback(() => {
    const columns: ExportColumn<User>[] = [
      { key: "id", label: "ID" },
      { key: "name", label: "Nama" },
      { key: "email", label: "Email" },
      {
        key: "role",
        label: "Role",
        format: (value) => {
          const labels: Record<string, string> = {
            student: "Siswa",
            instructor: "Instruktur",
            admin: "Admin",
          };
          return labels[String(value)] || String(value);
        },
      },
      {
        key: "status",
        label: "Status",
        format: (value) => (value === "active" ? "Aktif" : "Ditangguhkan"),
      },
      {
        key: "enrolled_count",
        label: "Kursus Terdaftar",
        format: (value) => String(value || 0),
      },
      {
        key: "completed_count",
        label: "Kursus Selesai",
        format: (value) => String(value || 0),
      },
      {
        key: "created_at",
        label: "Tanggal Bergabung",
        format: (value) => {
          const date = new Date(String(value));
          return date.toLocaleDateString("id-ID");
        },
      },
    ];

    const filename = `pengguna_tempaskill_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    exportToCSV(table.data, columns, filename);

    toast.success("Data berhasil diekspor", {
      description: `File ${filename} telah diunduh.`,
    });
  }, [table.data]);

  // Handle delete
  const handleDeleteClick = useCallback((userId: number, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
    setDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!userToDelete) return;

    try {
      await deleteUser.mutateAsync(userToDelete.id);

      toast.success("Pengguna berhasil dihapus", {
        description: `"${userToDelete.name}" telah dihapus dari platform.`,
      });

      setDeleteDialogOpen(false);
      setUserToDelete(null);

      // Refetch users
      table.refetch();
    } catch {
      toast.error("Gagal menghapus pengguna", {
        description: "Silakan coba lagi.",
      });
    }
  }, [userToDelete, deleteUser, table]);

  // Handle change role
  const handleChangeRoleClick = useCallback(
    (userId: number, userName: string, currentRole: string) => {
      setUserToChangeRole({ id: userId, name: userName, currentRole });
      setRoleDialogOpen(true);
    },
    []
  );

  const handleRoleChangeConfirm = useCallback(
    async (newRole: "student" | "instructor" | "admin") => {
      if (!userToChangeRole) return;

      try {
        await changeUserRole.mutateAsync({
          userId: userToChangeRole.id,
          role: newRole,
        });

        const roleLabels = {
          student: "Siswa",
          instructor: "Instruktur",
          admin: "Admin",
        };

        toast.success("Role berhasil diubah", {
          description: `"${userToChangeRole.name}" sekarang ${roleLabels[newRole]}.`,
        });

        setRoleDialogOpen(false);
        setUserToChangeRole(null);

        // Refetch users
        table.refetch();
      } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } } };
        toast.error("Gagal mengubah role", {
          description: err?.response?.data?.error || "Silakan coba lagi.",
        });
      }
    },
    [userToChangeRole, changeUserRole, table]
  );

  // Handle toggle user status
  const handleToggleStatus = useCallback(
    async (userId: number, userName: string, currentStatus: string) => {
      const suspend = currentStatus === "active";
      const action = suspend ? "suspend" : "aktifkan";

      try {
        await toggleUserStatus.mutateAsync({ userId, suspend });

        toast.success(
          suspend
            ? "Pengguna berhasil disuspend"
            : "Pengguna berhasil diaktifkan",
          {
            description: `"${userName}" sekarang ${
              suspend ? "suspended" : "active"
            }.`,
          }
        );

        // Refetch users
        table.refetch();
      } catch {
        toast.error(`Gagal ${action} pengguna`, {
          description: "Silakan coba lagi.",
        });
      }
    },
    [toggleUserStatus, table]
  );

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

  // Status badge renderer
  const getStatusBadge = (status: string) => {
    if (status === "suspended") {
      return (
        <Badge className="bg-red-100 text-red-800" variant="secondary">
          Suspended
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800" variant="secondary">
        Active
      </Badge>
    );
  };

  // Column definitions for DataTable
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      // Checkbox column for bulk selection
      {
        id: "select",
        header: () => (
          <Checkbox
            checked={
              selectedUsers.size === table.data.length && table.data.length > 0
            }
            onCheckedChange={toggleSelectAll}
            aria-label="Pilih semua pengguna"
          />
        ),
        cell: (ctx) => (
          <Checkbox
            checked={selectedUsers.has(ctx.row.original.id)}
            onCheckedChange={() => toggleUserSelection(ctx.row.original.id)}
            aria-label={`Pilih ${ctx.row.original.name}`}
          />
        ),
      },
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
        id: "status",
        accessor: "status",
        header: "Status",
        enableSorting: false,
        cell: (ctx) => getStatusBadge(ctx.getValue() as string),
      },
      {
        id: "enrolled_count",
        accessor: "enrolled_count",
        header: "Kursus",
        enableSorting: false,
        cell: (ctx) => (
          <span className="text-gray-700">
            {(ctx.getValue() as number) || 0}
          </span>
        ),
      },
      {
        id: "completed_count",
        accessor: "completed_count",
        header: "Selesai",
        enableSorting: false,
        cell: (ctx) => (
          <span className="text-green-700 font-medium">
            {(ctx.getValue() as number) || 0}
          </span>
        ),
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
      {
        id: "actions",
        header: "Aksi",
        cell: (ctx) => {
          const user = ctx.row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Aksi untuk ${user.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/users/${user.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Lihat Detail
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/users/${user.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleChangeRoleClick(user.id, user.name, user.role)
                  }
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Ubah Role
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    handleToggleStatus(user.id, user.name, user.status)
                  }
                  disabled={toggleUserStatus.isPending}
                >
                  {user.status === "active" ? (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aktifkan
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDeleteClick(user.id, user.name)}
                  disabled={user.role === "admin"}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [
      selectedUsers,
      toggleSelectAll,
      toggleUserSelection,
      handleDeleteClick,
      handleChangeRoleClick,
      handleToggleStatus,
      toggleUserStatus.isPending,
      table.data.length,
    ]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kelola Pengguna</h1>
          <p className="text-gray-600 mt-1">
            Lihat dan kelola semua pengguna platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={table.data.length === 0}
            aria-label="Ekspor data ke CSV"
          >
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            Ekspor CSV
          </Button>
          <Link href="/admin/users/new">
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              aria-label="Tambah pengguna baru"
            >
              <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
              Tambah Pengguna
            </Button>
          </Link>
        </div>
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
          {/* Bulk Actions Toolbar */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  {selectedUsers.size} pengguna dipilih
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkActivate}
                  disabled={toggleUserStatus.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aktifkan Semua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkSuspend}
                  disabled={toggleUserStatus.isPending}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Suspend Semua
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={deleteUser.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Semua
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
          )}

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

      {/* Delete Confirmation Dialog */}
      <DeleteUserDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        userName={userToDelete?.name || ""}
        isDeleting={deleteUser.isPending}
      />

      {/* Change Role Dialog */}
      <ChangeRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        onConfirm={handleRoleChangeConfirm}
        userName={userToChangeRole?.name || ""}
        currentRole={userToChangeRole?.currentRole || "student"}
        isChanging={changeUserRole.isPending}
      />
    </div>
  );
}
