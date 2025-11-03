"use client";

import { FormField, FormWrapper, SubmitButton } from "@/components/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRegister } from "@/hooks";
import { setAuthToken } from "@/lib/auth-token";
import { MESSAGES, ROUTES } from "@/lib/constants";
import { registerSchema, type RegisterInput } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function RegisterPage() {
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
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push(ROUTES.DASHBOARD);
      }
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message ||
        "Pendaftaran gagal. Silakan coba lagi.";
      setApiError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Buat Akun
          </CardTitle>
          <CardDescription className="text-center">
            Bergabung dengan TempaSKill untuk mulai belajar
          </CardDescription>
        </CardHeader>
        <FormWrapper
          methods={methods}
          onSubmit={methods.handleSubmit(onSubmit)}
          error={apiError}
        >
          <CardContent className="space-y-4">
            <FormField
              name="name"
              label="Nama Lengkap"
              type="text"
              placeholder="John Doe"
              disabled={registerMutation.isPending}
            />
            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              disabled={registerMutation.isPending}
            />
            <FormField
              name="password"
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              description="Minimal 6 karakter"
              disabled={registerMutation.isPending}
            />
            <FormField
              name="confirmPassword"
              label="Konfirmasi Kata Sandi"
              type="password"
              placeholder="••••••••"
              disabled={registerMutation.isPending}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <SubmitButton
              loading={registerMutation.isPending}
              loadingText="Membuat akun..."
              fullWidth
            >
              Buat Akun
            </SubmitButton>
            <p className="text-center text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link
                href={ROUTES.LOGIN}
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Masuk
              </Link>
            </p>
          </CardFooter>
        </FormWrapper>
      </Card>
    </div>
  );
}
