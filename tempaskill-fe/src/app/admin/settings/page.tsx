"use client";

import { PageHeader } from "@/components/common";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Building2, Globe, Mail, Save, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/**
 * Admin Settings Page
 * Manage platform settings, configurations, and preferences
 */
export default function AdminSettingsPage() {
  // General Settings
  const [platformName, setPlatformName] = useState("TempaSKill");
  const [platformDescription, setPlatformDescription] = useState(
    "Platform pembelajaran online untuk meningkatkan skill Anda"
  );
  const [contactEmail, setContactEmail] = useState("admin@tempaskill.com");
  const [supportEmail, setSupportEmail] = useState("support@tempaskill.com");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [courseEnrollmentNotif, setCourseEnrollmentNotif] = useState(true);
  const [paymentNotif, setPaymentNotif] = useState(true);
  const [reviewNotif, setReviewNotif] = useState(true);

  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordExpiry, setPasswordExpiry] = useState("90");

  // Platform Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] =
    useState(true);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGeneral = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Pengaturan umum berhasil disimpan");
    setIsSaving(false);
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Pengaturan notifikasi berhasil disimpan");
    setIsSaving(false);
  };

  const handleSaveSecurity = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Pengaturan keamanan berhasil disimpan");
    setIsSaving(false);
  };

  const handleSavePlatform = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Pengaturan platform berhasil disimpan");
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola konfigurasi dan preferensi platform"
      />

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="general" className="gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Umum</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifikasi</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Keamanan</span>
          </TabsTrigger>
          <TabsTrigger value="platform" className="gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Platform</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-600" />
                Informasi Platform
              </CardTitle>
              <CardDescription>
                Konfigurasi informasi dasar platform TempaSKill
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Nama Platform</Label>
                <Input
                  id="platformName"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  placeholder="TempaSKill"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="platformDesc">Deskripsi Platform</Label>
                <Textarea
                  id="platformDesc"
                  value={platformDescription}
                  onChange={(e) => setPlatformDescription(e.target.value)}
                  placeholder="Deskripsi platform..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email Kontak</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="pl-10"
                      placeholder="admin@tempaskill.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Email Support</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="supportEmail"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="pl-10"
                      placeholder="support@tempaskill.com"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveGeneral}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                Pengaturan Notifikasi
              </CardTitle>
              <CardDescription>
                Kelola notifikasi email untuk admin dan instruktur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotif">Notifikasi Email</Label>
                  <p className="text-sm text-gray-500">
                    Aktifkan notifikasi melalui email
                  </p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enrollNotif">Pendaftaran Kursus</Label>
                  <p className="text-sm text-gray-500">
                    Notifikasi saat ada siswa mendaftar kursus
                  </p>
                </div>
                <Switch
                  id="enrollNotif"
                  checked={courseEnrollmentNotif}
                  onCheckedChange={setCourseEnrollmentNotif}
                  disabled={!emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="paymentNotif">Pembayaran</Label>
                  <p className="text-sm text-gray-500">
                    Notifikasi saat ada pembayaran kursus
                  </p>
                </div>
                <Switch
                  id="paymentNotif"
                  checked={paymentNotif}
                  onCheckedChange={setPaymentNotif}
                  disabled={!emailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reviewNotif">Review Kursus</Label>
                  <p className="text-sm text-gray-500">
                    Notifikasi saat ada review baru untuk kursus
                  </p>
                </div>
                <Switch
                  id="reviewNotif"
                  checked={reviewNotif}
                  onCheckedChange={setReviewNotif}
                  disabled={!emailNotifications}
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-600" />
                Pengaturan Keamanan
              </CardTitle>
              <CardDescription>
                Konfigurasi keamanan dan autentikasi platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="2fa">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500">
                    Aktifkan autentikasi dua faktor untuk admin
                  </p>
                </div>
                <Switch
                  id="2fa"
                  checked={twoFactorAuth}
                  onCheckedChange={setTwoFactorAuth}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (menit)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  placeholder="30"
                  min="5"
                  max="1440"
                />
                <p className="text-sm text-gray-500">
                  Durasi sesi sebelum user otomatis logout (5-1440 menit)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Password Expiry (hari)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={passwordExpiry}
                  onChange={(e) => setPasswordExpiry(e.target.value)}
                  placeholder="90"
                  min="0"
                  max="365"
                />
                <p className="text-sm text-gray-500">
                  Masa berlaku password sebelum harus diganti (0 = tidak ada
                  expired)
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSaveSecurity}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Settings */}
        <TabsContent value="platform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-600" />
                Pengaturan Platform
              </CardTitle>
              <CardDescription>
                Konfigurasi fitur dan akses platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenance" className="text-orange-600">
                    Mode Maintenance
                  </Label>
                  <p className="text-sm text-gray-500">
                    Platform tidak dapat diakses saat mode maintenance aktif
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              {maintenanceMode && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800">
                    ⚠️ Mode maintenance aktif. Hanya admin yang dapat mengakses
                    platform.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="registration">Izinkan Registrasi</Label>
                  <p className="text-sm text-gray-500">
                    Pengguna baru dapat mendaftar akun
                  </p>
                </div>
                <Switch
                  id="registration"
                  checked={allowRegistration}
                  onCheckedChange={setAllowRegistration}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailVerif">Verifikasi Email</Label>
                  <p className="text-sm text-gray-500">
                    Wajibkan verifikasi email saat registrasi
                  </p>
                </div>
                <Switch
                  id="emailVerif"
                  checked={requireEmailVerification}
                  onCheckedChange={setRequireEmailVerification}
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <Button
                  onClick={handleSavePlatform}
                  disabled={isSaving}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="text-blue-600">ℹ️</div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">
                Catatan Penting
              </p>
              <p className="text-sm text-blue-700">
                Perubahan pengaturan akan diterapkan segera setelah disimpan.
                Pastikan untuk menguji perubahan pada environment staging
                terlebih dahulu sebelum diterapkan di production.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
