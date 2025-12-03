# 🤖 GitHub Copilot Instructions - TempaSKill Platform

**Last Updated**: December 3, 2025  
**Project**: TempaSKill - Hybrid Course Learning Platform  
**Tech Stack**: Go 1.21 (Gin) + Next.js 16 + MySQL 8.0 + Playwright  
**Status**: ✅ MVP 100% Complete - Ready for Beta Launch

---

## 📊 Platform Quick Facts

**Backend**: 14 modules, 100+ APIs, 15 database tables  
**Frontend**: Next.js 16 App Router, React Query v5, Shadcn UI, TypeScript  
**Features**: Auth, Courses, Lessons, Progress, Payments (Midtrans), Certificates, Instructor Earnings  
**Tests**: 46 E2E tests (Playwright), ~70% backend coverage  
**Documentation**: API_SPEC, FRONTEND_API_GUIDE, DATABASE (all 100% complete)

---

## 🎯 Core Principles

### 1. Language Standards

```
✅ ALWAYS:
- Bahasa Indonesia for ALL user-facing text
- English for code, comments, technical docs
- Consistent terms: Kursus, Pelajaran, Masuk, Daftar, Mulai Belajar

❌ NEVER:
- Mix Indonesian/English in UI
- Use "Login" (use "Masuk")
- Use "Course" in UI (use "Kursus")
```

### 2. Brand Identity

```
✅ PRIMARY COLOR: Orange #ea580c (orange-600)
✅ Use: bg-orange-600 hover:bg-orange-700
✅ Gradients: from-orange-50 to-orange-100

❌ NEVER: Blue as primary, purple, teal
```

### 3. Code Organization

```
Backend: Clean Architecture (model → repo → service → handler)
Frontend: Feature-based (hooks → components → pages)
```

---

## ⚡ Quick Development Workflow

**ALWAYS develop Backend + Frontend simultaneously:**

### 1. Plan (5 min)

- Understand requirements
- Check if migration needed
- Review existing patterns in codebase

### 2. Backend (30-60 min)

```bash
# Pattern: model.go → dto.go → repository.go → service.go → handler.go → routes.go
# Reference: internal/course/, internal/certificate/

cd tempaskill-be
make migrate-up              # If needed
go test ./internal/[module]  # Test as you build
```

### 3. Frontend (30-60 min)

```bash
# Pattern: types → hooks → components → pages
# Reference: src/hooks/use-courses.ts, src/app/courses/

cd tempaskill-fe
# Add to: src/lib/constants.ts (API_ENDPOINTS)
# Add to: src/types/api.ts (TypeScript types)
# Create: src/hooks/use-[feature].ts (React Query)
# Create: src/app/[route]/page.tsx (Page component)
```

### 4. Quality Check (10 min) ✅ CRITICAL

```bash
# Backend
cd tempaskill-be
go test ./...
go build cmd/api/main.go

# Frontend (MUST FIX ALL ERRORS!)
cd tempaskill-fe
npm run build  # Fix ALL TypeScript errors before committing!
npm run lint
```

### 5. Document & Commit (10 min)

```bash
# Update: API_SPEC.md, DATABASE.md (if schema changed), TODO.md

git add .
git commit -m "feat: [feature name]

BACKEND:
- Add [Model/Service/API] for [feature]
- Implement [functionality]

FRONTEND:
- Create [Component/Page] for [feature]
- Add [Hook] for API integration

DOCS: Update API_SPEC.md, TODO.md
BUILD: ✅ Zero errors
TESTS: ✅ All passing"

git push
```

**Critical Rules**:

- ✅ Test continuously, fix errors immediately
- ✅ Use Indonesian for ALL UI text
- ✅ Follow orange brand colors (#ea580c)
- ❌ NEVER commit with TypeScript errors
- ❌ NEVER skip build verification

---

## 🔧 Backend Patterns (Go + Gin + GORM)

### Module Structure (ALWAYS Follow)

```
internal/[module]/
├── model.go      # GORM models with tags, hooks
├── dto.go        # Request/Response DTOs with validation tags
├── repository.go # Database ops (interface-based, testable)
├── service.go    # Business logic (uses repository)
├── handler.go    # HTTP handlers (thin, delegates to service)
└── routes.go     # Route registration (public/protected)
```

**Complete Examples**: `internal/course/`, `internal/certificate/`, `internal/withdrawal/`

### API Response Format

```go
// ✅ SUCCESS
{
    "message": "Success message",
    "data": {...}  // or [] for lists
}

// ✅ ERROR
{
    "error": "Error description"
}

// ✅ PAGINATED
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

### Security Rules

```go
✅ ALWAYS:
1. Bcrypt for passwords (cost 10+)
2. Validate JWT in middleware
3. Validate inputs with binding tags
4. Never expose passwords in responses
5. Parameterized queries (GORM default)

❌ NEVER:
1. Plain text passwords
2. Log sensitive data
3. Trust client input
```

### Performance

```go
// ✅ OPTIMIZE: Preload to avoid N+1
db.Preload("Lessons").Find(&courses)

// ✅ Select only needed fields
db.Select("id", "title", "slug").Find(&courses)

// ❌ AVOID: N+1 queries
for _, course := range courses {
    db.Where("course_id = ?", course.ID).Find(&lessons) // BAD!
}
```

### ⚠️ GORM Zero Value Trap (CRITICAL!)

```go
// ❌ WRONG: Updates() skips zero values (false, 0, "")
db.Model(&lesson).Updates(lesson)
// is_published = false → SKIPPED! Not saved to DB

// ✅ CORRECT: Use Select("*") to force update all fields
db.Model(&lesson).Select("*").Updates(lesson)
// is_published = false → SAVED! ✓

// Zero values affected: bool false, int 0, string ""
// Always use Select("*") for partial updates with potential zero values
// See: GORM_BEST_PRACTICES.md
```
db.Select("id", "title", "slug").Find(&courses)

// ❌ AVOID: N+1 queries
for _, course := range courses {
    db.Where("course_id = ?", course.ID).Find(&lessons) // BAD!
}
```

---

## ⚛️ Frontend Patterns (Next.js 16 + React Query)

### Project Structure

```
src/
├── app/           # Next.js 16 App Router
│   ├── (auth)/   # Route groups
│   ├── courses/  # Dynamic routes
│   └── layout.tsx
├── components/
│   ├── ui/       # Shadcn components
│   └── [domain]/ # Domain components
├── hooks/        # React Query hooks
├── lib/          # Utils, API client
└── types/        # TypeScript types
```

### Next.js 16 Async Params (BREAKING CHANGE!)

```tsx
// ❌ OLD (Next.js 14)
export default function Page({ params }: PageProps) {
  const { slug } = params; // ERROR: params is Promise!
}

// ✅ NEW (Next.js 16) - Use React.use()
import { use } from "react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function Page({ params }: PageProps) {
  const { slug } = use(params); // Unwrap Promise
  const { data: course } = useCourse(slug);
}
```

### React Query Pattern

```tsx
// hooks/use-courses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export const useCourses = (params?: CourseParams) => {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: async () => {
      const res = await apiClient.get("/courses", { params });
      return res.data.data;
    },
    staleTime: 0, // Always refetch on invalidation for fresh data
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: number) => {
      await apiClient.post(`/courses/${courseId}/enroll`);
    },
    onSuccess: async () => {
      // Use refetchQueries (not invalidateQueries) for immediate update
      await queryClient.refetchQueries({ queryKey: ["courses"] });
      await queryClient.refetchQueries({ queryKey: ["my-courses"] });
    },
  });
};
```
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (courseId: number) => {
      await apiClient.post(`/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
  });
};
```

### Component Patterns

#### Loading States

```tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function CoursesPage() {
  const { data, isLoading } = useCourses();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return <CourseGrid courses={data} />;
}
```

#### Error Handling

```tsx
import { Alert, AlertDescription } from "@/components/ui/alert";

if (error) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Kursus tidak ditemukan atau terjadi kesalahan.
      </AlertDescription>
    </Alert>
  );
}
```

#### Form Handling

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("email")}
        className={errors.email ? "border-red-500" : ""}
      />
      {errors.email && (
        <span className="text-red-500 text-sm">{errors.email.message}</span>
      )}

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

### UI Standards

```tsx
// ✅ USE SHADCN COMPONENTS
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// ✅ BRAND COLORS
<Button className="bg-orange-600 hover:bg-orange-700">Daftar Sekarang</Button>
<Badge className="bg-orange-100 text-orange-800">Pemula</Badge>

// ❌ NEVER
<button className="bg-blue-500"> // Wrong color!
```

### Indonesian Text

```tsx
// ✅ CORRECT TERMS
Masuk          // not "Login"
Daftar         // not "Register" or "Sign Up"
Kursus         // not "Course"
Pelajaran      // not "Lesson"
Mulai Belajar  // not "Start Learning"
Kemajuan       // not "Progress"
Keluar         // not "Logout"
```

---

## 🎯 Platform-Specific Rules

### 1. Certificate System

```tsx
// Check eligibility first
const { data: eligibility } = useCertificateEligibility(courseId);

// Issue certificate (only if 100% complete)
const issueMutation = useIssueCertificate();
issueMutation.mutate(courseId);

// Download PDF
downloadCertificate(certificateId); // Handles blob response
```

### 2. Instructor Earnings

```tsx
// Get balance
const { data: balance } = useEarningsBalance();
// balance: { total_earnings, available_balance, held_balance, withdrawn_total }

// Create withdrawal (min 100,000 IDR)
const createWithdrawal = useCreateWithdrawal();
createWithdrawal.mutate({ amount: 1000000, bank_account_id: 5 });
```

### 3. Payment Integration (Midtrans)

```tsx
// Backend creates transaction → returns snap_token
// Frontend opens Midtrans Snap popup
snap.pay(snapToken, {
  onSuccess: () => router.push("/payment/success"),
  onPending: () => router.push("/payment/pending"),
  onError: () => router.push("/payment/failed"),
});
```

### 4. Activity Logging

```tsx
// Automatic logging on backend for:
// - user_registered, user_login
// - course_enrolled, lesson_completed, course_completed
// - certificate_issued
// - withdrawal_requested, withdrawal_completed
// - course_created, lesson_created

// Frontend: Display user activities
const { data: activities } = useMyActivities({ type: "course_enrolled" });
```

---

## 🗄️ Database Guidelines

### Migration Files

```sql
-- migrations/XXX_feature_name.sql
-- ✅ GOOD: Descriptive names, proper types

CREATE TABLE certificates (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    course_id INT UNSIGNED NOT NULL,
    certificate_id VARCHAR(50) NOT NULL UNIQUE,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_certificate_id (certificate_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

### Schema Rules

```
✅ ALWAYS:
1. UNSIGNED INT for IDs
2. VARCHAR(100) for names/emails, VARCHAR(255) for URLs
3. TEXT for long content (MDX, descriptions)
4. DECIMAL(10,2) for prices
5. created_at, updated_at on all tables
6. Indexes on foreign keys + frequently queried columns
7. snake_case for column names

❌ NEVER:
1. INT without UNSIGNED for IDs
2. FLOAT for money (use DECIMAL)
3. Missing indexes on foreign keys
```

---

## 🧪 Testing Standards

### E2E Testing (Playwright)

```typescript
// e2e/feature.spec.ts
import { test, expect } from "@playwright/test";
import { login, generateTestUser } from "./helpers/test-helpers";

test("user dapat menyelesaikan kursus dan mendapat sertifikat", async ({
  page,
}) => {
  const user = generateTestUser();
  await login(page, user.email, user.password);

  await page.goto("/courses/pemrograman-web-modern-react-nextjs");
  await expect(page.locator("text=Mulai Belajar")).toBeVisible();

  // Complete all lessons...

  await expect(page.locator("text=Ambil Sertifikat")).toBeVisible();
});
```

### Best Practices

```typescript
✅ DO:
- Use test helpers (login, logout, generateTestUser)
- Wait strategies: waitForLoadState("networkidle"), waitForURL
- Bahasa Indonesia selectors: text=Daftar, text=Masuk
- Test isolation (unique users per test)

❌ AVOID:
- Fixed timeouts (use waitFor instead)
- Hardcoded test data (use generateTestUser)
- English selectors
```

---

## 🔐 Security Checklist

### Backend

```go
✅ ALWAYS:
1. Bcrypt password hashing (cost 10+)
2. JWT validation in middleware
3. Input validation with binding tags
4. HTTPS in production
5. Secure cookie flags (HttpOnly, Secure, SameSite)

❌ NEVER:
1. Plain text passwords
2. Log sensitive data (passwords, tokens)
3. Expose internal errors to client
```

### Frontend

```typescript
✅ ALWAYS:
1. Store JWT in localStorage (with expiry check)
2. Validate inputs with Zod
3. Handle auth errors (redirect to login on 401)

❌ NEVER:
1. Store passwords in localStorage
2. Trust server responses without validation
```

---

## 🌍 Environment Setup

### Backend (.env)

```bash
# Database
DATABASE_URL=mysql://user:pass@localhost:3306/tempaskill

# Auth
JWT_SECRET=your-secret-key-here

# Payment (Midtrans)
MIDTRANS_SERVER_KEY=your-midtrans-server-key
MIDTRANS_CLIENT_KEY=your-midtrans-client-key
MIDTRANS_ENVIRONMENT=sandbox # or production

# Firebase (Certificate PDF storage)
FIREBASE_CREDENTIALS=path/to/firebase-credentials.json
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com

# Server
PORT=8080
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=your-midtrans-client-key
```

---

## 📚 Documentation Map

**Complete API Reference**:

- `API_SPEC.md` - All 100+ endpoints with examples
- `API_QUICK_REFERENCE.md` - Quick lookup table
- `FRONTEND_API_GUIDE.md` - TypeScript types + React Query hooks

**Database**:

- `DATABASE.md` - 15 tables schema + ERD diagram

**Development**:

- `DEVELOPMENT.md` - Setup, build, deploy guides
- `README.md` - Project overview
- `TODO.md` - Feature tracking
- `ROADMAP.md` - Development timeline

**Testing**:

- `e2e/README.md` - E2E testing guide

**Frontend Architecture**:

- `docs/FRONTEND_ARCHITECTURE.md` - Component patterns
- `docs/MDX_GUIDE.md` - MDX editor usage

---

## ✅ Development Checklists

### Before Starting Feature

- [ ] Read API_SPEC.md for similar patterns
- [ ] Check existing modules in `internal/` and `src/hooks/`
- [ ] Plan database migration if needed

### Before Committing

- [ ] Backend: `go test ./...` passes
- [ ] Backend: `go build cmd/api/main.go` succeeds
- [ ] Frontend: `npm run build` passes (ZERO TypeScript errors!)
- [ ] Frontend: `npm run lint` passes
- [ ] All UI text in Bahasa Indonesia
- [ ] Orange brand colors used (#ea580c)

### Before Pushing

- [ ] Update API_SPEC.md with new endpoints
- [ ] Update DATABASE.md if schema changed
- [ ] Update TODO.md to mark tasks complete
- [ ] Write descriptive commit message
- [ ] Verify git status clean after push

### Production Deployment

- [ ] Run all migrations (`make migrate-up`)
- [ ] Set production env vars
- [ ] Build frontend (`npm run build`)
- [ ] Test critical flows (auth, payment, certificate)
- [ ] Verify Midtrans production credentials
- [ ] Check Firebase storage permissions

---

## 🚀 Quick Commands

### Backend

```bash
cd tempaskill-be
make migrate-up          # Run migrations
go test ./...            # Run all tests
go run cmd/api/main.go   # Start server (port 8080)
go build cmd/api/main.go # Build binary
```

### Frontend

```bash
cd tempaskill-fe
npm run dev              # Dev server (port 3000)
npm run build            # Production build (check TypeScript!)
npm run lint             # ESLint
npx shadcn@latest add button # Add Shadcn component
```

### Testing

```bash
cd tempa-skill
npm run test:e2e         # Run E2E tests (headless)
npm run test:e2e:ui      # Run with UI (debug mode)
```

### Git

```bash
git status
git add .
git commit -m "feat: [feature]"
git push
git log --oneline -5
```

---

## 🎯 Common Patterns Reference

### Pagination (Backend)

```go
type PaginationParams struct {
    Page  int `form:"page" binding:"min=1"`
    Limit int `form:"limit" binding:"min=1,max=100"`
}

offset := (params.Page - 1) * params.Limit
courses, total, err := h.service.List(offset, params.Limit)
```

### Pagination (Frontend)

```tsx
const [page, setPage] = useState(1);
const { data } = useCourses({ page, limit: 10 });

<Pagination
  currentPage={data.pagination.page}
  totalPages={data.pagination.total_pages}
  onPageChange={setPage}
/>;
```

### Search & Filter (Backend)

```go
query := db.Model(&Course{})
if search != "" {
    query = query.Where("title LIKE ?", "%"+search+"%")
}
if category != "" {
    query = query.Where("category = ?", category)
}
```

### Indonesian Currency Formatting

```typescript
export function formatCurrency(amount: number): string {
  if (amount === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}
```

### Date Formatting

```typescript
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
```

---

**Last Updated**: December 3, 2025  
**Version**: 2.0.0  
**Platform Status**: ✅ MVP 100% Complete - Ready for Beta Launch
