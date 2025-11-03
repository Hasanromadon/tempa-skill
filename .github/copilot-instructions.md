# 🤖 GitHub Copilot Instructions - TempaSKill Platform

**Last Updated**: November 3, 2025  
**Project**: TempaSKill - Hybrid Course Learning Platform  
**Tech Stack**: Go (Gin) + Next.js 15 + MySQL + Playwright

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Core Principles](#core-principles)
- [Development Workflow](#development-workflow)
- [Backend Development (Go)](#backend-development-go)
- [Frontend Development (Next.js)](#frontend-development-nextjs)
- [Reusable Components & Clean Code](#reusable-components--clean-code)
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

## � Development Workflow

### **ALWAYS Follow This Process for New Features**

When implementing a new feature (e.g., Admin Course Management, User Profile), **ALWAYS** develop Backend and Frontend simultaneously using this workflow:

#### **Phase 1: Plan & Design** (5-10 min)

```bash
1. Understand the feature requirements
2. Identify Backend APIs needed
3. Identify Frontend pages/components needed
4. Check if database migrations are required
5. Review existing code for reusable patterns
```

#### **Phase 2: Backend Development** (30-60 min)

```bash
# Step 1: Database (if needed)
- Create migration file (migrations/XXX_add_feature.sql)
- Run migration: make migrate-up

# Step 2: Backend Implementation
- Create/update model in internal/[module]/model.go
- Create DTOs in dto.go
- Implement repository methods in repository.go
- Implement business logic in service.go
- Create HTTP handlers in handler.go
- Register routes in routes.go

# Step 3: Backend Testing
cd tempaskill-be
go test ./internal/[module]/...
go run cmd/api/main.go  # Manual API testing
```

#### **Phase 3: Frontend Development** (30-60 min)

```bash
# Step 1: Types & API Client
- Add API endpoints to src/lib/constants.ts (API_ENDPOINTS)
- Add types to src/types/api.ts
- Create/update hooks in src/hooks/use-[feature].ts

# Step 2: Components
- Create reusable components in src/components/[domain]/
- Use existing components (PageHeader, LoadingScreen, etc.)
- Follow React.memo for performance
- Add ARIA labels for accessibility

# Step 3: Pages
- Create pages in src/app/[route]/page.tsx
- Use React Hook Form + Zod for forms
- Handle loading, error, and empty states
- Use Indonesian language for all UI text
```

#### **Phase 4: Quality Assurance** (10-20 min)

```bash
# Backend QA
cd tempaskill-be
go test ./...              # Run all tests
golangci-lint run          # Lint check
go build cmd/api/main.go   # Build check

# Frontend QA
cd tempaskill-fe
npm run build              # TypeScript + build check
npm run lint               # ESLint check

# ✅ CRITICAL: Fix ALL errors before proceeding
```

#### **Phase 5: Documentation** (5-10 min)

```bash
# Update relevant docs
1. API_SPEC.md - Add new API endpoints
2. DATABASE.md - Update schema if changed
3. TODO.md - Mark completed tasks
4. Update copilot todo list

# Example API_SPEC.md entry:
### POST /api/v1/courses
Create a new course (Admin/Instructor only)

**Request Body:**
{
  "title": "string",
  "description": "string",
  ...
}

**Response:** 201 Created
{
  "message": "Course created successfully",
  "data": { course object }
}
```

#### **Phase 6: Commit & Push** (5 min)

```bash
# Stage all changes (BE + FE + Docs)
git add .

# Commit with detailed message
git commit -m "feat: add [feature name]

BACKEND:
- Add [Model/API/Service] for [feature]
- Implement [functionality]
- Add tests for [scenarios]

FRONTEND:
- Create [Component/Page] for [feature]
- Add [Hook] for API integration
- Implement [UI/UX feature]

DOCUMENTATION:
- Update API_SPEC.md with new endpoints
- Update DATABASE.md with schema changes
- Mark TODO.md tasks complete

BUILD STATUS: ✅ Zero errors
TESTS: ✅ All passing"

# Push to GitHub
git push origin main
```

---

### **Complete Workflow Example: Admin Course Creation**

```bash
# 1. PLAN (5 min)
Goal: Admin can create courses
Backend: POST /api/v1/courses API
Frontend: /admin/courses/new page with form
Database: No migration needed (table exists)

# 2. BACKEND (45 min)
cd tempaskill-be

# Add DTO
# File: internal/course/dto.go
type CreateCourseRequest struct {
    Title       string  `json:"title" binding:"required,min=5"`
    Description string  `json:"description" binding:"required"`
    Price       float64 `json:"price" binding:"min=0"`
    // ...
}

# Add handler
# File: internal/course/handler.go
func (h *CourseHandler) Create(c *gin.Context) {
    // Implementation
}

# Test backend
go test ./internal/course/...
go run cmd/api/main.go

# 3. FRONTEND (45 min)
cd tempaskill-fe

# Add hook
# File: src/hooks/use-courses.ts
export const useCreateCourse = () => {
  return useMutation({
    mutationFn: async (data) => {
      await apiClient.post(API_ENDPOINTS.COURSES.CREATE, data);
    },
  });
};

# Create form component
# File: src/components/admin/course-form.tsx
export function CourseForm({ onSubmit }) {
  // React Hook Form + Zod validation
}

# Create page
# File: src/app/admin/courses/new/page.tsx
export default function NewCoursePage() {
  const createCourse = useCreateCourse();
  // Implementation
}

# 4. QUALITY CHECK (15 min)
cd tempaskill-be && go test ./... && go build cmd/api/main.go
cd tempaskill-fe && npm run build  # Fix ALL TypeScript errors!

# 5. DOCUMENTATION (10 min)
# Update API_SPEC.md, TODO.md

# 6. COMMIT & PUSH (5 min)
git add .
git commit -m "feat: implement admin course creation

BACKEND:
- Add CreateCourseRequest DTO with validation
- Implement Create handler in CourseHandler
- Add POST /api/v1/courses route
- Tests cover validation and success scenarios

FRONTEND:
- Create CourseForm component with React Hook Form
- Add useCreateCourse hook for API integration
- Create /admin/courses/new page
- Form validates title, description, price, category

DOCUMENTATION:
- Add POST /courses to API_SPEC.md
- Mark 'Admin Course Creation' complete in TODO.md

BUILD: ✅ Zero TypeScript errors
TESTS: ✅ All passing"

git push
```

---

### **Workflow Best Practices**

#### ✅ **DO:**

1. **Develop BE + FE Together**: Don't finish entire backend then start frontend
2. **Test Continuously**: Test after each component, not at the end
3. **Fix Errors Immediately**: Never commit with TypeScript/Go errors
4. **Document As You Go**: Update API_SPEC.md while writing APIs
5. **Commit Frequently**: Small, focused commits with clear messages
6. **Update TODO**: Mark tasks complete to track progress
7. **Use Reusable Code**: Check for existing components/patterns first

#### ❌ **DON'T:**

1. **Skip Testing**: Never push untested code
2. **Ignore Build Errors**: "I'll fix it later" = technical debt
3. **Poor Commit Messages**: "fix stuff" is not helpful
4. **Skip Documentation**: Future you will thank you
5. **Work on Too Many Things**: Focus on one feature at a time
6. **Forget to Update TODO**: Keep progress visible

---

### **Quick Commands Reference**

```bash
# Backend
cd tempaskill-be
go test ./...                    # Run all tests
go test ./internal/course/...    # Test specific module
go run cmd/api/main.go           # Start backend server
make migrate-up                  # Run migrations
golangci-lint run                # Lint

# Frontend
cd tempaskill-fe
npm run dev                      # Start dev server
npm run build                    # TypeScript + build check
npm run lint                     # ESLint
npm run test                     # Run tests
npx shadcn@latest add [component] # Add Shadcn component

# Git
git status                       # Check changes
git add .                        # Stage all
git commit -m "message"          # Commit
git push                         # Push to GitHub
git log --oneline -5             # Recent commits
```

---

### **When to Skip Steps**

You can **skip** certain steps only when:

- **Documentation**: Trivial UI changes (button color, padding)
- **Backend Testing**: Fixing frontend-only bugs (typos in UI text)
- **Frontend Testing**: Backend-only changes (database migration)

**NEVER skip**: Build verification, TypeScript error checking, Git commit

---

## �🔧 Backend Development (Go)

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

## � Reusable Components & Clean Code

### Principles for Every Development

**ALWAYS consider reusability before creating new components:**

1. **Check Existing Components First**
   - Look in `components/ui/` (Shadcn components)
   - Look in `components/common/` (reusable business components)
   - Look in `components/[domain]/` (domain-specific components)
2. **DRY Principle** (Don't Repeat Yourself)

   - If pattern appears 3+ times → create reusable component
   - If logic is duplicated → extract to utility function
   - If types are similar → create shared type definition

3. **Single Responsibility**
   - Each component should have ONE clear purpose
   - Separate concerns: UI vs Business Logic vs Data Fetching
4. **Composition Over Configuration**
   - Prefer `children` props over many boolean flags
   - Use compound components pattern (Card → CardHeader, CardContent)
5. **TypeScript First**
   - Always define proper interfaces/types
   - Extend HTML attributes when needed
   - Export types for reusability

### Component Organization Structure

```
components/
├── ui/                 # Shadcn atomic components (ALREADY EXISTS)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
│
├── common/             # Reusable business components (CREATE IF NOT EXISTS)
│   ├── page-header.tsx     # Standard page header with back button
│   ├── loading-screen.tsx  # Full screen loader
│   ├── empty-state.tsx     # Empty state component
│   └── error-boundary.tsx  # Error boundary wrapper
│
├── course/             # Domain-specific: Course
│   ├── course-card.tsx
│   ├── course-grid.tsx
│   ├── course-filter.tsx
│   └── progress-ring.tsx
│
├── lesson/             # Domain-specific: Lesson
│   ├── lesson-list.tsx
│   ├── lesson-card.tsx
│   └── lesson-navigation.tsx
│
└── mdx/               # MDX rendering (ALREADY EXISTS)
    ├── mdx-content.tsx
    └── ...
```

### Reusable Component Template

```tsx
// ✅ GOOD: Reusable component pattern
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
              <h1 className="text-3xl font-bold">{title}</h1>
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

// Usage across multiple pages
<PageHeader
  title="Dashboard"
  description="Selamat datang kembali!"
  action={<Button onClick={logout}>Keluar</Button>}
/>;
```

### Utility Functions (Always Extract Common Logic)

**File**: `src/lib/utils.ts`

```typescript
// ✅ ALWAYS extract repeated logic to utils

// Date formatting
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

// Duration formatting
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
}

// Currency formatting
export function formatCurrency(amount: number): string {
  if (amount === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Text truncation
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
```

### Type Definitions (Centralize Common Types)

**File**: `src/types/common.ts`

```typescript
// ✅ ALWAYS define reusable types

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
```

### Checklist Before Creating New Component

✅ **ALWAYS Ask**:

1. Does this component already exist?
2. Is this used in 3+ places? (If no, maybe keep inline)
3. Can I compose existing components instead?
4. Does it have a single, clear responsibility?
5. Are the props interface well-defined?
6. Can others understand and use it easily?

❌ **AVOID**:

1. Over-abstraction (too generic, hard to use)
2. God components (doing too many things)
3. Premature optimization (one-off components)
4. Poor naming (vague like `Container`, `Wrapper`)

### Import Organization (ALWAYS Follow)

```tsx
// 1. External dependencies (React, Next.js)
import { useState } from "react";
import { useRouter } from "next/navigation";

// 2. UI components (Shadcn)
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

// 3. Common components
import { PageHeader } from "@/components/common/page-header";
import { LoadingScreen } from "@/components/common/loading-screen";

// 4. Domain components
import { CourseCard } from "@/components/course/course-card";

// 5. Hooks
import { useCourses, useAuth } from "@/hooks";

// 6. Utils, types, constants
import { formatDate, cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";
import type { Course } from "@/types";

// 7. Icons (last)
import { BookOpen, User, LogOut } from "lucide-react";
```

### Documentation Reference

Full guidelines available at: `docs/FRONTEND_ARCHITECTURE.md`

---

## �🧪 Testing Standards

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

### TypeScript Error Checking (CRITICAL!)

```
✅ ALWAYS after frontend development:

1. Check for TypeScript errors:
   npm run build

2. Fix ALL errors before committing:
   - Unused imports
   - Type mismatches
   - Missing properties
   - Any type usage

3. Run type check in development:
   npm run type-check (if available)

❌ NEVER:
- Commit code with TypeScript errors
- Use 'any' type without comment
- Ignore type warnings
- Skip error checking

💡 TIPS:
- Use get_errors tool to check before committing
- Fix errors immediately when they appear
- Add proper types instead of using 'any'
- Use type guards for runtime checks
```

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
- [ ] **Run `npm run build` and fix ALL TypeScript errors before committing**

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
