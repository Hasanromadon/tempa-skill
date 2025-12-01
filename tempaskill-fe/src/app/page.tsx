"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Globe,
  PenTool,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
// ✅ IMPORT BARU
import { CourseCardPublic } from "@/components/course/course-card-public";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCourses } from "@/hooks";

export default function Home() {
  // ✅ Fetch Data Kursus Terbaru
  const { data: coursesData, isLoading: coursesLoading } = useCourses({
    page: 1,
    limit: 4, // Ambil 4 kursus terbaru
    sortBy: "created_at",
    sortOrder: "desc",
    published: true,
  });

  const latestCourses = coursesData?.courses || [];

  return (
    <div className="flex min-h-screen flex-col font-sans">
      {/* 🌟 1. HERO SECTION */}
      <section className="relative bg-slate-900 overflow-hidden">
        {/* ... (Kode Hero Section SAMA SEPERTI SEBELUMNYA) ... */}
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-900/30 border border-orange-500/30 text-orange-400 text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                Platform Belajar Hybrid #1 di Indonesia
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
                Kuasai Keahlian Baru <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-400">
                  Tanpa Batas Waktu
                </span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Tingkatkan karir Anda dengan materi pembelajaran fleksibel. Baca
                materi kapan saja, hemat kuota, dan konsultasi langsung dengan
                mentor ahli.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/courses" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 h-12 shadow-lg shadow-orange-900/20"
                  >
                    Mulai Belajar Sekarang
                  </Button>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12"
                  >
                    Pelajari Metode Kami
                  </Button>
                </Link>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Akses
                  Seumur Hidup
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Mentor
                  Praktisi
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Sertifikat
                  Resmi
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 relative flex justify-center">
              <div className="relative w-full max-w-md aspect-square bg-gradient-to-tr from-slate-800 to-slate-900 rounded-3xl border border-slate-700 shadow-2xl p-8 flex flex-col justify-between overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-slate-700 rounded-full animate-pulse"></div>
                    <div className="h-8 w-8 bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="h-32 bg-slate-800/50 rounded-xl border border-slate-700 p-4">
                    <div className="h-full flex items-end gap-2 justify-around">
                      <div className="w-8 h-[40%] bg-blue-500/20 rounded-t-sm"></div>
                      <div className="w-8 h-[60%] bg-blue-500/40 rounded-t-sm"></div>
                      <div className="w-8 h-[30%] bg-blue-500/20 rounded-t-sm"></div>
                      <div className="w-8 h-[80%] bg-orange-500 rounded-t-sm shadow-[0_0_15px_rgba(249,115,22,0.5)]"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-700 rounded-full"></div>
                    <div className="h-2 w-2/3 bg-slate-700 rounded-full"></div>
                  </div>
                </div>

                <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-4 border border-slate-700 flex items-center gap-4 mt-6">
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Progress Belajar</p>
                    <p className="text-white font-bold text-lg">
                      +124%{" "}
                      <span className="text-xs font-normal text-slate-500">
                        minggu ini
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 2. CATEGORY SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Eksplorasi Bidang Keahlian
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Kami menyediakan berbagai topik pembelajaran untuk mendukung
              pengembangan diri dan karir Anda.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                icon: Briefcase,
                label: "Bisnis & Manajemen",
                color: "text-blue-600",
                bg: "bg-blue-100",
              },
              {
                icon: PenTool,
                label: "Desain & Kreatif",
                color: "text-pink-600",
                bg: "bg-pink-100",
              },
              {
                icon: BarChart3,
                label: "Digital Marketing",
                color: "text-green-600",
                bg: "bg-green-100",
              },
              {
                icon: Globe,
                label: "Bahasa Asing",
                color: "text-orange-600",
                bg: "bg-orange-100",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:border-orange-200 hover:shadow-lg transition-all cursor-pointer text-center"
              >
                <div
                  className={`w-14 h-14 mx-auto rounded-full ${item.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900">{item.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🌟 NEW: LATEST COURSES PREVIEW SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 mb-3 px-3 py-1">
                Baru Dirilis
              </Badge>
              <h2 className="text-3xl font-bold text-slate-900">
                Kursus Terbaru
              </h2>
              <p className="text-slate-600 mt-2 max-w-xl">
                Materi pembelajaran terupdate yang disusun oleh praktisi
                industri.
              </p>
            </div>
            <Link href="/courses">
              <Button
                variant="ghost"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 group"
              >
                Lihat Semua Kursus{" "}
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-48 w-full rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : latestCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestCourses.map((course) => (
                <CourseCardPublic key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500">
                Belum ada kursus yang tersedia saat ini.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 🌟 3. FEATURES SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4 px-4 py-1 text-sm">
              Metode Kami
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Lebih Dari Sekadar Membaca
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Kombinasi materi teks terstruktur dengan interaksi manusia nyata
              membuat belajar jadi efektif.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={BookOpen}
              title="Modul Teks Interaktif"
              desc="Materi disusun sistematis dengan studi kasus nyata. Bisa diakses kapan saja tanpa menunggu loading video."
            />
            <FeatureCard
              icon={Users}
              title="Live Mentoring Rutin"
              desc="Setiap 2 minggu, gabung sesi Zoom eksklusif untuk bedah kode dan tanya jawab langsung dengan mentor."
            />
            <FeatureCard
              icon={Zap}
              title="Fokus Praktik"
              desc="Teori secukupnya, praktik sebanyaknya. Setiap bab dilengkapi tantangan yang relevan dengan industri."
            />
          </div>
        </div>
      </section>

      {/* 🌟 4. FAQ SECTION */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-10">
            Pertanyaan Sering Diajukan
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-slate-200">
              <AccordionTrigger className="text-slate-900 font-semibold hover:no-underline hover:text-orange-600">
                Apakah cocok untuk pemula?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Tentu saja! Kursus kami memiliki tingkatan mulai dari pemula
                (Beginner) hingga mahir (Advanced). Kami membimbing Anda langkah
                demi langkah.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b border-slate-200">
              <AccordionTrigger className="text-slate-900 font-semibold hover:no-underline hover:text-orange-600">
                Bagaimana sistem belajarnya?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Anda akan mendapatkan akses ke materi bacaan terstruktur yang
                bisa diselesaikan sesuai kecepatan Anda (self-paced). Selain
                itu, ada jadwal sesi live mentoring untuk tanya jawab.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b border-slate-200">
              <AccordionTrigger className="text-slate-900 font-semibold hover:no-underline hover:text-orange-600">
                Apakah ada sertifikat?
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                Ya, setelah menyelesaikan seluruh materi dan tugas dalam kursus,
                Anda akan mendapatkan sertifikat penyelesaian yang dapat
                digunakan untuk portofolio karir.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* 🌟 5. CTA SECTION */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="bg-orange-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle, white 2px, transparent 2px)",
                backgroundSize: "30px 30px",
              }}
            ></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Siap Mengembangkan Diri?
              </h2>
              <p className="text-orange-100 text-lg mb-8 leading-relaxed">
                Jangan biarkan tahun ini berlalu tanpa upgrade skill. Gabung
                dengan komunitas pembelajar TempaSkill hari ini.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-10 h-14 text-lg w-full sm:w-auto"
                  >
                    Buat Akun Gratis
                  </Button>
                </Link>
                <Link href="/courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 font-bold px-10 h-14 text-lg w-full sm:w-auto bg-transparent"
                  >
                    Lihat Katalog <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 6. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4 text-white">
                <div className="bg-orange-600 p-1.5 rounded">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">TempaSkill</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                Platform edukasi modern untuk meningkatkan keterampilan
                profesional Anda secara efisien.
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Eksplorasi</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/courses"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Katalog Kursus
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Program Intensif
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Webinar Gratis
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Karir
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Mitra Pengajar
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Pusat Bantuan
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Syarat & Ketentuan
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-orange-500 transition-colors"
                  >
                    Kebijakan Privasi
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm">
            <p>&copy; 2025 TempaSkill. Hak Cipta Dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Component for Feature
function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-slate-50/50 hover:bg-white">
      <CardHeader>
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-xl font-bold text-slate-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base text-slate-600 leading-relaxed">
          {desc}
        </CardDescription>
      </CardContent>
    </Card>
  );
}
