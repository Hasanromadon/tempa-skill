"use client";

import { LoadingScreen } from "@/components/common";
import { SiteHeader } from "@/components/common/site-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useChangePassword,
  useIsAuthenticated,
  useUpdateProfile,
} from "@/hooks";
import { PASSWORD_MIN_LENGTH, ROUTES } from "@/lib/constants";
import { getError } from "@/lib/get-error";
import {
  GraduationCap,
  Info,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Save,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function ProfilePage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
  } = useIsAuthenticated();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // --- STATE ---
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Sync state with user data
  useEffect(() => {
    if (user) {
      if (user.name && user.name !== name) {
        setName(user.name);
      }
      if (user.bio && user.bio !== bio) {
        setBio(user.bio);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name, user?.bio]);

  // --- HANDLERS ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim();

    if (!finalName) {
      toast.error("Validasi Gagal", { description: "Nama tidak boleh kosong" });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: finalName,
        bio: bio.trim() || undefined,
      });
      toast.success("Profil Diperbarui", {
        description: "Informasi Anda berhasil disimpan.",
      });
    } catch (err: unknown) {
      const error = getError(err as ApiError, "Gagal memperbarui profil");
      toast.error("Gagal Memperbarui Profil", {
        description: error,
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Validasi Gagal", {
        description: "Mohon isi semua kolom kata sandi.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Validasi Gagal", {
        description: "Konfirmasi kata sandi tidak cocok.",
      });
      return;
    }

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      toast.error("Kata Sandi Lemah", {
        description: `Minimal ${PASSWORD_MIN_LENGTH} karakter diperlukan.`,
      });
      return;
    }

    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      toast.success("Kata Sandi Diubah", {
        description: "Akun Anda kini lebih aman. Silakan login ulang.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const error = getError(err as ApiError, "Gagal mengubah kata sandi");
      toast.error("Gagal Mengubah Kata Sandi", {
        description: error,
      });
    }
  };

  if (authLoading) return <LoadingScreen message="Memuat profil..." />;
  if (!isAuthenticated) {
    router.push(ROUTES.LOGIN);
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* 🌟 1. CLEAN HEADER */}
      <SiteHeader title="Pengaturan Akun" backHref={ROUTES.DASHBOARD} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 🌟 2. LEFT SIDEBAR: PROFILE & INFO */}
          <div className="lg:col-span-4 space-y-6">
            {/* Identity Card */}
            <Card className="border-none shadow-sm bg-white overflow-hidden pt-0">
              <div className="h-24 bg-linear-to-r from-orange-500 to-amber-500"></div>
              <div className="px-4 pb-4 -mt-14 text-center">
                <Avatar className="w-20 h-20 border-4 border-white mx-auto shadow-md">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback className="bg-slate-800 text-white font-bold text-xl">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg mt-2">{user?.name}</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <Badge
                  variant="secondary"
                  className="mt-2 bg-orange-100 text-orange-700 hover:bg-orange-100"
                >
                  Student
                </Badge>
              </div>
            </Card>

            {/* ℹ️ Informative Card: Account Status */}
            <Card className="border border-blue-100 bg-blue-50/50 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Status Akun: Aktif
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Anda memiliki akses penuh ke semua materi gratis dan kursus
                  yang telah Anda beli. Pastikan untuk menyelesaikan verifikasi
                  email untuk keamanan ekstra.
                </p>
              </CardContent>
            </Card>

            {/* ℹ️ Informative Card: Security Tips */}
            <Card className="border border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-500" /> Tips Keamanan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-600">
                    Gunakan password unik yang tidak digunakan di website lain.
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-600">
                    Perbarui password Anda secara berkala (tiap 3-6 bulan).
                  </p>
                </div>
                <div className="flex gap-3 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <p className="text-xs text-slate-600">
                    Jangan bagikan kredensial akun Anda kepada siapapun.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 🌟 3. RIGHT CONTENT: FORMS */}
          <div className="lg:col-span-8">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 p-0 mb-6 h-auto rounded-none gap-6">
                <TabsTrigger
                  value="profile"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none px-0 pb-3 text-slate-500 data-[state=active]:text-orange-600 font-medium transition-all"
                >
                  Edit Profil
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-orange-600 rounded-none px-0 pb-3 text-slate-500 data-[state=active]:text-orange-600 font-medium transition-all"
                >
                  Kata Sandi
                </TabsTrigger>
              </TabsList>

              {/* PROFILE FORM */}
              <TabsContent value="profile" className="mt-0">
                <Card className="border border-slate-200 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                    <CardDescription>
                      Perbarui informasi publik di profil Anda.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Nama Lengkap</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 h-11 focus-visible:ring-orange-500"
                            placeholder="Masukkan nama lengkap"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            id="email"
                            value={user?.email}
                            disabled
                            className="pl-10 h-11 bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
                          />
                        </div>
                        {/* ℹ️ Informative Help Text */}
                        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 mt-1">
                          <Info className="w-3 h-3 shrink-0" />
                          Email terdaftar tidak dapat diubah untuk menjaga
                          keamanan akun. Hubungi admin jika perlu bantuan.
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Ceritakan sedikit tentang Anda, minat belajar, atau pekerjaan saat ini..."
                          className="min-h-[120px] focus-visible:ring-orange-500 resize-none p-3 leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button
                          type="submit"
                          disabled={updateProfile.isPending}
                          className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px] h-11 font-medium shadow-sm shadow-orange-200"
                        >
                          {updateProfile.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              Simpan Profil
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* SECURITY FORM */}
              <TabsContent value="security" className="mt-0">
                <Card className="border border-slate-200 shadow-sm bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg">Ubah Kata Sandi</CardTitle>
                    <CardDescription>
                      Pastikan akun Anda aman dengan kata sandi yang kuat.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert
                      variant="default"
                      className="bg-blue-50 border-blue-100 mb-6"
                    >
                      <Info className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">
                        Persyaratan Password
                      </AlertTitle>
                      <AlertDescription className="text-blue-700 text-xs mt-1">
                        Minimal {PASSWORD_MIN_LENGTH} karakter. Gunakan
                        kombinasi huruf besar, huruf kecil, dan angka untuk
                        keamanan maksimal.
                      </AlertDescription>
                    </Alert>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="grid gap-2">
                        <Label htmlFor="current_password">
                          Kata Sandi Lama
                        </Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type="password"
                            id="current_password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="pl-10 h-11 focus-visible:ring-orange-500"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <Separator className="my-2" />

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                          <Label htmlFor="new_password">Kata Sandi Baru</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              type="password"
                              id="new_password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              className="pl-10 h-11 focus-visible:ring-orange-500"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="confirm_password">
                            Konfirmasi Kata Sandi
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              type="password"
                              id="confirm_password"
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="pl-10 h-11 focus-visible:ring-orange-500"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button
                          type="submit"
                          disabled={changePassword.isPending}
                          // ✅ CONSISTENT BUTTON STYLE
                          className="bg-orange-600 hover:bg-orange-700 text-white min-w-[140px] h-11 font-medium shadow-sm shadow-orange-200"
                        >
                          {changePassword.isPending ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Memproses...
                            </>
                          ) : (
                            "Update Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
