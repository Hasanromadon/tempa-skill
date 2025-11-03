# 🤖 GitHub Copilot Instructions - TempaSKill Platform

**Last Updated**: November 3, 2025  
**Project**: TempaSKill - Hybrid Course Learning Platform  
**Tech Stack**: Go (Gin) + Next.js 15 + MySQL + Playwright

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Core Principles](#core-principles)
- [Backend Development (Go)](#backend-development-go)
- [Frontend Development (Next.js)](#frontend-development-nextjs)
- [Testing Standards](#testing-standards)
- [Database Guidelines](#database-guidelines)
- [Security Requirements](#security-requirements)
- [Code Quality Standards](#code-quality-standards)
- [Common Patterns](#common-patterns)
- [Quick Reference](#quick-reference)
- [Need Help?](#need-help)

---

## 🎯 Project Overview

**TempaSKill** is a hybrid online learning platform with:

- **Text-based course content** (not video) for bandwidth efficiency
- **Bi-weekly live sessions** for Q&A and interactive coding
- **Progress tracking** with completion percentages
- **Indonesian language** throughout the UI
- **Orange brand color** (#ea580c) as primary

### Business Rules

1. **Course Content**: Text/MDX articles, no video hosting
2. **Enrollment**: Free and paid courses supported
3. **Progress**: Track completion per lesson and overall course
4. **Access Control**: Guest users can browse, enrolled users can learn
5. **Language**: All UI text must be in Bahasa Indonesia

---

## 🎨 Core Principles

### 1. Code Organization

```
FOLLOW CLEAN ARCHITECTURE:
- Backend: Domain-driven design (models → repos → services → handlers)
- Frontend: Feature-based modules (hooks → components → pages)
```

### 2. Language Standards

```
✅ ALWAYS USE:
- Bahasa Indonesia for ALL user-facing text
- English for code, comments, and technical docs
- Consistent terminology (Kursus, Pelajaran, Masuk, Daftar)

❌ NEVER:
- Mix Indonesian and English in UI
- Use "Login" instead of "Masuk"
- Use "Course" in UI text
```

### 3. Brand Identity

```
✅ PRIMARY COLOR: Orange #ea580c (orange-600)
✅ GRADIENTS: from-orange-50, to-orange-100
✅ BUTTONS: bg-orange-600 hover:bg-orange-700
✅ LINKS: text-orange-600
✅ ICONS: text-orange-600

❌ NEVER USE:
- Blue as primary (only for secondary accents)
- Default Tailwind blue classes
- Purple, teal, or other brand colors
```

---

## 🔧 Backend Development (Go)

### Project Structure

```
tempaskill-be/
├── cmd/api/              # Application entry point
├── internal/
│   ├── auth/            # Authentication module
│   │   ├── model.go     # User model (GORM)
│   │   ├── dto.go       # Request/Response DTOs
│   │   ├── repository.go # Database operations
│   │   ├── service.go   # Business logic
│   │   ├── handler.go   # HTTP handlers
│   │   └── routes.go    # Route registration
│   ├── course/          # Course management module
│   ├── lesson/          # Lesson module
│   ├── enrollment/      # Enrollment tracking
│   ├── progress/        # Progress tracking
│   └── middleware/      # Shared middleware
├── pkg/
│   └── database/        # DB connection
└── migrations/          # SQL migration files
```

### Module Pattern (ALWAYS FOLLOW)

#### 1. Model (`model.go`)

```go
// ✅ GOOD: GORM model with tags, JSON serialization, hooks
type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:100;not null" json:"name"`
    Email     string    `gorm:"size:100;uniqueIndex;not null" json:"email"`
    Password  string    `gorm:"size:100;not null" json:"-"` // NEVER expose password
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

// BeforeCreate hook for password hashing
func (u *User) BeforeCreate(tx *gorm.DB) error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    u.Password = string(hashedPassword)
    return nil
}
```

#### 2. DTO (`dto.go`)

```go
// ✅ GOOD: Separate request and response DTOs
type RegisterRequest struct {
    Name     string `json:"name" binding:"required,min=3"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6"`
}

type UserResponse struct {
    ID    uint   `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

// ✅ GOOD: Validation tags, clear naming
// ❌ BAD: Exposing password in response DTO
```

#### 3. Repository (`repository.go`)

```go
// ✅ GOOD: Interface-based, testable
type UserRepository interface {
    Create(user *User) error
    FindByID(id uint) (*User, error)
    FindByEmail(email string) (*User, error)
    Update(user *User) error
}

type userRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
    return &userRepository{db: db}
}

// ✅ GOOD: Handle not found explicitly
func (r *userRepository) FindByEmail(email string) (*User, error) {
    var user User
    err := r.db.Where("email = ?", email).First(&user).Error
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, nil // Not an error, just not found
        }
        return nil, err
    }
    return &user, nil
}
```

#### 4. Service (`service.go`)

```go
// ✅ GOOD: Business logic layer, uses repository
type UserService interface {
    Register(req RegisterRequest) (*UserResponse, error)
    Login(req LoginRequest) (string, error) // Returns JWT token
}

type userService struct {
    repo UserRepository
}

func NewUserService(repo UserRepository) UserService {
    return &userService{repo: repo}
}

// ✅ GOOD: Validate business rules, return domain errors
func (s *userService) Register(req RegisterRequest) (*UserResponse, error) {
    // Check if user exists
    existingUser, err := s.repo.FindByEmail(req.Email)
    if err != nil {
        return nil, err
    }
    if existingUser != nil {
        return nil, errors.New("email already registered")
    }

    // Create user
    user := &User{
        Name:     req.Name,
        Email:    req.Email,
        Password: req.Password,
    }

    err = s.repo.Create(user)
    if err != nil {
        return nil, err
    }

    return &UserResponse{
        ID:    user.ID,
        Name:  user.Name,
        Email: user.Email,
    }, nil
}
```

#### 5. Handler (`handler.go`)

```go
// ✅ GOOD: Thin layer, delegates to service
type UserHandler struct {
    service UserService
}

func NewUserHandler(service UserService) *UserHandler {
    return &UserHandler{service: service}
}

// ✅ GOOD: Standard response format, error handling
func (h *UserHandler) Register(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": err.Error(),
        })
        return
    }

    user, err := h.service.Register(req)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": err.Error(),
        })
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "User registered successfully",
        "data":    user,
    })
}
```

#### 6. Routes (`routes.go`)

```go
// ✅ GOOD: Separate public and protected routes
func RegisterRoutes(router *gin.Engine, handler *UserHandler, authMiddleware gin.HandlerFunc) {
    // Public routes
    public := router.Group("/api/v1")
    {
        public.POST("/register", handler.Register)
        public.POST("/login", handler.Login)
    }

    // Protected routes
    protected := router.Group("/api/v1")
    protected.Use(authMiddleware)
    {
        protected.GET("/me", handler.GetCurrentUser)
        protected.PUT("/profile", handler.UpdateProfile)
    }
}
```

### API Response Format

```go
// ✅ STANDARD SUCCESS RESPONSE
{
    "message": "Success message in English",
    "data": {...} // or [] for lists
}

// ✅ STANDARD ERROR RESPONSE
{
    "error": "Error description in English"
}

// ✅ PAGINATED RESPONSE
{
    "data": [...],
    "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100,
        "total_pages": 10
    }
}
```

### Security Requirements

```go
// ✅ ALWAYS:
1. Use bcrypt for password hashing (cost 10+)
2. Validate JWT tokens in middleware
3. Use parameterized queries (GORM prevents SQL injection)
4. Validate all input with binding tags
5. Never expose passwords in responses
6. Use HTTPS in production
7. Set secure cookie flags (HttpOnly, Secure, SameSite)

// ❌ NEVER:
1. Store plain text passwords
2. Log sensitive data (passwords, tokens)
3. Trust client input without validation
4. Expose internal errors to client
```

### Performance Rules

```go
// ✅ OPTIMIZE QUERIES:
// Use Preload to avoid N+1
db.Preload("Lessons").Find(&courses)

// Use Select to fetch only needed fields
db.Select("id", "title", "slug").Find(&courses)

// Use joins for aggregates
db.Model(&Course{}).
    Select("courses.*, COUNT(enrollments.id) as enrolled_count").
    Joins("LEFT JOIN enrollments ON enrollments.course_id = courses.id").
    Group("courses.id").
    Find(&courses)

// ❌ AVOID:
// N+1 queries (loading relations in loop)
for _, course := range courses {
    db.Where("course_id = ?", course.ID).Find(&lessons) // BAD!
}
```

---

## ⚛️ Frontend Development (Next.js)

### Project Structure

```
tempaskill-fe/
├── src/
│   ├── app/                 # Next.js 15 App Router
│   │   ├── (auth)/         # Auth route group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── courses/        # Course pages
│   │   │   ├── [slug]/     # Dynamic course detail
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   └── layout.tsx
│   ├── components/          # Reusable components
│   │   ├── ui/             # Shadcn components
│   │   └── course/         # Domain components
│   ├── hooks/              # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-courses.ts
│   │   └── use-lessons.ts
│   ├── lib/                # Utilities
│   │   ├── api-client.ts   # Axios instance
│   │   └── utils.ts
│   └── types/              # TypeScript types
└── public/
```

### Next.js 15 App Router Guidelines

#### 1. Server vs Client Components

```tsx
// ✅ SERVER COMPONENT (default - no 'use client')
// Use for: Static content, data fetching, SEO
export default async function CoursesPage() {
  // Can fetch data directly
  return <div>Courses</div>;
}

// ✅ CLIENT COMPONENT (needs 'use client')
// Use for: Interactivity, hooks, event handlers
("use client");

export default function CourseEnrollButton() {
  const [enrolled, setEnrolled] = useState(false);

  return <button onClick={() => setEnrolled(true)}>Enroll</button>;
}
```

#### 2. Async Params (Next.js 15 BREAKING CHANGE!)

```tsx
// ❌ OLD WAY (Next.js 14) - WILL NOT WORK
export default function CourseDetailPage({ params }: PageProps) {
  const { slug } = params; // ERROR: params is Promise!
}

// ✅ NEW WAY (Next.js 15) - Use React.use()
import { use } from "react";

interface PageProps {
  params: Promise<{ slug: string }>; // params is Promise
}

export default function CourseDetailPage({ params }: PageProps) {
  const { slug } = use(params); // Unwrap Promise with React.use()

  // Now use slug normally
  const { data: course } = useCourse(slug);
}

// ✅ ALTERNATIVE: useParams hook (client components only)
("use client");
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const { slug } = useParams(); // Works in client components
}
```

### React Query (TanStack Query)

```tsx
// ✅ CUSTOM HOOK PATTERN (in hooks/use-courses.ts)
import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const useCourses = (params?: CourseParams) => {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Course[]>>("/courses", {
        params,
      });
      return response.data.data;
    },
  });
};

export const useCourse = (slug: string) => {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Course>>(
        `/courses/slug/${slug}`
      );
      return response.data.data;
    },
    enabled: !!slug, // Only run if slug exists
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      await apiClient.post(`/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
  });
};
```

### Component Patterns

#### 1. Loading States

```tsx
// ✅ GOOD: Use Skeleton components
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  const { data: courses, isLoading } = useCourses();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return <CourseGrid courses={courses} />;
}
```

#### 2. Error Handling

```tsx
// ✅ GOOD: Show user-friendly errors
export default function CoursePage() {
  const { data, error, isLoading } = useCourse(slug);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Kursus tidak ditemukan atau terjadi kesalahan.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data && !isLoading) {
    return <CourseNotFound />;
  }

  return <CourseContent course={data} />;
}
```

#### 3. Form Handling (React Hook Form)

```tsx
// ✅ GOOD: Use React Hook Form with inline validation
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    // Handle login
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <span className="text-red-500 text-sm">{errors.email.message}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-orange-600 hover:bg-orange-700"
      >
        {isSubmitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
```

### UI Component Standards

```tsx
// ✅ USE SHADCN COMPONENTS:
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

// ✅ BRAND COLOR CLASSES:
<Button className="bg-orange-600 hover:bg-orange-700">
  Daftar Sekarang
</Button>

<Badge className="bg-orange-100 text-orange-800">
  Pemula
</Badge>

<div className="bg-gradient-to-r from-orange-50 to-orange-100">
  Hero section
</div>

// ❌ NEVER USE:
<button className="bg-blue-500"> // Wrong color!
<div className="bg-gradient-to-r from-blue-50"> // Wrong gradient!
```

### Indonesian Text Guidelines

```tsx
// ✅ CORRECT INDONESIAN TERMS:
- Masuk (not "Login")
- Daftar / Buat Akun (not "Register" or "Sign Up")
- Kursus (not "Course")
- Pelajaran (not "Lesson")
- Mulai Belajar (not "Start Learning")
- Lanjutkan (not "Continue")
- Kemajuan (not "Progress")
- Terdaftar (not "Enrolled")
- Keluar (not "Logout")

// ✅ EXAMPLE:
<Button>Mulai Belajar</Button>
<Alert>Anda belum terdaftar di kursus ini</Alert>
<h1>Kemajuan Belajar Anda</h1>
```

---

## 🧪 Testing Standards

### E2E Testing (Playwright)

#### Test Structure

```typescript
// ✅ GOOD: Descriptive test names, proper setup
import { test, expect } from "@playwright/test";

test.describe("Course Browsing", () => {
  test("should display course list with search", async ({ page }) => {
    // Arrange
    await page.goto("/courses");
    await page.waitForLoadState("networkidle");

    // Act
    await page.fill('input[placeholder*="Cari"]', "React");
    await page.waitForTimeout(500); // Debounce

    // Assert
    const courses = page.locator('[data-testid="course-card"]');
    await expect(courses.first()).toBeVisible();
    await expect(courses.first()).toContainText(/React/i);
  });
});
```

#### Test Helpers

```typescript
// ✅ REUSABLE TEST HELPERS (helpers/test-helpers.ts)
export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(dashboard|courses)/, { timeout: 10000 });
}

export async function logout(page: Page) {
  const logoutButton = page.locator("text=/keluar|logout/i").first();
  await logoutButton.click();
  await page.waitForTimeout(500);
  await page.locator("text=/Ya,?\\s*Keluar/i").click();
  await page.waitForURL(/\/(|login)/, { timeout: 10000 });
}
```

#### Test Data

```typescript
// ✅ GOOD: Use fixtures for test data
export const testUsers = {
  valid: {
    name: "Test User",
    email: `test${Date.now()}@example.com`, // Unique email
    password: "password123",
  },
  admin: {
    email: "admin@example.com",
    password: "admin123",
  },
};

export const testCourses = {
  free: {
    slug: "pemrograman-web-modern-react-nextjs",
    title: "Pemrograman Web Modern dengan React & Next.js",
  },
};
```

#### Waiting Strategies

```typescript
// ✅ GOOD: Wait for specific conditions
await page.waitForLoadState("networkidle"); // Network idle
await page.waitForSelector("h1"); // Element present
await page.waitForURL("/dashboard"); // URL changed
await expect(element).toBeVisible({ timeout: 10000 }); // Element visible

// ⚠️ USE SPARINGLY: Fixed timeouts (flaky)
await page.waitForTimeout(1000); // Only for animations/debounce

// ❌ AVOID: No waiting (race conditions)
await page.click("button");
expect(page.url()).toBe("/dashboard"); // BAD! Might not have navigated yet
```

---

## 🗄️ Database Guidelines

### Migration Files

```sql
-- ✅ GOOD: Descriptive names, timestamps
-- migrations/001_create_users_table.sql

CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);
```

### Schema Design

```sql
-- ✅ FOLLOW THESE RULES:
1. Use UNSIGNED INT for IDs
2. Use VARCHAR with size limits (100 for names/emails, 255 for URLs)
3. Use TEXT for long content (descriptions, MDX content)
4. Use DECIMAL(10,2) for prices
5. Add created_at and updated_at to all tables
6. Add indexes on foreign keys and frequently queried columns
7. Use snake_case for column names

-- ❌ AVOID:
1. Using INT without UNSIGNED for IDs
2. VARCHAR without size
3. No indexes on foreign keys
4. FLOAT for money (use DECIMAL)
```

### Seed Data

```sql
-- ✅ GOOD: Realistic, Indonesian content
INSERT INTO courses (title, slug, description, price, category, difficulty, instructor_id)
VALUES
(
    'Pemrograman Web Modern dengan React & Next.js',
    'pemrograman-web-modern-react-nextjs',
    'Belajar membangun aplikasi web modern menggunakan React dan Next.js...',
    499000,
    'Web Development',
    'beginner',
    2
);
```

---

## 🔒 Security Requirements

### Authentication

```typescript
// ✅ FRONTEND: Store JWT securely
localStorage.setItem("token", response.data.token);

// Include in requests
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// ❌ NEVER: Store password or sensitive data in localStorage
```

```go
// ✅ BACKEND: Validate JWT in middleware
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenString := c.GetHeader("Authorization")
        if tokenString == "" {
            c.JSON(401, gin.H{"error": "Unauthorized"})
            c.Abort()
            return
        }

        // Parse and validate token
        token, err := jwt.Parse(tokenString[7:], func(token *jwt.Token) (interface{}, error) {
            return []byte(os.Getenv("JWT_SECRET")), nil
        })

        if err != nil || !token.Valid {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        c.Next()
    }
}
```

### Input Validation

```go
// ✅ BACKEND: Validate all inputs
type RegisterRequest struct {
    Name     string `json:"name" binding:"required,min=3,max=100"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=6,max=50"`
}

// Use binding validation
if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(400, gin.H{"error": err.Error()})
    return
}
```

```typescript
// ✅ FRONTEND: Client-side validation with Zod
const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});
```

---

## 📝 Code Quality Standards

### Naming Conventions

```
✅ BACKEND (Go):
- Files: snake_case (user_service.go, auth_handler.go)
- Types: PascalCase (UserService, CourseRepository)
- Functions: PascalCase for exported, camelCase for private
- Variables: camelCase
- Constants: SCREAMING_SNAKE_CASE

✅ FRONTEND (TypeScript):
- Files: kebab-case (use-courses.ts, course-card.tsx)
- Components: PascalCase (CourseCard, LoginForm)
- Hooks: camelCase with 'use' prefix (useCourses, useAuth)
- Functions: camelCase
- Constants: SCREAMING_SNAKE_CASE
- CSS classes: kebab-case (bg-orange-600)
```

### Comments

```go
// ✅ GOOD: Explain WHY, not WHAT
// Hash password before saving to prevent storing plain text
hashedPassword, err := bcrypt.GenerateFromPassword(...)

// ❌ BAD: States the obvious
// Hash the password
hashedPassword, err := bcrypt.GenerateFromPassword(...)
```

### Error Handling

```go
// ✅ GOOD: Handle errors explicitly
user, err := s.repo.FindByEmail(email)
if err != nil {
    log.Printf("Error finding user: %v", err)
    return nil, errors.New("internal server error")
}
if user == nil {
    return nil, errors.New("user not found")
}

// ❌ BAD: Ignore errors
user, _ := s.repo.FindByEmail(email)
```

---

## 🎯 Common Patterns

### 1. Pagination

```go
// ✅ BACKEND: Standard pagination
type PaginationParams struct {
    Page  int `form:"page" binding:"min=1"`
    Limit int `form:"limit" binding:"min=1,max=100"`
}

func (h *CourseHandler) List(c *gin.Context) {
    var params PaginationParams
    if err := c.ShouldBindQuery(&params); err != nil {
        params.Page = 1
        params.Limit = 10
    }

    offset := (params.Page - 1) * params.Limit
    courses, total, err := h.service.List(offset, params.Limit)

    c.JSON(200, gin.H{
        "data": courses,
        "pagination": gin.H{
            "page":        params.Page,
            "limit":       params.Limit,
            "total":       total,
            "total_pages": (total + params.Limit - 1) / params.Limit,
        },
    })
}
```

```tsx
// ✅ FRONTEND: Pagination with React Query
const [page, setPage] = useState(1);
const { data } = useCourses({ page, limit: 10 });

<Pagination
  currentPage={data.pagination.page}
  totalPages={data.pagination.total_pages}
  onPageChange={setPage}
/>;
```

### 2. Search & Filter

```go
// ✅ BACKEND: Dynamic query building
func (r *courseRepository) Search(params SearchParams) ([]Course, error) {
    query := r.db.Model(&Course{})

    if params.Search != "" {
        query = query.Where("title LIKE ? OR description LIKE ?",
            "%"+params.Search+"%", "%"+params.Search+"%")
    }

    if params.Category != "" {
        query = query.Where("category = ?", params.Category)
    }

    if params.Difficulty != "" {
        query = query.Where("difficulty = ?", params.Difficulty)
    }

    var courses []Course
    err := query.Find(&courses).Error
    return courses, err
}
```

### 3. File Upload (Future)

```go
// ✅ PATTERN: Validate file type and size
func (h *FileHandler) Upload(c *gin.Context) {
    file, err := c.FormFile("file")
    if err != nil {
        c.JSON(400, gin.H{"error": "No file uploaded"})
        return
    }

    // Validate size (max 5MB)
    if file.Size > 5*1024*1024 {
        c.JSON(400, gin.H{"error": "File too large"})
        return
    }

    // Validate type
    ext := filepath.Ext(file.Filename)
    allowedExts := []string{".jpg", ".jpeg", ".png", ".pdf"}
    // ... validation logic
}
```

---

## 🚀 Quick Reference

### Backend Checklist

- [ ] Follow module pattern (model → dto → repo → service → handler → routes)
- [ ] Use GORM for database operations
- [ ] Validate all inputs with binding tags
- [ ] Hash passwords with bcrypt
- [ ] Return standard JSON response format
- [ ] Handle errors explicitly
- [ ] Use middleware for auth
- [ ] Add indexes to foreign keys
- [ ] Write descriptive migration files

### Frontend Checklist

- [ ] Use Next.js 15 App Router
- [ ] Handle async params with `React.use(params)`
- [ ] Use React Query for data fetching
- [ ] Use React Hook Form for forms
- [ ] Use Shadcn components
- [ ] Apply orange brand colors (#ea580c)
- [ ] Write all UI text in Bahasa Indonesia
- [ ] Show loading states with Skeleton
- [ ] Handle errors with Alert components
- [ ] Use TypeScript strictly

### Testing Checklist

- [ ] Write descriptive test names
- [ ] Use test helpers for common actions
- [ ] Wait for network/elements properly
- [ ] Test happy path and error cases
- [ ] Use unique test data (timestamps)
- [ ] Clean up test data after tests
- [ ] Test in multiple browsers
- [ ] Check responsive layouts

---

## 📞 Need Help?

**Documentation**: See DEVELOPMENT.md, README.md, ROADMAP.md  
**API Reference**: See API_SPEC.md  
**Database Schema**: See DATABASE.md  
**Contribution Guide**: See CONTRIBUTING.md

---

**Generated**: November 3, 2025  
**Version**: 1.0.0
