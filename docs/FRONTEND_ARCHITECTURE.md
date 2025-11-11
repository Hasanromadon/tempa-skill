# 🧩 Frontend Architecture & Reusable Components Guide

> Panduan untuk mengorganisir dan membuat reusable components di TempaSKill Frontend
>
> **Last Updated**: November 3, 2025

---

## 📁 Recommended Folder Structure

```
tempaskill-fe/src/
├── app/                        # Next.js 15 App Router
│   ├── (auth)/                # Auth route group (login, register)
│   ├── admin/                 # Admin panel pages
│   ├── courses/               # Course catalog and detail pages
│   ├── dashboard/             # User dashboard
│   ├── payments/              # Payment pages
│   ├── profile/               # User profile pages
│   ├── sessions/              # Live session pages
│   ├── test-mdx/              # MDX testing page
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Homepage
│
├── components/
│   ├── ui/                    # Shadcn atomic components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── common/                # Reusable business components
│   │   ├── page-header.tsx    # Page header with breadcrumb
│   │   ├── loading-screen.tsx # Full screen loader
│   │   ├── empty-state.tsx    # Empty state component
│   │   ├── progress-ring.tsx  # Progress ring component
│   │   ├── form-field.tsx     # Form field wrapper
│   │   ├── form-wrapper.tsx   # Form wrapper component
│   │   ├── submit-button.tsx  # Submit button component
│   │   └── image-upload.tsx   # Image upload component
│   │
│   ├── course/                # Course-specific components
│   │   ├── course-card.tsx    # Course card display
│   │   ├── course-form.tsx    # Course creation/editing form
│   │   ├── filter-sidebar.tsx # Course filtering sidebar
│   │   ├── search-bar.tsx     # Course search bar
│   │   ├── sort-dropdown.tsx  # Course sorting dropdown
│   │   └── delete-course-dialog.tsx # Course deletion confirmation
│   │
│   ├── payment/               # Payment components
│   │   └── payment-modal.tsx  # Payment transaction modal
│   │
│   ├── review/                # Review components
│   │   ├── review-card.tsx    # Individual review display
│   │   ├── review-form.tsx    # Review submission form
│   │   ├── review-list.tsx    # Review list component
│   │   └── star-rating.tsx    # Star rating component
│   │
│   ├── admin/                 # Admin components
│   │   └── mdx-editor.tsx     # MDX content editor
│   │
│   ├── mdx/                   # MDX rendering components
│   │   ├── mdx-content.tsx
│   │   ├── code-playground.tsx (future)
│   │   ├── quiz.tsx (future)
│   │   └── index.ts
│   │
│   ├── layout/                # Layout components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   ├── footer.tsx
│   │   └── page-container.tsx
│   │
│   └── providers.tsx          # React Query + Auth providers
│
├── hooks/                     # Custom React hooks
│   ├── use-auth.ts
│   ├── use-courses.ts
│   ├── use-debug.ts           # Debugging utilities
│   ├── use-lessons.ts
│   ├── use-progress.ts
│   ├── use-user.ts
│   ├── use-certificate.ts     # Certificate management
│   ├── use-payment.ts         # Payment transactions
│   ├── use-reviews.ts         # Course reviews
│   ├── use-sessions.ts        # Live sessions
│   └── index.ts
│
├── lib/                       # Utilities & helpers
│   ├── api-client.ts         # Axios instance
│   ├── auth-token.ts         # Token management
│   ├── utils.ts              # Generic helpers (cn, formatters)
│   ├── validators.ts         # NEW: Zod schemas
│   └── constants.ts          # NEW: App constants
│
├── types/                     # TypeScript definitions
│   ├── api.ts                # API response types
│   ├── common.ts             # NEW: Common types
│   └── index.ts              # NEW: Barrel export
│
└── styles/                    # NEW: Shared styles (if needed)
    └── animations.ts
```

---

## 🎯 Principles for Reusable Components

### 1. Single Responsibility

Each component should have **one clear purpose**.

```tsx
// ❌ BAD: Multiple responsibilities
function UserCard({ user, onEdit, onDelete, showStats, stats }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={onEdit}>Edit</button>
      <button onClick={onDelete}>Delete</button>
      {showStats && <div>{stats.courses} courses</div>}
    </div>
  );
}

// ✅ GOOD: Separate concerns
function UserCard({ user, children }: UserCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function UserActions({ onEdit, onDelete }: UserActionsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onEdit}>Edit</Button>
      <Button onClick={onDelete} variant="destructive">
        Delete
      </Button>
    </div>
  );
}
```

### 2. Composition Over Configuration

Prefer composition pattern dengan `children` instead of banyak props.

```tsx
// ❌ BAD: Too many configuration props
<Modal
  title="Confirm Delete"
  content="Are you sure?"
  confirmText="Delete"
  cancelText="Cancel"
  confirmVariant="destructive"
  onConfirm={handleDelete}
  onCancel={handleCancel}
/>

// ✅ GOOD: Composition
<Modal>
  <ModalHeader>
    <ModalTitle>Confirm Delete</ModalTitle>
  </ModalHeader>
  <ModalContent>
    <p>Are you sure you want to delete this course?</p>
  </ModalContent>
  <ModalFooter>
    <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
    <Button variant="destructive" onClick={handleDelete}>Delete</Button>
  </ModalFooter>
</Modal>
```

### 3. TypeScript First

Always define proper types and interfaces.

```tsx
// ✅ GOOD: Typed props
interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumbs?: Breadcrumb[];
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="border-b bg-white">
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && <p className="text-gray-600 mt-1">{description}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}
```

### 4. Colocate Styles

Use Tailwind classes directly, avoid separate CSS files.

```tsx
// ✅ GOOD: Tailwind utilities
<div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
  {content}
</div>

// Use cn() for conditional classes
<div className={cn(
  "rounded-lg p-4",
  isActive && "bg-orange-50 border-orange-500",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
```

---

## 🧱 Common Reusable Components

### 1. PageHeader Component

**File**: `src/components/common/page-header.tsx`

```tsx
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  action,
}: PageHeaderProps) {
  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {backHref && (
              <Button variant="ghost" size="icon" asChild>
                <Link href={backHref}>
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
          {action}
        </div>
      </div>
    </div>
  );
}

// Usage
<PageHeader
  title="Dashboard"
  description="Selamat datang kembali!"
  action={
    <Button variant="outline" onClick={logout}>
      <LogOut className="mr-2 h-4 w-4" />
      Keluar
    </Button>
  }
/>;
```

### 2. EmptyState Component

**File**: `src/components/common/empty-state.tsx`

```tsx
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 max-w-md mb-6">{description}</p>
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Usage
<EmptyState
  icon={BookOpen}
  title="Belum Ada Kursus"
  description="Anda belum terdaftar di kursus apapun. Jelajahi kursus yang tersedia dan mulai belajar!"
  action={{
    label: "Jelajahi Kursus",
    onClick: () => router.push("/courses"),
  }}
/>;
```

### 3. LoadingScreen Component

**File**: `src/components/common/loading-screen.tsx`

```tsx
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Memuat..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Usage
if (isLoading) {
  return <LoadingScreen message="Memuat kursus..." />;
}
```

### 4. ProgressRing Component

**File**: `src/components/course/progress-ring.tsx`

```tsx
interface ProgressRingProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
}

export function ProgressRing({ progress, size = "md" }: ProgressRingProps) {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-lg",
  };

  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r="18"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50%"
          cy="50%"
          r="18"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-orange-600 transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-semibold ${textSizes[size]}`}>
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
}

// Usage
<ProgressRing progress={courseProgress.progress_percentage} size="lg" />;
```

### 5. CourseCard Component

**File**: `src/components/course/course-card.tsx`

```tsx
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users } from "lucide-react";
import Link from "next/link";
import type { Course } from "@/types/api";
import { ProgressRing } from "./progress-ring";

interface CourseCardProps {
  course: Course;
  enrolled?: boolean;
  progress?: number;
}

export function CourseCard({ course, enrolled, progress }: CourseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="aspect-video bg-linear-to-br from-orange-100 to-orange-200 rounded-lg mb-4" />
        <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
      </CardHeader>

      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {course.lesson_count} pelajaran
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {course.enrolled_count}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Badge variant="secondary">{course.category}</Badge>
          <Badge variant="outline">{course.difficulty}</Badge>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        {enrolled && progress !== undefined ? (
          <>
            <ProgressRing progress={progress} size="sm" />
            <Button asChild>
              <Link href={`/courses/${course.slug}`}>Lanjutkan</Link>
            </Button>
          </>
        ) : (
          <>
            <span className="font-semibold text-orange-600">
              {course.price === 0
                ? "Gratis"
                : `Rp ${course.price.toLocaleString()}`}
            </span>
            <Button asChild className="bg-orange-600 hover:bg-orange-700">
              <Link href={`/courses/${course.slug}`}>Lihat Detail</Link>
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
```

---

## 🔧 Utility Functions

### File: `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
}

// Format date (Indonesian)
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Format currency (IDR)
export function formatCurrency(amount: number): string {
  if (amount === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Slugify text
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

// Calculate reading time
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Generate unique request ID for API tracing
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

### File: `src/lib/constants.ts`

```typescript
export const APP_NAME = "TempaSKill";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  COURSES: "/courses",
  COURSE_DETAIL: (slug: string) => `/courses/${slug}`,
  LESSON_DETAIL: (courseSlug: string, lessonId: string) =>
    `/courses/${courseSlug}/lessons/${lessonId}`,
  PROFILE: "/profile",
  PAYMENTS: "/payments",
  SESSIONS: "/sessions",
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    COURSES: "/admin/courses",
    PAYMENTS: "/admin/payments",
    SESSIONS: "/admin/sessions",
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  COURSES: {
    LIST: "/courses",
    DETAIL: (slug: string) => `/courses/slug/${slug}`,
    BY_ID: (id: number) => `/courses/${id}`,
    CREATE: "/courses",
    UPDATE: (id: number) => `/courses/${id}`,
    DELETE: (id: number) => `/courses/${id}`,
    ENROLL: (id: number) => `/courses/${id}/enroll`,
    LESSONS: (id: number) => `/courses/${id}/lessons`,
  },
  LESSONS: {
    DETAIL: (id: number) => `/lessons/${id}`,
    CREATE: (courseId: number) => `/courses/${courseId}/lessons`,
    UPDATE: (id: number) => `/lessons/${id}`,
    DELETE: (id: number) => `/lessons/${id}`,
    REORDER: "/lessons/reorder",
  },
  PROGRESS: {
    COURSE: (courseId: number) => `/progress/courses/${courseId}`,
    USER: "/progress/me",
    COMPLETE_LESSON: (lessonId: number) =>
      `/progress/lessons/${lessonId}/complete`,
  },
  USERS: {
    DETAIL: (id: number) => `/users/${id}`,
    UPDATE_PROFILE: "/users/me",
    CHANGE_PASSWORD: "/users/me/password",
  },
  UPLOAD: {
    IMAGE: "/upload/image",
  },
  PAYMENT: {
    CREATE_TRANSACTION: "/payment/create-transaction",
    CHECK_STATUS: (orderId: string) => `/payment/status/${orderId}`,
    WEBHOOK: "/payment/webhook",
  },
  REVIEWS: {
    LIST: "/reviews",
    DETAIL: (id: number) => `/reviews/${id}`,
    CREATE: "/reviews",
    UPDATE: (id: number) => `/reviews/${id}`,
    DELETE: (id: number) => `/reviews/${id}`,
    BY_USER: "/reviews/user",
    BY_COURSE: (courseId: number) => `/reviews/courses/${courseId}`,
    COURSE_SUMMARY: (courseId: number) =>
      `/reviews/courses/${courseId}/summary`,
  },
  SESSIONS: {
    LIST: "/sessions",
    DETAIL: (id: number) => `/sessions/${id}`,
    CREATE: "/sessions",
    UPDATE: (id: number) => `/sessions/${id}`,
    DELETE: (id: number) => `/sessions/${id}`,
    REGISTER: (id: number) => `/sessions/${id}/register`,
    UNREGISTER: (id: number) => `/sessions/${id}/register`,
    PARTICIPANTS: (id: number) => `/sessions/${id}/participants`,
    MARK_ATTENDANCE: (sessionId: number, participantId: number) =>
      `/sessions/${sessionId}/attendance/${participantId}`,
  },
} as const;

export const DIFFICULTY_LABELS = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
} as const;

export const CATEGORY_COLORS = {
  "Web Development": "bg-blue-100 text-blue-800",
  "Mobile Development": "bg-green-100 text-green-800",
  "Data Science": "bg-purple-100 text-purple-800",
  Design: "bg-orange-100 text-orange-800",
} as const;
```

### File: `src/lib/api-client.ts`

```typescript
import axios, { AxiosError } from "axios";
import type { ApiResponse } from "@/types/api";
import { getAuthToken, removeAuthToken } from "@/lib/auth-token";
import { generateRequestId } from "@/lib/utils";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token and request ID
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add unique request ID for tracing
    const requestId = generateRequestId();
    config.headers["X-Request-ID"] = requestId;

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API Request] ${config.method?.toUpperCase()} ${
          config.url
        } - RequestID: ${requestId}`
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === "development") {
      const requestId = response.config.headers["X-Request-ID"];
      console.log(
        `[API Response] ${
          response.status
        } ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - RequestID: ${requestId}`
      );
    }
    return response;
  },
  (error: AxiosError<ApiResponse<never>>) => {
    // Log error response in development
    if (process.env.NODE_ENV === "development") {
      const requestId = error.config?.headers?.["X-Request-ID"];
      console.error(
        `[API Error] ${
          error.response?.status || "NETWORK"
        } ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        } - RequestID: ${requestId}`,
        error.message
      );
    }

    // Handle unauthorized
    if (error.response?.status === 401) {
      removeAuthToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    }

    return Promise.reject(error);
  }
);
```

**Features:**

- **Request ID Tracing**: Each API request gets a unique ID (`X-Request-ID` header) for debugging and tracing
- **Development Logging**: Logs all requests/responses with request IDs in development mode
- **Authentication**: Automatically adds JWT token to requests
- **Error Handling**: Global error handling for 401 (unauthorized) and 429 (rate limit) responses
- **Type Safety**: Full TypeScript support with proper error types

### File: `src/lib/validators.ts`

```typescript
import { z } from "zod";

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z
  .object({
    name: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Password tidak cocok",
    path: ["password_confirmation"],
  });

// Course schemas
export const createCourseSchema = z.object({
  title: z.string().min(5, "Judul minimal 5 karakter"),
  slug: z.string().min(3),
  description: z.string().min(20, "Deskripsi minimal 20 karakter"),
  category: z.string().min(1, "Kategori harus dipilih"),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  price: z.number().min(0, "Harga tidak boleh negatif"),
});

// Profile schemas
export const updateProfileSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter").optional(),
  bio: z.string().max(500, "Bio maksimal 500 karakter").optional(),
});

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Password lama harus diisi"),
    new_password: z.string().min(6, "Password baru minimal 6 karakter"),
    new_password_confirmation: z.string(),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    message: "Password baru tidak cocok",
    path: ["new_password_confirmation"],
  });
```

---

## 📦 Type Definitions

### File: `src/types/common.ts`

```typescript
// Common types used across the app
export type Status = "idle" | "loading" | "success" | "error";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type UserRole = "student" | "instructor" | "admin";

export interface Breadcrumb {
  label: string;
  href?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

// Form state
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
}
```

### File: `src/types/index.ts`

```typescript
// Barrel export for all types
export * from "./api";
export * from "./common";
```

---

## 📝 Development Guidelines

### 1. Component Creation Checklist

✅ Before creating a new component:

1. **Check if it already exists** in `components/ui/` or `components/common/`
2. **Determine the right location**:
   - Generic UI → `components/ui/`
   - Reusable business logic → `components/common/`
   - Domain-specific → `components/[domain]/`
3. **Define TypeScript types** first
4. **Consider composition** - can it use existing components?
5. **Make it configurable** but not over-configured
6. **Add JSDoc comments** for complex props

### 2. When to Create a Reusable Component

✅ **DO** create a reusable component when:

- Pattern is used in 3+ places
- Component has clear, single responsibility
- Logic can be abstracted without losing clarity
- Saves significant duplication

❌ **DON'T** create a reusable component when:

- Only used in one place
- Too specific to one feature
- Makes code harder to understand
- Premature optimization

### 3. Naming Conventions

```
Components:    PascalCase       (CourseCard, PageHeader)
Files:         kebab-case       (course-card.tsx, page-header.tsx)
Hooks:         use-*            (useCourses, useAuth)
Types:         PascalCase       (Course, CourseListResponse)
Utilities:     camelCase        (formatDate, slugify)
Constants:     SCREAMING_SNAKE  (API_BASE_URL, MAX_FILE_SIZE)
```

### 4. Import Organization

```tsx
// 1. External dependencies
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. UI components (Shadcn)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 3. Internal components
import { PageHeader } from "@/components/common/page-header";
import { CourseCard } from "@/components/course/course-card";

// 4. Hooks
import { useCourses, useAuth } from "@/hooks";

// 5. Utils and types
import { formatDate, cn } from "@/lib/utils";
import type { Course } from "@/types";

// 6. Icons (last)
import { BookOpen, Users } from "lucide-react";
```

### 5. Props Interface Patterns

```tsx
// ✅ GOOD: Extend HTML attributes
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  isLoading?: boolean;
}

// ✅ GOOD: Composition with children
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// ✅ GOOD: Optional callback props
interface FormProps {
  onSubmit?: (data: FormData) => void;
  onError?: (error: Error) => void;
}

// ❌ BAD: Too many optional props
interface BadComponentProps {
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  showFooter?: boolean;
  // ... too configurable!
}
```

---

## 🎨 Brand Consistency

### Orange Color System

```tsx
// Primary orange (from brand guidelines)
const ORANGE_COLORS = {
  50: "bg-orange-50",    // Very light (backgrounds)
  100: "bg-orange-100",  // Light (hover states)
  600: "bg-orange-600",  // PRIMARY (buttons, links)
  700: "bg-orange-700",  // Dark (hover on primary)
  800: "bg-orange-800",  // Very dark (text)
};

// Usage examples
<Button className="bg-orange-600 hover:bg-orange-700">
  Primary Action
</Button>

<Link className="text-orange-600 hover:text-orange-700">
  Link Text
</Link>

<Badge className="bg-orange-100 text-orange-800">
  Category
</Badge>
```

---

## 🔄 Migration Plan

### Phase 1: Extract Common Components (Week 1)

- [x] Create `components/common/` folder
- [ ] Extract `PageHeader`
- [ ] Extract `LoadingScreen`
- [ ] Extract `EmptyState`
- [ ] Update all pages to use new components

### Phase 2: Extract Domain Components (Week 2)

- [ ] Create `components/course/` folder
- [ ] Extract `CourseCard`
- [ ] Extract `ProgressRing`
- [ ] Extract `LessonList`
- [ ] Update course pages

### ✅ COMPLETED FEATURES

- [x] **Authentication System** - Login, register, JWT handling
- [x] **Course Management** - Catalog, detail pages, enrollment
- [x] **Lesson System** - MDX content rendering, progress tracking
- [x] **Payment Integration** - Midtrans payment gateway
- [x] **Review System** - Course reviews and ratings
- [x] **Live Sessions** - Session scheduling and management
- [x] **Admin Panel** - Course, payment, session management
- [x] **Responsive Design** - Mobile-first approach
- [x] **TypeScript Integration** - Full type safety
- [x] **API Integration** - Complete REST API client
- [x] **Component Library** - Shadcn/ui components
- [x] **State Management** - React Query + Zustand
- [x] **Form Handling** - React Hook Form + Zod validation
- [x] **File Upload** - Image upload functionality
- [x] **Progress Tracking** - Lesson completion and course progress

### Phase 3: Utilities & Types (Week 3)

- [x] Create `lib/constants.ts` - Complete with all routes and API endpoints
- [x] Create `lib/validators.ts` - Zod schemas for form validation
- [x] Create `types/common.ts` - Shared TypeScript types
- [x] Update imports across codebase - All imports organized and optimized

---

## 📚 Resources

- [React Component Patterns](https://www.patterns.dev/react/)
- [Shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)

---

**Last Updated**: November 3, 2025  
**Maintainer**: Development Team
