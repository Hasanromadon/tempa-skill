import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Users, Zap, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Belajar Keterampilan Melalui
              <span className="text-orange-600"> Kursus Berbasis Teks</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
              TempaSKill menawarkan pembelajaran efisien melalui materi berbasis
              teks yang dikombinasikan dengan sesi langsung dua minggu sekali
              untuk Q&A interaktif dan live coding.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/courses">
                <Button
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8"
                >
                  Jelajahi Kursus
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50 text-lg px-8"
                >
                  Mulai Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Mengapa TempaSKill?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Pendekatan hybrid untuk pembelajaran online
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <BookOpen className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Pembelajaran Berbasis Teks</CardTitle>
                <CardDescription>
                  Kursus efisien dan hemat bandwidth yang dapat Anda baca sesuai
                  kecepatan Anda sendiri
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Sesi Langsung</CardTitle>
                <CardDescription>
                  Sesi Zoom/Meet dua minggu sekali untuk Q&A dan pembelajaran
                  interaktif
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Cepat & Mudah Diakses</CardTitle>
                <CardDescription>
                  Belajar di mana saja, bahkan dengan bandwidth internet
                  terbatas
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>Lacak Kemajuan</CardTitle>
                <CardDescription>
                  Pantau perjalanan belajar Anda dan selesaikan kursus sesuai
                  kecepatan Anda
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-orange-600 py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white">Siap Mulai Belajar?</h2>
          <p className="mt-4 text-lg text-orange-100">
            Bergabung dengan ribuan siswa yang belajar efisien dengan TempaSKill
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-8"
              >
                Buat Akun Gratis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <p>&copy; 2025 TempaSKill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
