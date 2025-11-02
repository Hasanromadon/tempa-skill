"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLogin } from "@/hooks";
import { setAuthToken } from "@/lib/auth-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const login = useLogin();
  const [apiError, setApiError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(""); // Clear previous error
    try {
      const result = await login.mutateAsync(data);

      // Ensure token is saved before redirecting
      if (result.data?.token) {
        setAuthToken(result.data.token);
        toast.success("Login berhasil!", {
          description: `Selamat datang kembali, ${result.data.user.name}!`,
        });
        // Small delay to ensure storage is complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push(redirectTo);
      }
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message || "Email atau kata sandi salah";

      // Show error inline using state (survives Fast Refresh)
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {apiError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="john@example.com"
                {...register("email")}
                disabled={login.isPending}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                disabled={login.isPending}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={login.isPending}
            >
              {login.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sedang masuk...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Daftar
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
