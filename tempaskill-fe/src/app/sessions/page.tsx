"use client";

import { EmptyState, LoadingScreen } from "@/components/common";
import { SiteHeader } from "@/components/common/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useIsAuthenticated,
  useRegisterForSession,
  useSessions,
  useUnregisterFromSession,
} from "@/hooks";
import { ROUTES } from "@/lib/constants";
import type { Session } from "@/types/api";
import {
  Calendar,
  CalendarDays,
  Clock,
  ExternalLink,
  History,
  Info,
  Loader2,
  Users,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SessionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useIsAuthenticated();
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions();
  const registerForSession = useRegisterForSession();
  const unregisterFromSession = useUnregisterFromSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || sessionsLoading) {
    return <LoadingScreen message="Memuat sesi live..." />;
  }

  if (!isAuthenticated) return null;

  const sessions = sessionsData?.items || [];

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

  const handleRegisterToggle = async (
    sessionId: number,
    isRegistered: boolean
  ) => {
    try {
      if (isRegistered) {
        await unregisterFromSession.mutateAsync(sessionId);
      } else {
        await registerForSession.mutateAsync(sessionId);
      }
    } catch (error) {
      console.error("Failed to update registration:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 🌟 1. CLEAN HEADER */}
      <SiteHeader title="Jadwal Sesi Live" backHref={ROUTES.DASHBOARD} />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* 🌟 2. NEXT SESSION HIGHLIGHT */}
        {nextSession && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-orange-600" />
              Sesi Mendatang Terdekat
            </h2>
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Video className="w-32 h-32 text-orange-600 rotate-12" />
              </div>

              <CardContent className="p-6 md:p-8 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
                  <div className="flex-1">
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none mb-3">
                      Recommended
                    </Badge>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      {nextSession.title}
                    </h3>
                    <p className="text-slate-600 mb-6 max-w-2xl">
                      {nextSession.description ||
                        "Bergabunglah untuk diskusi mendalam tentang topik ini bersama instruktur ahli kami."}
                    </p>

                    <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-lg border border-orange-100">
                          <Calendar className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400">
                            Tanggal
                          </span>
                          <span className="font-semibold">
                            {new Date(
                              nextSession.scheduled_at
                            ).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-lg border border-orange-100">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400">Waktu</span>
                          <span className="font-semibold">
                            {new Date(
                              nextSession.scheduled_at
                            ).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            WIB
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-lg border border-orange-100">
                          <Users className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-400">Kuota</span>
                          <span className="font-semibold">
                            {nextSession.current_participants}/
                            {nextSession.max_participants} Peserta
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[200px]">
                    {nextSession.is_registered ? (
                      <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200 h-11"
                        onClick={() =>
                          window.open(nextSession.meeting_url, "_blank")
                        }
                      >
                        <Video className="w-4 h-4 mr-2" /> Gabung Sesi
                      </Button>
                    ) : (
                      <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200 h-11"
                        onClick={() =>
                          handleRegisterToggle(nextSession.id, false)
                        }
                        disabled={registerForSession.isPending}
                      >
                        {registerForSession.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          "Daftar Sesi Ini"
                        )}
                      </Button>
                    )}

                    {nextSession.is_registered && (
                      <Button
                        variant="outline"
                        className="border-orange-200 text-orange-700 hover:bg-orange-50 bg-white"
                        onClick={() =>
                          handleRegisterToggle(nextSession.id, true)
                        }
                        disabled={unregisterFromSession.isPending}
                      >
                        {unregisterFromSession.isPending
                          ? "Membatalkan..."
                          : "Batalkan Pendaftaran"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 🌟 3. ALL SESSIONS LIST */}
        <div className="space-y-10">
          {/* Upcoming */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-slate-500" />
              Jadwal Sesi Lainnya
            </h2>

            {upcomingSessions.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="Tidak ada sesi mendatang"
                description="Belum ada jadwal sesi live tambahan. Fokus pada sesi terdekat!"
              />
            ) : (
              <div className="grid gap-4">
                {upcomingSessions
                  .filter((s) => s.id !== nextSession?.id) // Exclude highlighted session
                  .map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      onRegisterToggle={handleRegisterToggle}
                      registerPending={registerForSession.isPending}
                      unregisterPending={unregisterFromSession.isPending}
                    />
                  ))}
                {upcomingSessions.length === 1 &&
                  upcomingSessions[0].id === nextSession?.id && (
                    <p className="text-slate-500 italic text-sm">
                      Tidak ada sesi lain selain yang di atas.
                    </p>
                  )}
              </div>
            )}
          </div>

          {/* Past Sessions */}
          {pastSessions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-slate-500" />
                  Riwayat Sesi
                </h2>
              </div>
              <div className="grid gap-4 opacity-75 hover:opacity-100 transition-opacity">
                {pastSessions.slice(0, 3).map((session) => (
                  <SessionCard key={session.id} session={session} isPast />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 🌟 4. INFO SECTION */}
        <Alert className="mt-12 bg-blue-50 border-blue-100 text-blue-900">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="font-bold text-blue-800 mb-1">
            Informasi Jadwal
          </AlertTitle>
          <AlertDescription className="text-blue-700/90 text-sm">
            Sesi live diadakan secara rutin. Pastikan Anda mendaftar setidaknya
            1 jam sebelum sesi dimulai untuk mendapatkan link akses.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

// --- SUB COMPONENT: Session Card ---
function SessionCard({
  session,
  isPast = false,
  onRegisterToggle,
  registerPending = false,
  unregisterPending = false,
}: {
  session: Session;
  isPast?: boolean;
  onRegisterToggle?: (sessionId: number, isRegistered: boolean) => void;
  registerPending?: boolean;
  unregisterPending?: boolean;
}) {
  const sessionTime = new Date(session.scheduled_at);
  const now = new Date();
  const isUpcoming = sessionTime > now;
  const isLive =
    isUpcoming && sessionTime.getTime() - now.getTime() < 15 * 60 * 1000;

  const handleRegisterClick = () => {
    if (onRegisterToggle) {
      onRegisterToggle(session.id, session.is_registered);
    }
  };

  return (
    <Card
      className={`transition-all hover:shadow-md border-slate-200 ${
        isLive ? "ring-2 ring-green-500 border-green-500" : ""
      }`}
    >
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-slate-900">
                {session.title}
              </h3>
              {isLive && (
                <Badge className="bg-green-100 text-green-700 border-none animate-pulse">
                  LIVE NOW
                </Badge>
              )}
              {isPast && (
                <Badge
                  variant="secondary"
                  className="bg-slate-100 text-slate-600"
                >
                  Selesai
                </Badge>
              )}
              <Badge variant="outline" className="text-slate-500 font-normal">
                {session.course_title}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mb-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-slate-400" />
                {sessionTime.toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                {sessionTime.toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                WIB
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-400" />
                {session.current_participants} Peserta
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              {session.description || "Tidak ada deskripsi tambahan."}
            </p>
          </div>

          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            {isUpcoming ? (
              <>
                {session.is_registered ? (
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm w-full md:w-auto"
                    onClick={() => window.open(session.meeting_url, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-2" />
                    Link Meeting
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-50 w-full md:w-auto"
                    onClick={handleRegisterClick}
                    disabled={registerPending}
                  >
                    {registerPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      "Daftar"
                    )}
                  </Button>
                )}

                {session.is_registered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-slate-400 hover:text-red-600 h-auto p-0 hover:bg-transparent"
                    onClick={handleRegisterClick}
                    disabled={unregisterPending}
                  >
                    {unregisterPending ? "Membatalkan..." : "Batalkan"}
                  </Button>
                )}
              </>
            ) : (
              <div className="flex gap-2 w-full md:w-auto">
                <Link
                  href={`/courses/${session.course_slug}`}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-slate-600"
                  >
                    Lihat Materi Kursus
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
