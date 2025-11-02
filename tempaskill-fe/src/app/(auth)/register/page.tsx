"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRegister } from "@/hooks";
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

const registerSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    password_confirmation: z
      .string()
      .min(8, "Konfirmasi kata sandi minimal 8 karakter"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Kata sandi tidak cocok",
    path: ["password_confirmation"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [apiError, setApiError] = useState<string>("");

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(""); // Clear previous error
    try {
      const result = await register.mutateAsync(data);

      // Ensure token is saved before redirecting
      if (result.data?.token) {
        setAuthToken(result.data.token);
        toast.success("Pendaftaran berhasil!", {
          description: `Selamat datang di TempaSKill, ${result.data.user.name}!`,
        });
        // Small delay to ensure storage is complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push("/dashboard");
      }
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message ||
        "Pendaftaran gagal. Silakan coba lagi.";

      // Show error inline using state (survives Fast Refresh)
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {apiError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                {...registerField("name")}
                disabled={register.isPending}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                placeholder="john@example.com"
                {...registerField("email")}
                disabled={register.isPending}
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
                {...registerField("password")}
                disabled={register.isPending}
              />
              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
              <p className="text-xs text-gray-500">Minimal 8 karakter</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                Konfirmasi Kata Sandi
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                {...registerField("password_confirmation")}
                disabled={register.isPending}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-600">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              disabled={register.isPending}
            >
              {register.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat akun...
                </>
              ) : (
                "Buat Akun"
              )}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-medium text-orange-600 hover:text-orange-700"
              >
                Masuk
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
