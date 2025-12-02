"use client";

import {
  FormField,
  FormWrapper,
  LoadingScreen,
  SubmitButton,
} from "@/components/common";
import { Card, CardContent } from "@/components/ui/card";
import { useLogin } from "@/hooks";
import { setAuthToken } from "@/lib/auth-token";
import { MESSAGES, ROUTES } from "@/lib/constants";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || ROUTES.DASHBOARD;
  const login = useLogin();
  const [apiError, setApiError] = useState<string>("");

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const handleFormSubmit = async (data: LoginInput) => {
    setApiError("");
    try {
      const result = await login.mutateAsync(data);

      if (result.data?.token) {
        setAuthToken(result.data.token);
        toast.success(MESSAGES.AUTH.LOGIN_SUCCESS, {
          description: `Selamat datang kembali, ${result.data.user.name}!`,
        });

        // Delay for better UX perception
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Role-based redirect logic
        const userRole = result.data.user.role;

        if (userRole === "admin") {
          router.push("/admin/dashboard");
        } else if (userRole === "instructor") {
          router.push("/instructor/dashboard");
        } else {
          router.push(redirectTo);
        }
      }
    } catch (err: unknown) {
      const error = err as ApiError;
      const errorMessage =
        error.response?.data?.error?.message || "Email atau kata sandi salah";
      setApiError(errorMessage);
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* 🌟 1. LEFT COLUMN: VISUAL BRANDING (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Patterns */}
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
            Mulai Perjalanan Karir Teknologi Anda
          </h2>
          <div className="space-y-4 text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p>Akses ratusan materi pembelajaran berkualitas</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p>Mentoring langsung dengan praktisi industri</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <p>Sertifikat kompetensi yang diakui</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          &copy; 2025 TempaSkill. All rights reserved.
        </div>
      </div>

      {/* 🌟 2. RIGHT COLUMN: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-white p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (Visible only on mobile) */}
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
              Selamat Datang Kembali
            </h1>
            <p className="text-slate-500 mt-2">
              Masuk untuk melanjutkan pembelajaran Anda.
            </p>
          </div>

          <Card className="border-none shadow-none md:border md:border-slate-200 md:shadow-sm">
            <CardContent className="p-0 md:p-6">
              <FormWrapper
                methods={methods}
                onSubmit={methods.handleSubmit(handleFormSubmit, (errors) => {
                  console.error("Form validation errors:", errors);
                })}
                error={apiError}
              >
                <div className="space-y-4">
                  <FormField
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="nama@email.com"
                    disabled={login.isPending}
                    className="h-11"
                  />
                  <div className="space-y-1">
                    <FormField
                      name="password"
                      label="Kata Sandi"
                      type="password"
                      placeholder="••••••••"
                      disabled={login.isPending}
                      className="h-11"
                    />
                    <div className="text-right">
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        Lupa kata sandi?
                      </Link>
                    </div>
                  </div>

                  <SubmitButton
                    loading={login.isPending}
                    loadingText="Sedang masuk..."
                    fullWidth
                    className="h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold mt-6 shadow-md shadow-orange-100"
                  >
                    Masuk Sekarang
                  </SubmitButton>
                </div>
              </FormWrapper>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-slate-600">
            Belum memiliki akun?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-all"
            >
              Daftar Gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <LoadingScreen message="Memuat..." />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
