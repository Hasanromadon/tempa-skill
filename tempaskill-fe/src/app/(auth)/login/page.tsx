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
import { useLogin } from "@/hooks";
import { setAuthToken } from "@/lib/auth-token";
import { MESSAGES, ROUTES } from "@/lib/constants";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || ROUTES.DASHBOARD;
  const login = useLogin();
  const [apiError, setApiError] = useState<string>("");

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setApiError("");
    try {
      const result = await login.mutateAsync(data);

      if (result.data?.token) {
        setAuthToken(result.data.token);
        toast.success(MESSAGES.AUTH.LOGIN_SUCCESS, {
          description: `Selamat datang kembali, ${result.data.user.name}!`,
        });
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push(redirectTo);
      }
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message || "Email atau kata sandi salah";
      setApiError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Selamat Datang Kembali
          </CardTitle>
          <CardDescription className="text-center">
            Masuk ke akun TempaSKill Anda
          </CardDescription>
        </CardHeader>
        <FormWrapper
          methods={methods}
          onSubmit={methods.handleSubmit(onSubmit)}
          error={apiError}
        >
          <CardContent className="space-y-4">
            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="john@example.com"
              disabled={login.isPending}
            />
            <FormField
              name="password"
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              disabled={login.isPending}
            />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <SubmitButton
              loading={login.isPending}
              loadingText="Sedang masuk..."
              fullWidth
            >
              Masuk
            </SubmitButton>
            <p className="text-center text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                href={ROUTES.REGISTER}
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Daftar
              </Link>
            </p>
          </CardFooter>
        </FormWrapper>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
