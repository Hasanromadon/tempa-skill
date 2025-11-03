"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useIsAuthenticated, useUpdateProfile, useChangePassword } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useIsAuthenticated();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Profile form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Error states
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/login");
    return null;
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");

    const finalName = name.trim() || user?.name || "";
    const finalBio = bio.trim() || user?.bio || "";

    if (!finalName) {
      setProfileError("Nama tidak boleh kosong");
      toast.error("Validasi gagal", {
        description: "Nama tidak boleh kosong",
      });
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: finalName,
        bio: finalBio || undefined,
      });

      toast.success("Profil berhasil diperbarui!", {
        description: "Perubahan profil Anda telah disimpan.",
      });
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message || "Gagal memperbarui profil";
      setProfileError(errorMessage);
      toast.error("Gagal memperbarui profil", {
        description: errorMessage,
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Semua field kata sandi harus diisi");
      toast.error("Validasi gagal", {
        description: "Semua field kata sandi harus diisi",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Kata sandi baru tidak cocok");
      toast.error("Validasi gagal", {
        description: "Kata sandi baru dan konfirmasi tidak cocok",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Kata sandi baru minimal 6 karakter");
      toast.error("Validasi gagal", {
        description: "Kata sandi baru minimal 6 karakter",
      });
      return;
    }

    try {
      await changePassword.mutateAsync({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      toast.success("Kata sandi berhasil diubah!", {
        description: "Kata sandi Anda telah diperbarui.",
      });

      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { error?: { message?: string } } } })
          .response?.data?.error?.message || "Gagal mengubah kata sandi";
      setPasswordError(errorMessage);
      toast.error("Gagal mengubah kata sandi", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Profil Saya</h1>
              <p className="text-gray-600">Kelola informasi profil Anda</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* User Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-orange-600" />
                </div>
                <div>
                  <CardTitle>{user?.name}</CardTitle>
                  <CardDescription>{user?.email}</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Edit Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Edit Profil
              </CardTitle>
              <CardDescription>
                Perbarui informasi profil Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {profileError && (
                  <Alert variant="destructive">
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={user?.name || "Masukkan nama lengkap"}
                    disabled={updateProfile.isPending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-sm text-gray-500">
                    Email tidak dapat diubah
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={user?.bio || "Ceritakan sedikit tentang diri Anda..."}
                    rows={4}
                    disabled={updateProfile.isPending}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Separator />

          {/* Change Password Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Ubah Kata Sandi
              </CardTitle>
              <CardDescription>
                Perbarui kata sandi akun Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Kata Sandi Saat Ini *</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi saat ini"
                    disabled={changePassword.isPending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Kata Sandi Baru *</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                    disabled={changePassword.isPending}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Konfirmasi Kata Sandi Baru *
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Masukkan ulang kata sandi baru"
                    disabled={changePassword.isPending}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700"
                  disabled={changePassword.isPending}
                >
                  {changePassword.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mengubah...
                    </>
                  ) : (
                    "Ubah Kata Sandi"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
