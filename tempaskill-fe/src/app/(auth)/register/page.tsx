"use client";

import { FormField, FormWrapper, SubmitButton } from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { useRegister } from "@/hooks";
import { setAuthToken } from "@/lib/auth-token";
import { MESSAGES, ROUTES } from "@/lib/constants";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

// ✅ Type Definitions
interface ApiError {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
  message?: string;
}

function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [apiError, setApiError] = useState<string>("");

  const methods = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setApiError("");
    try {
      // Transform data to match API expectations
      const { confirmPassword, ...rest } = data;
      const result = await registerMutation.mutateAsync({
        ...rest,
        password_confirmation: confirmPassword,
      });

      if (result.data?.token) {
        setAuthToken(result.data.token);
        toast.success(MESSAGES.AUTH.REGISTER_SUCCESS, {
          description: `Selamat datang di TempaSKill, ${result.data.user.name}!`,
        });
        await new Promise((resolve) => setTimeout(resolve, 500));
        router.push(ROUTES.DASHBOARD);
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.error?.message ||
        "Pendaftaran gagal. Silakan coba lagi.";
      setApiError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 🌟 1. LEFT COLUMN: VISUAL BRANDING (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-600/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        <div className="relative z-10">
          <Link
            href="/"
            className="flex items-center gap-2 w-fit hover:opacity-80 transition-opacity"
          >
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">TempaSkill</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Bergabung dengan Komunitas Pembelajar
          </h2>
          <div className="space-y-4 text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p>Akses gratis ke materi dasar berkualitas</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p>Undangan eksklusif ke sesi live mentoring</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p>Simpan progress belajar Anda selamanya</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          &copy; 2025 TempaSkill. All rights reserved.
        </div>
      </div>

      {/* 🌟 2. RIGHT COLUMN: REGISTER FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8 my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-orange-600 p-1.5 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                TempaSkill
              </span>
            </Link>
          </div>

          <div className="text-center lg:text-left">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-slate-500 hover:text-orange-600 mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Buat Akun Baru
            </h1>
            <p className="text-slate-500 mt-2">
              Isi data diri Anda untuk memulai perjalanan belajar.
            </p>
          </div>

          <Card className="border-none shadow-none md:border md:border-slate-200 md:shadow-sm">
            <CardContent className="p-0 md:p-6">
              <FormWrapper
                methods={methods}
                onSubmit={methods.handleSubmit(onSubmit)}
                error={apiError}
              >
                <div className="space-y-4">
                  <FormField
                    name="name"
                    label="Nama Lengkap"
                    type="text"
                    placeholder="John Doe"
                    disabled={registerMutation.isPending}
                    className="h-11"
                  />
                  <FormField
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="john@example.com"
                    disabled={registerMutation.isPending}
                    className="h-11"
                  />
                  <FormField
                    name="password"
                    label="Kata Sandi"
                    type="password"
                    placeholder="••••••••"
                    description="Minimal 6 karakter"
                    disabled={registerMutation.isPending}
                    className="h-11"
                  />
                  <FormField
                    name="confirmPassword"
                    label="Konfirmasi Kata Sandi"
                    type="password"
                    placeholder="••••••••"
                    disabled={registerMutation.isPending}
                    className="h-11"
                  />

                  <SubmitButton
                    loading={registerMutation.isPending}
                    loadingText="Membuat akun..."
                    fullWidth
                    className="h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold mt-6 shadow-md shadow-orange-100"
                  >
                    Daftar Sekarang
                  </SubmitButton>
                </div>
              </FormWrapper>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-600 pb-8 lg:pb-0">
            Sudah punya akun?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-all"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
