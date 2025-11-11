# 📁 Project Structure - TempaSKill

> Complete folder structure untuk referensi

---

## 🌳 Full Monorepo Structure

```
d:\non-bri\tempa-skill\                    # Monorepo Root
│
├── 📄 README.md                           # Project overview & roadmap
├── 📄 DEVELOPMENT.md                      # Coding standards & patterns
├── 📄 API_SPEC.md                         # Complete API documentation
├── 📄 DATABASE.md                         # Database schema & queries
├── 📄 QUICKSTART.md                       # Setup & installation guide
├── 📄 CONTEXT.md                          # AI context & rules (CRITICAL)
├── 📄 STRUCTURE.md                        # This file
├── 📄 .gitignore                          # Git ignore rules
│
├── 📁 tempaskill-be/                      # Backend Workspace (Go)
│   │
│   ├── 📁 cmd/
│   │   └── 📁 api/
│   │       └── 📄 main.go                 # Application entry point
│   │
│   ├── 📁 internal/                       # Private application code
│   │   │
│   │   ├── 📁 auth/                       # Authentication module
│   │   │   ├── 📄 auth_handler.go         # HTTP endpoints
│   │   │   ├── 📄 auth_service.go         # Business logic
│   │   │   ├── 📄 auth_repository.go      # Database operations
│   │   │   ├── 📄 auth_dto.go             # DTOs (Request/Response)
│   │   │   └── 📄 auth_model.go           # GORM models (if separate)
│   │   │
│   │   ├── 📁 user/                       # User management
│   │   │   ├── 📄 user_handler.go
│   │   │   ├── 📄 user_service.go
│   │   │   ├── 📄 user_repository.go
│   │   │   └── 📄 user_model.go
│   │   │
│   │   ├── 📁 course/                     # Course management
│   │   │   ├── 📄 course_handler.go
│   │   │   ├── 📄 course_service.go
│   │   │   ├── 📄 course_repository.go
│   │   │   └── 📄 course_model.go
│   │   │
│   │   ├── 📁 lesson/                     # Lesson management
│   │   │   ├── 📄 lesson_handler.go
│   │   │   ├── 📄 lesson_service.go
│   │   │   ├── 📄 lesson_repository.go
│   │   │   └── 📄 lesson_model.go
│   │   │
│   │   ├── 📁 progress/                   # Progress tracking
│   │   │   ├── 📄 progress_handler.go
│   │   │   ├── 📄 progress_service.go
│   │   │   ├── 📄 progress_repository.go
│   │   │   └── 📄 progress_model.go
│   │   │
│   │   ├── 📁 enrollment/                 # Course enrollment
│   │   │   ├── 📄 enrollment_handler.go
│   │   │   ├── 📄 enrollment_service.go
│   │   │   └── 📄 enrollment_repository.go
│   │   │
│   │   └── 📁 middleware/                 # HTTP middleware
│   │       ├── 📄 auth.go                 # JWT validation
│   │       ├── 📄 cors.go                 # CORS configuration
│   │       └── 📄 logger.go               # Request logging
│   │
│   ├── 📁 pkg/                            # Public reusable packages
│   │   ├── 📁 database/
│   │   │   └── 📄 mysql.go                # DB connection & migrations
│   │   ├── 📁 response/
│   │   │   └── 📄 response.go             # Standard API response
│   │   ├── 📁 validator/
│   │   │   └── 📄 validator.go            # Custom validators
│   │   └── 📁 jwt/
│   │       └── 📄 jwt.go                  # JWT utilities
│   │
│   ├── 📁 config/
│   │   └── 📄 config.go                   # Environment configuration
│   │
│   ├── 📁 migrations/                     # SQL migrations (optional)
│   │   ├── 📄 001_create_users.sql
│   │   ├── 📄 002_create_courses.sql
│   │   └── 📄 003_create_lessons.sql
│   │
│   ├── 📁 tests/                          # Tests
│   │   ├── 📁 integration/
│   │   └── 📁 unit/
│   │
│   ├── 📄 .env.example                    # Environment template
│   ├── 📄 .env                            # Environment variables (gitignored)
│   ├── 📄 .gitignore
│   ├── 📄 go.mod                          # Go dependencies
│   ├── 📄 go.sum                          # Dependency checksums
│   ├── 📄 Makefile                        # Build & deployment scripts
│   └── 📄 README.md                       # Backend-specific docs
│
└── 📁 tempaskill-fe/                      # Frontend Workspace (Next.js)
    │
    ├── 📁 src/
    │   │
    │   ├── 📁 app/                        # Next.js App Router
    │   │   │
    │   │   ├── 📁 (auth)/                 # Auth route group
    │   │   │   ├── 📁 login/
    │   │   │   │   └── 📄 page.tsx        # /login
    │   │   │   └── 📁 register/
    │   │   │       └── 📄 page.tsx        # /register
    │   │   │
    │   │   ├── 📁 admin/                  # Admin panel
    │   │   │   ├── 📄 layout.tsx          # Admin layout
    │   │   │   ├── 📁 courses/
    │   │   │   │   └── 📄 page.tsx        # /admin/courses
    │   │   │   ├── 📁 dashboard/
    │   │   │   │   └── 📄 page.tsx        # /admin/dashboard
    │   │   │   ├── 📁 payments/
    │   │   │   │   └── 📄 page.tsx        # /admin/payments
    │   │   │   └── 📁 sessions/
    │   │   │       └── 📄 page.tsx        # /admin/sessions
    │   │   │
    │   │   ├── 📁 courses/                # Course routes
    │   │   │   ├── 📄 page.tsx            # /courses (catalog)
    │   │   │   ├── 📄 CoursesPageContent.tsx
    │   │   │   └── 📁 [slug]/
    │   │   │       ├── 📄 page.tsx        # /courses/[slug] (detail)
    │   │   │       └── 📁 lessons/
    │   │   │           └── 📁 [id]/
    │   │   │               └── 📄 page.tsx # /courses/[slug]/lessons/[id]
    │   │   │
    │   │   ├── � dashboard/              # User dashboard
    │   │   │   └── 📄 page.tsx            # /dashboard
    │   │   │
    │   │   ├── 📁 payments/               # Payment pages
    │   │   │   └── 📄 page.tsx            # /payments
    │   │   │
    │   │   ├── � profile/                # User profile
    │   │   │   └── 📄 page.tsx            # /profile
    │   │   │
    │   │   ├── 📁 sessions/               # Live sessions
    │   │   │   └── 📄 page.tsx            # /sessions
    │   │   │
    │   │   ├── 📄 layout.tsx              # Root layout
    │   │   ├── 📄 page.tsx                # Homepage (/)
    │   │   ├── 📄 globals.css             # Global styles
    │   │   └── 📄 favicon.ico
    │   │
    │   ├── 📁 components/                 # Reusable components
    │   │   │
    │   │   ├── 📁 ui/                     # Shadcn/ui components
    │   │   │   ├── 📄 button.tsx
    │   │   │   ├── 📄 card.tsx
    │   │   │   ├── 📄 input.tsx
    │   │   │   ├── 📄 dialog.tsx
    │   │   │   ├── 📄 badge.tsx
    │   │   │   ├── 📄 skeleton.tsx
    │   │   │   └── ...
    │   │   │
    │   │   ├── � common/                 # Business components
    │   │   │   ├── 📄 page-header.tsx
    │   │   │   ├── 📄 loading-screen.tsx
    │   │   │   ├── � empty-state.tsx
    │   │   │   └── ...
    │   │   │
    │   │   ├── � course/                 # Course components
    │   │   │   ├── 📄 course-card.tsx
    │   │   │   ├── 📄 course-grid.tsx
    │   │   │   ├── 📄 progress-ring.tsx
    │   │   │   └── ...
    │   │   │
    │   │   ├── 📁 payment/                # Payment components
    │   │   │   └── 📄 payment-modal.tsx
    │   │   │
    │   │   ├── 📁 review/                 # Review components
    │   │   │   ├── 📄 review-card.tsx
    │   │   │   ├── 📄 review-form.tsx
    │   │   │   └── ...
    │   │   │
    │   │   ├── 📁 admin/                  # Admin components
    │   │   │   └── 📄 mdx-editor.tsx
    │   │   │
    │   │   ├── � mdx/                    # MDX rendering
    │   │   │   ├── 📄 mdx-content.tsx
    │   │   │   └── ...
    │   │   │
    │   │   └── 📁 layout/                 # Layout components
    │   │       ├── 📄 navbar.tsx
    │   │       ├── 📄 sidebar.tsx
    │   │       └── ...
    │   │
    │   ├── 📁 hooks/                      # Custom React hooks
    │   │   ├── 📄 use-auth.ts             # Authentication
    │   │   ├── 📄 use-courses.ts          # Course management
    │   │   ├── 📄 use-lessons.ts          # Lesson handling
    │   │   ├── 📄 use-progress.ts         # Progress tracking
    │   │   ├── � use-payment.ts          # Payment transactions
    │   │   ├── 📄 use-reviews.ts          # Course reviews
    │   │   ├── 📄 use-sessions.ts         # Live sessions
    │   │   └── 📄 index.ts                # Hook exports
    │   │
    │   ├── 📁 lib/                        # Utilities & configurations
    │   │   ├── 📄 api-client.ts           # Axios client
    │   │   ├── 📄 auth-token.ts           # Token management
    │   │   ├── 📄 constants.ts            # App constants & routes
    │   │   ├── 📄 utils.ts                # Utility functions
    │   │   ├── � validators.ts           # Zod schemas
    │   │   └── 📄 query-client.ts         # React Query config
    │   │
    │   ├── � types/                      # TypeScript definitions
    │   │   ├── � api.ts                  # API response types
    │   │   ├── � common.ts               # Shared types
    │   │   └── 📄 index.ts                # Type exports
    │   │
    │   └── 📁 styles/                     # Additional styles
    │       └── 📄 animations.ts
    │
    ├── 📁 e2e/                            # End-to-end tests
    │   ├── 📁 helpers/
    │   │   └── 📄 test-helpers.ts         # Test utilities
    │   └── 📁 tests/
    │       ├── 📄 auth.spec.ts
    │       ├── � courses.spec.ts
    │       └── ...
    │
    ├── 📁 public/                         # Static assets
    │   ├── � favicon.ico
    │   └── ...
    │
    ├── 📄 .env.example                    # Environment template
    ├── 📄 .env.local                      # Local environment
    ├── 📄 .gitignore
    ├── 📄 next.config.js                  # Next.js config
    ├── 📄 tailwind.config.ts              # Tailwind config
    ├── 📄 tsconfig.json                   # TypeScript config
    ├── 📄 components.json                 # Shadcn/ui config
    ├── 📄 package.json                    # Dependencies
    ├── 📄 package-lock.json
    ├── 📄 playwright.config.ts            # E2E test config
    └── 📄 README.md                       # Frontend docs
```

---

## 📊 Module Dependencies

### Backend Flow

```
main.go
  ↓
config (load env)
  ↓
database (connect MySQL)
  ↓
router (Gin)
  ↓
middleware (CORS, Auth)
  ↓
handlers → services → repositories
```

### Frontend Flow

```
layout.tsx (root)
  ↓
Providers (Query, Auth)
  ↓
page.tsx
  ↓
Components
  ↓
Queries (TanStack Query)
  ↓
API Client (axios)
  ↓
Backend API
```

---

## 🎯 Key Files Purpose

### Backend Critical Files

| File                                       | Purpose                            |
| ------------------------------------------ | ---------------------------------- |
| `cmd/api/main.go`                          | Entry point, server initialization |
| `config/config.go`                         | Environment configuration loader   |
| `pkg/database/mysql.go`                    | Database connection & migrations   |
| `internal/middleware/auth.go`              | JWT validation middleware          |
| `internal/{domain}/{domain}_handler.go`    | HTTP endpoint definitions          |
| `internal/{domain}/{domain}_service.go`    | Business logic implementation      |
| `internal/{domain}/{domain}_repository.go` | Database queries                   |

### Frontend Critical Files

| File                              | Purpose                        |
| --------------------------------- | ------------------------------ |
| `src/app/layout.tsx`              | Root layout with providers     |
| `src/lib/api.ts`                  | Axios client with interceptors |
| `src/lib/queryClient.ts`          | TanStack Query configuration   |
| `src/store/auth.store.ts`         | Auth state management          |
| `src/queries/{domain}.queries.ts` | API call hooks                 |
| `tailwind.config.ts`              | Brand colors & theme           |

---

## 📦 Dependencies Overview

### Backend (go.mod)

```go
require (
    github.com/gin-gonic/gin           // Web framework
    gorm.io/gorm                       // ORM
    gorm.io/driver/mysql               // MySQL driver
    github.com/golang-jwt/jwt/v5       // JWT
    golang.org/x/crypto/bcrypt         // Password hashing
    github.com/joho/godotenv           // Environment variables
)
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "next": "^14.0.0", // Framework
    "react": "^18.2.0", // UI library
    "@tanstack/react-query": "^5", // Data fetching
    "zustand": "^4", // State management
    "react-hook-form": "^7", // Forms
    "zod": "^3", // Validation
    "axios": "^1", // HTTP client
    "tailwindcss": "^3", // Styling
    "velite": "^0.1" // MDX processing
  }
}
```

---

## 🔍 Where to Find What

### "Saya ingin membuat endpoint baru untuk..."

→ `tempaskill-be/internal/{domain}/`
→ Buat 3 files: `{domain}_handler.go`, `{domain}_service.go`, `{domain}_repository.go`

### "Saya ingin membuat halaman baru untuk..."

→ `tempaskill-fe/src/app/{route}/page.tsx`

### "Saya ingin membuat component reusable..."

→ `tempaskill-fe/src/components/shared/{component}.tsx`

### "Saya ingin fetch data dari API..."

→ `tempaskill-fe/src/queries/{domain}.queries.ts`

### "Saya ingin simpan state global..."

→ `tempaskill-fe/src/store/{feature}.store.ts`

### "Saya ingin membuat validation schema..."

→ `tempaskill-fe/src/schemas/{feature}.schema.ts`

### "Saya ingin mengubah warna brand..."

→ `tempaskill-fe/tailwind.config.ts`

### "Saya ingin membuat tabel database baru..."

→ `tempaskill-be/internal/{domain}/{domain}_model.go`
→ Update `DATABASE.md`

---

## 📐 Naming Conventions

### Backend (Go)

```
Files:        snake_case    (auth_handler.go)
Packages:     lowercase     (package auth)
Functions:    PascalCase    (func CreateUser)
Variables:    camelCase     (var userID)
Constants:    PascalCase    (const MaxRetries)
Database:     snake_case    (table: users, column: created_at)
```

### Frontend (TypeScript/React)

```
Files:        kebab-case    (course-card.tsx)
Components:   PascalCase    (function CourseCard)
Functions:    camelCase     (function fetchCourses)
Variables:    camelCase     (const userId)
Constants:    UPPER_SNAKE   (const API_BASE_URL)
Types:        PascalCase    (type User, interface Course)
CSS Classes:  kebab-case    (class="course-card")
```

---

## ✅ Structure Checklist

Saat membuat module/feature baru:

### Backend Module

- [ ] Create folder `internal/{domain}/`
- [ ] Create `{domain}_handler.go` (HTTP)
- [ ] Create `{domain}_service.go` (logic)
- [ ] Create `{domain}_repository.go` (DB)
- [ ] Create `{domain}_model.go` (GORM model)
- [ ] Create `{domain}_dto.go` (if needed)
- [ ] Register routes in router
- [ ] Update API_SPEC.md

### Frontend Feature

- [ ] Create route in `src/app/{route}/`
- [ ] Create types in `src/types/{feature}.types.ts`
- [ ] Create schema in `src/schemas/{feature}.schema.ts`
- [ ] Create queries in `src/queries/{feature}.queries.ts`
- [ ] Create components in `src/components/shared/`
- [ ] Use Shadcn/ui for base components
- [ ] Apply brand colors
- [ ] Add loading & error states

---

**Last Updated**: November 3, 2025  
**Structure Version**: 1.0.0
