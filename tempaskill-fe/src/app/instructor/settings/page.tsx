"use client";

import { PageHeader } from "@/components/common";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function InstructorSettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola pengaturan akun instruktur Anda"
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profil Instruktur</CardTitle>
            <CardDescription>
              Informasi profil Anda sebagai instruktur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Fitur pengaturan profil akan segera hadir.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferensi Notifikasi</CardTitle>
            <CardDescription>
              Atur notifikasi yang ingin Anda terima
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Fitur pengaturan notifikasi akan segera hadir.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pembayaran</CardTitle>
            <CardDescription>
              Informasi rekening bank untuk pembayaran
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Fitur pengaturan pembayaran akan segera hadir.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
