"use client";

import { FormField, TextareaField } from "@/components/common";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLessonSchema } from "@/lib/validators";
import { Lesson } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

type LessonFormData = z.infer<typeof createLessonSchema>;

interface LessonFormProps {
  lesson?: Lesson;
  onSubmit: (data: LessonFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  maxOrderIndex?: number;
}

/**
 * LessonForm - Reusable form component for creating and editing lessons
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Auto-generate slug from title
 * - Indonesian error messages
 * - Loading and error states
 * - Accessible form fields with ARIA labels
 * - MDX content textarea (basic, will be enhanced with editor in Task 11)
 *
 * @param lesson - Existing lesson data (for edit mode)
 * @param onSubmit - Form submission handler
 * @param isLoading - Loading state from mutation
 * @param error - Error message from mutation
 * @param maxOrderIndex - Maximum order index (for new lessons)
 */
export function LessonForm({
  lesson,
  onSubmit,
  isLoading = false,
  error = null,
  maxOrderIndex = 0,
}: LessonFormProps) {
  const methods = useForm<LessonFormData>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: lesson
      ? {
          title: lesson.title,
          slug: lesson.slug,
          content: lesson.content,
          orderIndex: lesson.order_index,
          duration: lesson.duration,
        }
      : {
          title: "",
          slug: "",
          content: "",
          orderIndex: maxOrderIndex + 1,
          duration: 30, // Default 30 minutes
        },
  });

  const title = methods.watch("title");

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !lesson) {
      // Only auto-generate for new lessons
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      methods.setValue("slug", generatedSlug);
    }
  }, [title, lesson, methods]);

  const handleFormSubmit = async (data: LessonFormData) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="title"
              label="Judul Pelajaran"
              placeholder="Contoh: Introduction to Variables"
              description="Judul pelajaran yang akan ditampilkan kepada siswa"
            />

            <FormField
              name="slug"
              label="Slug"
              placeholder="introduction-to-variables"
              description="URL-friendly identifier (otomatis dibuat dari judul)"
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="orderIndex"
                label="Urutan"
                type="number"
                placeholder="1"
                description="Urutan pelajaran dalam kursus"
              />

              <FormField
                name="duration"
                label="Durasi (menit)"
                type="number"
                placeholder="30"
                description="Estimasi waktu pengerjaan"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Konten Pelajaran</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TextareaField
              name="content"
              label="Konten (MDX)"
              rows={15}
              placeholder="# Judul Pelajaran

Tulis konten pelajaran menggunakan Markdown/MDX...

## Contoh Kode

```javascript
const greeting = 'Hello World';
console.log(greeting);
```

## Penjelasan

Konten ini akan ditampilkan dengan format MDX."
              description="Konten pelajaran dalam format MDX. Editor yang lebih baik akan tersedia nanti."
            />

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>💡 Tips:</strong> Gunakan Markdown untuk format teks (#
                heading, **bold**, *italic*, `code`, dll). Editor MDX yang lebih
                lengkap akan tersedia di Task 11.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="submit"
            disabled={isLoading || methods.formState.isSubmitting}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading || methods.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : lesson ? (
              "Perbarui Pelajaran"
            ) : (
              "Buat Pelajaran"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
