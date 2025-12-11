"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCourses, useCreateSession } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import { ApiError, getError } from "@/lib/get-error";
import { ArrowLeft, Calendar, Clock, Users, Video } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CreateSessionForm {
  course_id: number;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  meeting_url: string;
}

export default function NewSessionPage() {
  const router = useRouter();
  const { data: coursesData } = useCourses({ published: true });
  const createSession = useCreateSession();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateSessionForm>();

  const courses = coursesData?.courses || [];

  const onSubmit = async (data: CreateSessionForm) => {
    try {
      await createSession.mutateAsync({
        course_id: Number(data.course_id),
        title: data.title,
        description: data.description,
        scheduled_at: new Date(data.scheduled_at).toISOString(),
        duration_minutes: Number(data.duration_minutes),
        max_participants: Number(data.max_participants),
        meeting_url: data.meeting_url,
      });

      router.push(ROUTES.ADMIN.SESSIONS);
    } catch (err: unknown) {
      const message = getError(err as ApiError, "Gagal membuat sesi");

      toast.error("Gagal membuat sesi", {
        description: message,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={ROUTES.ADMIN.SESSIONS}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Buat Sesi Live Baru</h1>
          <p className="text-gray-600">
            Jadwalkan sesi live untuk berinteraksi dengan siswa
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Informasi Dasar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="course_id">Kursus</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("course_id", Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kursus" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id.toString()}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.course_id && (
                  <p className="text-sm text-red-600 mt-1">
                    Kursus harus dipilih
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="title">Judul Sesi</Label>
                <Input
                  id="title"
                  {...register("title", { required: "Judul sesi wajib diisi" })}
                  placeholder="Contoh: Q&A: React Hooks & State Management"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Jelaskan topik yang akan dibahas dalam sesi ini..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Jadwal & Pengaturan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scheduled_at">Tanggal & Waktu</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  {...register("scheduled_at", {
                    required: "Jadwal sesi wajib diisi",
                  })}
                />
                {errors.scheduled_at && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.scheduled_at.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="duration_minutes">Durasi (menit)</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("duration_minutes", Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih durasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 menit</SelectItem>
                    <SelectItem value="60">1 jam</SelectItem>
                    <SelectItem value="90">1.5 jam</SelectItem>
                    <SelectItem value="120">2 jam</SelectItem>
                    <SelectItem value="180">3 jam</SelectItem>
                  </SelectContent>
                </Select>
                {errors.duration_minutes && (
                  <p className="text-sm text-red-600 mt-1">
                    Durasi harus dipilih
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="max_participants">Kapasitas Peserta</Label>
                <Select
                  onValueChange={(value) =>
                    setValue("max_participants", Number(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kapasitas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 peserta</SelectItem>
                    <SelectItem value="25">25 peserta</SelectItem>
                    <SelectItem value="50">50 peserta</SelectItem>
                    <SelectItem value="100">100 peserta</SelectItem>
                    <SelectItem value="200">200 peserta</SelectItem>
                  </SelectContent>
                </Select>
                {errors.max_participants && (
                  <p className="text-sm text-red-600 mt-1">
                    Kapasitas harus dipilih
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="meeting_url">Link Meeting</Label>
                <Input
                  id="meeting_url"
                  {...register("meeting_url")}
                  placeholder="https://zoom.us/j/..."
                />
                <p className="text-sm text-gray-600 mt-1">
                  Link Zoom, Google Meet, atau platform meeting lainnya
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Pastikan jadwal tidak bentrok dengan sesi lainnya
                </p>
                <p className="flex items-center gap-2 mt-1">
                  <Users className="h-4 w-4" />
                  Siswa akan mendapat notifikasi otomatis saat mendaftar kursus
                </p>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" asChild>
                  <Link href={ROUTES.ADMIN.SESSIONS}>Batal</Link>
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={createSession.isPending}
                >
                  {createSession.isPending ? "Membuat..." : "Buat Sesi"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
