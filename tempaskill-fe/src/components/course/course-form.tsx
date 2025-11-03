"use client";

import { FormField, SelectField, TextareaField } from "@/components/common";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courseSchema } from "@/lib/validators";
import { Course } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import * as z from "zod";

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  course?: Course;
  onSubmit: (data: CourseFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "DevOps",
];

const DIFFICULTIES = [
  { value: "beginner", label: "Pemula" },
  { value: "intermediate", label: "Menengah" },
  { value: "advanced", label: "Lanjutan" },
];

/**
 * CourseForm - Reusable form component for creating and editing courses
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Auto-generate slug from title
 * - Indonesian error messages
 * - Loading and error states
 * - Accessible form fields with ARIA labels
 *
 * @param course - Existing course data (for edit mode)
 * @param onSubmit - Form submission handler
 * @param isLoading - Loading state from mutation
 * @param error - Error message from mutation
 */
export function CourseForm({
  course,
  onSubmit,
  isLoading = false,
  error = null,
}: CourseFormProps) {
  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: course
      ? {
          title: course.title,
          slug: course.slug,
          description: course.description,
          category: course.category as CourseFormData["category"],
          difficulty: course.difficulty,
          price: course.price,
          thumbnail_url: course.thumbnail_url || "",
          instructor_id: course.instructor_id,
        }
      : {
          title: "",
          slug: "",
          description: "",
          category: "Web Development",
          difficulty: "beginner",
          price: 0,
          thumbnail_url: "",
          instructor_id: 1,
        },
  });

  const title = methods.watch("title");

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !course) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      methods.setValue("slug", generatedSlug);
    }
  }, [title, course, methods]);

  const handleFormSubmit = async (data: CourseFormData) => {
    await onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              name="title"
              label="Judul Kursus"
              type="text"
              placeholder="Contoh: Pemrograman Web Modern dengan React & Next.js"
            />

            <FormField
              name="slug"
              label="Slug (URL)"
              type="text"
              placeholder="pemrograman-web-modern-react-nextjs"
              description={
                !course
                  ? "Otomatis dari judul. URL kursus: /courses/" +
                    methods.watch("slug")
                  : "URL kursus: /courses/" + methods.watch("slug")
              }
            />

            <TextareaField
              name="description"
              label="Deskripsi"
              placeholder="Jelaskan apa yang akan dipelajari siswa dalam kursus ini..."
              rows={5}
            />

            <SelectField
              name="category"
              label="Kategori"
              placeholder="Pilih kategori"
              options={CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
            />

            <SelectField
              name="difficulty"
              label="Tingkat Kesulitan"
              placeholder="Pilih tingkat kesulitan"
              options={DIFFICULTIES}
            />

            <FormField
              name="price"
              label="Harga (Rp)"
              type="number"
              placeholder="0"
              description="Masukkan 0 untuk kursus gratis"
            />

            <FormField
              name="thumbnail_url"
              label="URL Gambar Thumbnail"
              type="url"
              placeholder="https://example.com/image.jpg"
              description="Upload gambar akan tersedia setelah Task 4 selesai"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : course ? (
              "Perbarui Kursus"
            ) : (
              "Buat Kursus"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
