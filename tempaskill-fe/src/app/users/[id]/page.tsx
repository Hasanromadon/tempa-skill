"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { use } from "react";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface UserDetail {
  id: number;
  name: string;
  email: string;
  role: string;
  bio: string;
  avatar_url: string;
  status: string;
  created_at: string;
  enrolled_count: number;
  completed_count: number;
}

interface EnrolledCourse {
  id: number;
  title: string;
  slug: string;
  thumbnail_url: string;
  progress_percentage: number;
  enrolled_at: string;
  last_accessed_at: string;
  completed_at: string | null;
}

interface UserCertificate {
  id: number;
  course_title: string;
  issued_at: string;
  certificate_url: string;
}

/**
 * User Detail Page
 *
 * Shows comprehensive user information including:
 * - Profile details
 * - Enrolled courses with progress
 * - Certificates earned
 * - Activity statistics
 */
export default function UserDetailPage({ params }: PageProps) {
  const { id } = use(params);

  // Fetch user details
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user-detail", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserDetail>>(
        `/users/${id}`
      );
      return response.data.data;
    },
  });

  // Fetch enrolled courses
  const { data: enrolledCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["user-enrolled-courses", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<EnrolledCourse[]>>(
        `/users/${id}/enrollments`
      );
      return response.data.data || [];
    },
  });

  // Fetch certificates
  const { data: certificates } = useQuery({
    queryKey: ["user-certificates", id],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserCertificate[]>>(
        `/users/${id}/certificates`
      );
      return response.data.data || [];
    },
  });

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

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge className="bg-green-100 text-green-800" variant="secondary">
        <CheckCircle className="h-3 w-3 mr-1" />
        Aktif
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800" variant="secondary">
        Ditangguhkan
      </Badge>
    );
  };

  if (userLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Pengguna tidak ditemukan</p>
            <Link href="/admin/users">
              <Button variant="outline" className="mt-4">
                Kembali ke Daftar Pengguna
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Detail Pengguna</h1>
          <p className="text-gray-600 mt-1">
            Informasi lengkap dan aktivitas pengguna
          </p>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-24 h-24 rounded-full bg-linear-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Bergabung{" "}
                    {new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {user.bio && (
                <div className="mt-4">
                  <p className="text-gray-700">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kursus Diambil</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.enrolled_count}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Kursus Selesai</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.completed_count}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Sertifikat</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certificates?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle>
            Kursus yang Diambil ({enrolledCourses?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex-1">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="font-semibold text-gray-900 hover:text-orange-600"
                    >
                      {course.title}
                    </Link>
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">
                          {course.progress_percentage}%
                        </span>
                      </div>
                      <Progress value={course.progress_percentage} />
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Terdaftar{" "}
                        {new Date(course.enrolled_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                      {course.last_accessed_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Terakhir diakses{" "}
                          {new Date(course.last_accessed_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  {course.completed_at && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Selesai
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">Belum ada kursus yang diambil</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certificates */}
      {certificates && certificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sertifikat ({certificates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-3 p-4 border rounded-lg"
                >
                  <Award className="h-8 w-8 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {cert.course_title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Diterbitkan{" "}
                      {new Date(cert.issued_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <Link href={cert.certificate_url} target="_blank">
                    <Button size="sm" variant="outline">
                      Lihat
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
