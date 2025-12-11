"use client";

import { LoadingScreen } from "@/components/common";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteSession, useSessions } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import { ApiError, getError } from "@/lib/get-error";
import type { Session } from "@/types/api";
import {
  Calendar,
  Clock,
  Edit,
  Eye,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminSessionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");

  const { data: sessionsData, isLoading } = useSessions();
  const deleteSession = useDeleteSession();

  if (isLoading) {
    return <LoadingScreen message="Memuat sesi..." />;
  }

  const sessions = sessionsData?.items || [];

  // Filter sessions based on search and filters
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.course_title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = (() => {
      const now = new Date();
      const sessionTime = new Date(session.scheduled_at);

      switch (statusFilter) {
        case "upcoming":
          return sessionTime > now && !session.is_cancelled;
        case "past":
          return sessionTime <= now;
        case "cancelled":
          return session.is_cancelled;
        default:
          return true;
      }
    })();

    const matchesCourse =
      courseFilter === "all" || session.course_id.toString() === courseFilter;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const handleDeleteSession = async (sessionId: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus sesi ini?")) {
      try {
        await deleteSession.mutateAsync(sessionId);
      } catch (error) {
        const message = getError(error as ApiError, "Gagal menghapus sesi");
        toast.error("Gagal menghapus sesi", {
          description: message,
        });
      }
    }
  };

  const getStatusBadge = (session: Session) => {
    const now = new Date();
    const sessionTime = new Date(session.scheduled_at);

    if (session.is_cancelled) {
      return (
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
          Dibatalkan
        </span>
      );
    }

    if (sessionTime <= now) {
      return (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded">
          Selesai
        </span>
      );
    }

    const isLive = sessionTime.getTime() - now.getTime() < 15 * 60 * 1000; // 15 minutes
    if (isLive) {
      return (
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded animate-pulse">
          Live
        </span>
      );
    }

    return (
      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
        Akan Datang
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kelola Sesi Live</h1>
          <p className="text-gray-600">
            Buat dan kelola sesi live untuk kursus Anda
          </p>
        </div>
        <Button asChild className="bg-orange-600 hover:bg-orange-700">
          <Link href={ROUTES.ADMIN.SESSIONS_NEW}>
            <Plus className="h-4 w-4 mr-2" />
            Buat Sesi Baru
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Sesi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari sesi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="upcoming">Akan Datang</SelectItem>
                <SelectItem value="past">Selesai</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Kursus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kursus</SelectItem>
                {/* TODO: Add course options dynamically */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Sesi ({filteredSessions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada sesi
              </h3>
              <p className="text-gray-600 mb-4">
                Buat sesi live pertama Anda untuk mulai berinteraksi dengan
                siswa
              </p>
              <Button asChild className="bg-orange-600 hover:bg-orange-700">
                <Link href={ROUTES.ADMIN.SESSIONS_NEW}>
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Sesi Pertama
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sesi</TableHead>
                  <TableHead>Kursus</TableHead>
                  <TableHead>Jadwal</TableHead>
                  <TableHead>Peserta</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{session.title}</div>
                        <div className="text-sm text-gray-600">
                          {session.duration_minutes} menit
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{session.course_title}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.scheduled_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-3 w-3" />
                          {new Date(session.scheduled_at).toLocaleTimeString(
                            "id-ID",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          WIB
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        {session.current_participants}/
                        {session.max_participants}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(session)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/sessions/${session.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              Lihat Detail
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/sessions/${session.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
