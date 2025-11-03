"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { courseSchema } from "@/lib/validators";
import { Course } from "@/types/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
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
          instructor_id: 1, // Default to current user (will be set by backend)
        },
  });

  const title = watch("title");

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !course) {
      // Only auto-generate for new courses
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Remove consecutive hyphens
        .trim();
      setValue("slug", generatedSlug);
    }
  }, [title, course, setValue]);

  const handleFormSubmit = async (data: CourseFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul Kursus <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Contoh: Pemrograman Web Modern dengan React & Next.js"
              className={errors.title ? "border-red-500" : ""}
              aria-invalid={errors.title ? "true" : "false"}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="text-sm text-red-500" role="alert">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug (URL)
              {!course && (
                <span className="text-sm text-gray-500 ml-2">
                  (otomatis dari judul)
                </span>
              )}
            </Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="pemrograman-web-modern-react-nextjs"
              className={errors.slug ? "border-red-500" : ""}
              aria-invalid={errors.slug ? "true" : "false"}
              aria-describedby={errors.slug ? "slug-error" : undefined}
            />
            {errors.slug && (
              <p id="slug-error" className="text-sm text-red-500" role="alert">
                {errors.slug.message}
              </p>
            )}
            <p className="text-sm text-gray-500">
              URL kursus akan menjadi: /courses/<strong>{watch("slug")}</strong>
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Deskripsi <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Jelaskan apa yang akan dipelajari siswa dalam kursus ini..."
              rows={5}
              className={errors.description ? "border-red-500" : ""}
              aria-invalid={errors.description ? "true" : "false"}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
            />
            {errors.description && (
              <p
                id="description-error"
                className="text-sm text-red-500"
                role="alert"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Kategori <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("category")}
              onValueChange={(value) =>
                setValue("category", value as CourseFormData["category"])
              }
            >
              <SelectTrigger
                id="category"
                className={errors.category ? "border-red-500" : ""}
                aria-invalid={errors.category ? "true" : "false"}
                aria-describedby={
                  errors.category ? "category-error" : undefined
                }
              >
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p
                id="category-error"
                className="text-sm text-red-500"
                role="alert"
              >
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">
              Tingkat Kesulitan <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch("difficulty")}
              onValueChange={(value) =>
                setValue("difficulty", value as CourseFormData["difficulty"])
              }
            >
              <SelectTrigger
                id="difficulty"
                className={errors.difficulty ? "border-red-500" : ""}
                aria-invalid={errors.difficulty ? "true" : "false"}
                aria-describedby={
                  errors.difficulty ? "difficulty-error" : undefined
                }
              >
                <SelectValue placeholder="Pilih tingkat kesulitan" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((diff) => (
                  <SelectItem key={diff.value} value={diff.value}>
                    {diff.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.difficulty && (
              <p
                id="difficulty-error"
                className="text-sm text-red-500"
                role="alert"
              >
                {errors.difficulty.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Harga (Rp) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              {...register("price", { valueAsNumber: true })}
              placeholder="0"
              min="0"
              step="1000"
              className={errors.price ? "border-red-500" : ""}
              aria-invalid={errors.price ? "true" : "false"}
              aria-describedby={errors.price ? "price-error" : undefined}
            />
            {errors.price && (
              <p id="price-error" className="text-sm text-red-500" role="alert">
                {errors.price.message}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Masukkan 0 untuk kursus gratis
            </p>
          </div>

          {/* Thumbnail URL (temporary - will be replaced with upload) */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail_url">URL Gambar Thumbnail</Label>
            <Input
              id="thumbnail_url"
              {...register("thumbnail_url")}
              placeholder="https://example.com/image.jpg"
              type="url"
              className={errors.thumbnail_url ? "border-red-500" : ""}
              aria-invalid={errors.thumbnail_url ? "true" : "false"}
              aria-describedby={
                errors.thumbnail_url ? "thumbnail-error" : undefined
              }
            />
            {errors.thumbnail_url && (
              <p
                id="thumbnail-error"
                className="text-sm text-red-500"
                role="alert"
              >
                {errors.thumbnail_url.message}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Upload gambar akan tersedia setelah Task 4 selesai
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
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
  );
}
