import * as z from "zod";
import { NAME_MIN_LENGTH, PASSWORD_MIN_LENGTH } from "./constants";

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
  password: z
    .string()
    .min(
      PASSWORD_MIN_LENGTH,
      `Password minimal ${PASSWORD_MIN_LENGTH} karakter`
    ),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(NAME_MIN_LENGTH, `Nama minimal ${NAME_MIN_LENGTH} karakter`)
      .max(100, "Nama maksimal 100 karakter"),
    email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password minimal ${PASSWORD_MIN_LENGTH} karakter`
      )
      .max(50, "Password maksimal 50 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

// Profile schemas
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(NAME_MIN_LENGTH, `Nama minimal ${NAME_MIN_LENGTH} karakter`)
    .max(100, "Nama maksimal 100 karakter"),
  email: z.string().min(1, "Email harus diisi").email("Email tidak valid"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini harus diisi"),
    newPassword: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Password baru minimal ${PASSWORD_MIN_LENGTH} karakter`
      )
      .max(50, "Password baru maksimal 50 karakter"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password baru tidak cocok",
    path: ["confirmPassword"],
  });

// Course management schemas
export const courseSchema = z.object({
  title: z
    .string()
    .min(5, "Judul kursus minimal 5 karakter")
    .max(200, "Judul kursus maksimal 200 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .max(255, "Slug maksimal 255 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda (-)")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .min(20, "Deskripsi minimal 20 karakter")
    .max(1000, "Deskripsi maksimal 1000 karakter"),
  category: z.enum(
    ["Web Development", "Mobile Development", "Data Science", "DevOps"],
    { message: "Kategori tidak valid" }
  ),
  difficulty: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Tingkat kesulitan tidak valid",
  }),
  price: z
    .number({ message: "Harga harus berupa angka" })
    .min(0, "Harga tidak boleh negatif")
    .max(10000000, "Harga maksimal Rp 10.000.000"),
  thumbnail_url: z
    .string()
    .url("URL thumbnail tidak valid")
    .optional()
    .or(z.literal("")),
  instructor_id: z
    .number({ message: "Instruktur harus dipilih" })
    .min(1, "Instruktur harus dipilih"),
});

// Course schemas (for future admin panel)
export const createCourseSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(255, "Judul maksimal 255 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .max(255, "Slug maksimal 255 karakter")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung"
    ),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  category: z.string().min(1, "Kategori harus dipilih"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"], {
    message: "Tingkat kesulitan tidak valid",
  }),
  price: z
    .number()
    .min(0, "Harga tidak boleh negatif")
    .max(10000000, "Harga maksimal Rp 10.000.000"),
  thumbnailUrl: z
    .string()
    .url("URL thumbnail tidak valid")
    .optional()
    .or(z.literal("")),
});

export const updateCourseSchema = createCourseSchema.partial();

// Lesson schemas (for future admin panel)
export const createLessonSchema = z.object({
  title: z
    .string()
    .min(5, "Judul minimal 5 karakter")
    .max(255, "Judul maksimal 255 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .max(255, "Slug maksimal 255 karakter")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug hanya boleh mengandung huruf kecil, angka, dan tanda hubung"
    ),
  content: z.string().min(50, "Konten minimal 50 karakter"),
  orderIndex: z
    .number()
    .int("Order harus berupa bilangan bulat")
    .min(1, "Order minimal 1"),
  duration: z
    .number()
    .int("Durasi harus berupa bilangan bulat")
    .min(1, "Durasi minimal 1 menit")
    .optional(),
});

export const updateLessonSchema = createLessonSchema.partial();

// Search and filter schemas
export const courseFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  isFree: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type CourseFilterInput = z.infer<typeof courseFilterSchema>;
