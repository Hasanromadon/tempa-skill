"use client";

import { EmptyState, LoadingScreen, PageHeader } from "@/components/common";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsAuthenticated } from "@/hooks";
import { ROUTES } from "@/lib/constants";
import {
  Bell,
  Calendar,
  CalendarDays,
  Clock,
  ExternalLink,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Types
interface LiveSession {
  id: number;
  title: string;
  course_title: string;
  course_slug: string;
  instructor_name: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  current_participants: number;
  meeting_url: string;
  description: string;
  is_registered: boolean;
}

// Mock data for live sessions - in real app this would come from API
const mockSessions = [
  {
    id: 1,
    title: "Q&A: Pemrograman Web Modern dengan React",
    course_title: "Pemrograman Web Modern dengan React & Next.js",
    course_slug: "pemrograman-web-modern-react-nextjs",
    instructor_name: "Ahmad Rahman",
    scheduled_at: "2025-11-15T14:00:00Z",
    duration_minutes: 90,
    max_participants: 50,
    current_participants: 23,
    meeting_url: "https://zoom.us/j/example123",
    description:
      "Sesi tanya jawab langsung untuk kursus React. Bawa pertanyaan Anda tentang hooks, state management, dan best practices dalam pengembangan React.",
    is_registered: true,
  },
  {
    id: 2,
    title: "Live Coding: Database Design & Optimization",
    course_title: "Database Design & SQL Optimization",
    course_slug: "database-design-sql-optimization",
    instructor_name: "Siti Nurhaliza",
    scheduled_at: "2025-11-20T16:00:00Z",
    duration_minutes: 120,
    max_participants: 40,
    current_participants: 18,
    meeting_url: "https://zoom.us/j/example456",
    description:
      "Sesi live coding dimana kita akan mendesain dan mengoptimalkan database untuk aplikasi skala besar.",
    is_registered: false,
  },
  {
    id: 3,
    title: "Career Talk: Menjadi Full-Stack Developer",
    course_title: "Full-Stack Development Bootcamp",
    course_slug: "fullstack-development-bootcamp",
    instructor_name: "Budi Santoso",
    scheduled_at: "2025-11-25T13:00:00Z",
    duration_minutes: 60,
    max_participants: 100,
    current_participants: 67,
    meeting_url: "https://zoom.us/j/example789",
    description:
      "Diskusi karir dengan praktisi industri. Pelajari tentang skill yang dibutuhkan, gaji, dan tips sukses di dunia development.",
    is_registered: true,
  },
];

export default function SessionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const [sessions] = useState<LiveSession[]>(mockSessions);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen message="Memuat sesi live..." />;
  }

  if (!isAuthenticated) return null;

  const upcomingSessions = sessions.filter((session) => {
    const sessionTime = new Date(session.scheduled_at);
    return sessionTime > new Date();
  });

  const pastSessions = sessions.filter((session) => {
    const sessionTime = new Date(session.scheduled_at);
    return sessionTime <= new Date();
  });

  const nextSession = upcomingSessions.sort(
    (a, b) =>
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Sesi Live"
        description="Bergabung dalam sesi tanya jawab dan live coding bersama instruktur"
        backHref={ROUTES.DASHBOARD}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Next Session Highlight */}
        {nextSession && (
          <Card className="mb-8 bg-linear-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <CardTitle className="text-orange-800">
                  Sesi Selanjutnya
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {nextSession.title}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {nextSession.course_title}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(nextSession.scheduled_at).toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(nextSession.scheduled_at).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      WIB
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Button
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={() =>
                      window.open(nextSession.meeting_url, "_blank")
                    }
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Gabung Sesi
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    {nextSession.current_participants}/
                    {nextSession.max_participants} peserta
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions List */}
        <div className="space-y-6">
          {/* Upcoming Sessions */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Sesi Mendatang
            </h2>
            {upcomingSessions.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="Tidak ada sesi mendatang"
                description="Belum ada jadwal sesi live untuk saat ini. Pantau terus untuk update terbaru!"
              />
            ) : (
              <div className="grid gap-4">
                {upcomingSessions.map((session) => (
                  <SessionCard key={session.id} session={session} />
                ))}
              </div>
            )}
          </div>

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sesi Sebelumnya
              </h2>
              <div className="grid gap-4">
                {pastSessions.slice(0, 3).map((session) => (
                  <SessionCard key={session.id} session={session} isPast />
                ))}
              </div>
              {pastSessions.length > 3 && (
                <div className="text-center mt-4">
                  <Button variant="outline">Lihat Semua Sesi Sebelumnya</Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Alert */}
        <Alert className="mt-8">
          <Calendar className="h-4 w-4" />
          <AlertDescription>
            <strong>Jadwal Regular:</strong> Sesi live diadakan setiap 2 minggu
            sekali. Pastikan untuk mendaftar kursus yang Anda minati agar
            mendapat undangan otomatis.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

function SessionCard({
  session,
  isPast = false,
}: {
  session: LiveSession;
  isPast?: boolean;
}) {
  const sessionTime = new Date(session.scheduled_at);
  const now = new Date();
  const isUpcoming = sessionTime > now;
  const isLive =
    isUpcoming && sessionTime.getTime() - now.getTime() < 15 * 60 * 1000; // 15 minutes

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        isLive ? "ring-2 ring-green-500" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {session.title}
              </h3>
              {isLive && (
                <Badge className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse" />
                  LIVE
                </Badge>
              )}
              {isPast && <Badge variant="secondary">Selesai</Badge>}
            </div>

            <p className="text-gray-600 mb-3">{session.course_title}</p>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {sessionTime.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {sessionTime.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {session.current_participants}/{session.max_participants}
              </div>
            </div>

            <p className="text-sm text-gray-700 mb-4">{session.description}</p>

            <div className="text-sm text-gray-600">
              <strong>Instruktur:</strong> {session.instructor_name}
            </div>
          </div>

          <div className="ml-6 text-right">
            {isUpcoming ? (
              <div className="space-y-2">
                <Button
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => window.open(session.meeting_url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {isLive ? "Gabung Sekarang" : "Gabung Sesi"}
                </Button>
                <p className="text-xs text-gray-500">
                  Durasi: {session.duration_minutes} menit
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Button variant="outline" disabled>
                  Sesi Selesai
                </Button>
                <Link href={`/courses/${session.course_slug}`}>
                  <Button variant="outline" size="sm">
                    Lihat Kursus
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
