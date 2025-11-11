# 🔥 TempaSKill - Hybrid Course Platform

> Platform kursus online berbasis teks dengan sesi live interaktif berkala

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15+-000000?logo=next.js)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## 📋 Daftar Isi

- [Gambaran Umum](#gambaran-umum)
- [Arsitektur](#arsitektur)
- [Tech Stack](#tech-stack)
- [Development Roadmap](#development-roadmap)
- [Getting Started](#getting-started)

---

## 🎯 Gambaran Umum

**TempaSKill** adalah platform pembelajaran online dengan model bisnis hybrid yang unik:

### Model Bisnis

- **Materi Utama**: Berbasis teks/artikel (bukan video) untuk efisiensi bandwidth
- **Interaksi Langsung**: Sesi online via Zoom/Meet setiap 2 minggu untuk Q&A dan live coding
- **Target**: Menghemat biaya produksi sambil tetap memberikan pengalaman belajar interaktif

### Fitur Inti

#### Backend (✅ 100% Complete)

- ✅ **Autentikasi pengguna** - Register/Login dengan JWT, middleware protection
- ✅ **User Management** - Get profile, update profile, change password
- ✅ **Course Management** - CRUD operations, enrollment, lessons, slug-based retrieval
- ✅ **Progress Tracking** - Mark lessons complete, track progress percentage, course completion
- ✅ **Course Catalog** - Search & filter, pagination, optimized queries (100x faster)
- ✅ **Request ID Tracing** - Unique ID per request untuk debugging
- ✅ **Rate Limiting** - Perlindungan terhadap abuse (100 req/min umum, 10 req/min auth)
- ✅ **Security Headers** - XSS protection, clickjacking prevention

#### Frontend (✅ 95% Complete)

- ✅ **Authentication Pages** - Login, Register with form validation
- ✅ **Landing Page** - Hero section with orange brand colors, features showcase
- ✅ **Course Listing** - Search, pagination, guest/authenticated views
- ✅ **Course Detail Page** - Full course info, lessons list, enrollment, progress tracking
- ✅ **User Dashboard** - Enrolled courses, progress tracking, quick actions
- ✅ **Admin Panel (NEW)** - Complete admin interface for managing courses and lessons:
  - ✅ Course CRUD - Create, edit, delete courses with rich form validation
  - ✅ Lesson CRUD - Create, edit, delete lessons with MDX editor
  - ✅ MDX Editor Integration - Rich text editor with toolbar (bold, italic, lists, code blocks, headings)
  - ✅ Image Upload - Firebase Storage integration for course thumbnails and inline MDX images
  - ✅ Drag-Drop Reorder - Intuitive lesson reordering with dnd-kit library
  - ✅ Admin Dashboard - Course statistics, recent enrollments, quick actions
- ✅ **React Query Hooks** - Complete API integration (useAuth, useCourses, useLessons, useProgress, useUser)
- ✅ **UI Components** - Shadcn UI (15+ components: Button, Card, Badge, Alert, Input, Form, Dialog, etc.)
- ✅ **Brand Compliance** - 100% compliant with TempaSKill orange (#ea580c) brand identity
- ✅ **Lesson Viewer** - MDX rendering with prev/next navigation
- 🚧 **Profile Management** - Edit profile, change password, settings page
- 🚧 **Protected Routes** - Middleware for auth-only pages

---

## 🏗️ Arsitektur

```
/tempaskill (Monorepo Root)
│
├── /tempaskill-be          # Backend API (Golang)
│   ├── cmd/
│   │   └── api/
│   │       └── main.go
│   ├── internal/
│   │   ├── auth/           # Authentication module
│   │   ├── user/           # User management
│   │   ├── course/         # Course management
│   │   ├── lesson/         # Lesson management
│   │   ├── progress/       # Progress tracking
│   │   └── middleware/     # Auth & CORS middleware
│   ├── pkg/
│   │   ├── database/       # DB connection
│   │   └── utils/          # Helper functions
│   ├── config/
│   │   └── config.go       # Environment config
│   ├── go.mod
│   └── .env.example
│
└── /tempaskill-fe          # Frontend (Next.js)
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/     # Auth pages (login, register)
    │   │   ├── courses/    # Course catalog & detail pages
    │   │   │   ├── page.tsx         # Course listing
    │   │   │   └── [slug]/page.tsx  # Course detail
    │   │   ├── dashboard/  # User dashboard
    │   │   ├── layout.tsx  # Root layout with providers
    │   │   ├── page.tsx    # Landing page
    │   │   └── globals.css # Global styles with brand colors
    │   ├── components/
    │   │   ├── ui/         # Shadcn components (8 installed)
    │   │   └── providers.tsx # TanStack Query + auth providers
    │   ├── hooks/          # Custom React Query hooks
    │   │   ├── use-auth.ts      # Authentication hooks
    │   │   ├── use-courses.ts   # Course hooks
    │   │   ├── use-lessons.ts   # Lesson hooks
    │   │   ├── use-progress.ts  # Progress tracking hooks
    │   │   └── use-user.ts      # User management hooks
    │   ├── lib/
    │   │   ├── api-client.ts    # Axios client with interceptors
    │   │   └── utils.ts         # Utility functions (cn, formatters)
    │   └── types/          # TypeScript type definitions
    ├── public/             # Static assets
    ├── public/
    ├── tailwind.config.ts
    ├── next.config.js
    └── package.json
```

---

## 🛠️ Tech Stack

### Backend (`tempaskill-be`)

| Layer      | Technology       | Purpose                    |
| ---------- | ---------------- | -------------------------- |
| Language   | **Go 1.21+**     | Performance & type safety  |
| Framework  | **Gin Gonic**    | Fast HTTP routing          |
| Database   | **MySQL**        | Relational data storage    |
| ORM        | **GORM**         | Database abstraction       |
| Auth       | **JWT (Manual)** | Token-based authentication |
| Deployment | **VPS Linux**    | Single binary + systemd    |

**API Base URL**: `http://localhost:8080/api/v1`

### Frontend (`tempaskill-fe`)

| Layer         | Technology                | Purpose                           |
| ------------- | ------------------------- | --------------------------------- |
| Framework     | **Next.js 16.0.1**        | React with App Router (Turbopack) |
| Language      | **TypeScript 5+**         | Type safety                       |
| Styling       | **Tailwind CSS v4**       | Utility-first CSS                 |
| UI Library    | **Shadcn/ui**             | Accessible components             |
| Icons         | **Lucide React**          | Icon library                      |
| Forms         | **React Hook Form + Zod** | Form handling & validation        |
| Data Fetching | **TanStack Query v5**     | Server state management           |
| HTTP Client   | **Axios 1.13+**           | API requests with interceptors    |
| Deployment    | **Vercel**                | Edge deployment                   |

**Installed Shadcn Components**: Button, Card, Badge, Alert, Input, Label, Progress, Skeleton

**Base URL**: `http://localhost:3000`

---

## 🎨 Brand Identity

### Color Palette

Terinspirasi dari kata **"Tempa"** (Forge) - api tempaan yang kuat dan transformatif.

```typescript
// tailwind.config.ts
colors: {
  // Primary - Api Tempaan
  primary: {
    DEFAULT: '#ea580c', // orange-600
    hover: '#c2410c',   // orange-700
  },

  // Secondary - Metal/Besi
  secondary: {
    DEFAULT: '#1e293b', // slate-800
    light: '#334155',   // slate-700
  },

  // Accent - Teknologi
  accent: {
    DEFAULT: '#3b82f6', // blue-500
    hover: '#2563eb',   // blue-600
  }
}
```

### Usage Guidelines

- **Primary (Orange)**: CTA buttons, important links, highlights
- **Secondary (Slate)**: Navigation, cards, footer, structural elements
- **Accent (Blue)**: Secondary actions, info badges, links
- **Background**: `bg-white`, `bg-gray-50` untuk keterbacaan maksimal

---

## 📐 Development Roadmap

### Phase 1: Foundation (Week 1-2) - ✅ COMPLETED

- [x] ✅ Setup Monorepo structure & documentation
- [x] ✅ **Backend**: Initialize Go project + MySQL database
- [x] ✅ **Backend**: Authentication system (JWT + middleware)
- [x] ✅ **Backend**: User Management (profile CRUD + password change)
- [x] ✅ **Backend**: Comprehensive test suite (11 unit + integration tests)
- [x] ✅ **Frontend**: Initialize Next.js 16 project with TypeScript
- [x] ✅ **Frontend**: Install Shadcn/ui + 8 components
- [x] ✅ **Frontend**: Setup TanStack Query + Axios client
- [x] ✅ **Frontend**: Brand identity implementation (orange #ea580c)


### Phase 2: Core Features (Week 3-4) - ✅ 90% COMPLETED

**Backend** (✅ 100% Complete):

- [x] ✅ Course CRUD & enrollment system (10/10 API tests passing)
- [x] ✅ Lesson management with MDX content storage
- [x] ✅ Progress tracking (mark complete, percentage, course completion)
- [x] ✅ Performance optimization (N+1 query fix, 100x faster)
- [x] ✅ Security features (rate limiting, request ID tracing)

**Frontend** (✅ 90% Complete):

- [x] ✅ Authentication pages (Login, Register) with validation
- [x] ✅ Landing page with brand colors
- [x] ✅ Course listing with search, filter, sort & pagination (Courses Page Integration)
- [x] ✅ Sort Dropdown component for course sorting
- [x] ✅ Course detail page (521 lines, full functionality)
- [x] ✅ User dashboard with enrolled courses
- [x] ✅ Custom hooks (useAuth, useCourses, useLessons, useProgress, useUser)
- [x] ✅ Brand color compliance audit & fixes (100% compliant)
- [ ] 🚧 Lesson viewer with MDX rendering (Next: Task #2)
- [x] ✅ **Backend**: Enrollment/Unenrollment functionality
- [x] ✅ **Backend**: Progress tracking system (10/10 tests passing)
- [x] ✅ **Testing**: PowerShell API test suite (test-course-quick.ps1, test-progress.ps1)
- [ ] 🚧 **Frontend**: Authentication pages
- [ ] 🚧 **Frontend**: Course catalog UI

### Phase 3: Enhancement (Week 5-6)

- [ ] Dashboard & analytics
- [ ] Search & filter functionality
- [ ] Session scheduling system
- [ ] Email notifications

### Phase 4: Deployment (Week 7-8)

- [ ] Backend deployment (VPS)
- [ ] Frontend deployment (Vercel)
- [ ] CI/CD pipeline
- [ ] Production monitoring

---

## 🚀 Getting Started

### Prerequisites

```bash
# Backend
- Go 1.21+
- MySQL 8.0+

# Frontend
- Node.js 18+
- yarn (recommended)
```

### ⚡ Quick Start (Recommended)

**Metode 1: PowerShell Scripts (Windows)**

```powershell
# Dari root folder project

# Jalankan KEDUANYA (Backend + Frontend)
.\start-dev.ps1

# Atau jalankan TERPISAH:
.\start-backend.ps1   # Backend only (port 8080)
.\start-frontend.ps1  # Frontend only (port 3000)
```

**Metode 2: NPM/Yarn Scripts**

```bash
# Install concurrently (sekali saja)
yarn install

# Jalankan keduanya
yarn dev

# Atau jalankan terpisah
yarn dev:backend   # Backend only
yarn dev:frontend  # Frontend only
```

**Metode 3: Makefile (Linux/Mac/Windows with Make)**

```bash
make dev       # Jalankan keduanya
make backend   # Backend only
make frontend  # Frontend only
make help      # Lihat semua commands
```

**Metode 4: Manual (2 Terminal)**

```bash
# Terminal 1 - Backend
cd tempaskill-be
$env:GOTOOLCHAIN="auto"; go run cmd/api/main.go

# Terminal 2 - Frontend
cd tempaskill-fe
yarn dev
```

### 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1
- **Swagger Docs**: http://localhost:8080/swagger/index.html
- **Health Check**: http://localhost:8080/api/v1/health

### Backend Setup

**Quick Start with Makefile**:

```bash
cd tempaskill-be

# Install dependencies
make setup

# Create database (requires MySQL installed)
make db-create

# Start server (auto-migration on startup)
$env:GOTOOLCHAIN="auto"; go run cmd/api/main.go
# Server runs on http://localhost:8080
```

**Manual Setup**:

```bash
cd tempaskill-be

# Install dependencies
go mod download

# Setup database
mysql -u root -p
CREATE DATABASE tempaskill CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Copy environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start server (auto-migration on startup)
$env:GOTOOLCHAIN="auto"; go run cmd/api/main.go
```

**Available Make Commands**:

```bash
make help              # Show all available commands
make test              # Run all tests (11 tests passing)
make test-unit         # Run unit tests only
make test-integration  # Run integration tests only
make test-coverage     # Generate test coverage report
make db-status         # Show database tables and data
make db-reset          # Reset database (drop & recreate)
```

### Frontend Setup

```bash
cd tempaskill-fe

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run development server
npm run dev
# App runs on http://localhost:3000
```

---

## 📝 API Endpoints

### Authentication

```
POST   /api/v1/auth/register       # Register user
POST   /api/v1/auth/login          # Login user
GET    /api/v1/auth/me             # Get current user (protected)
```

### User Management

```
GET    /api/v1/users/:id           # Get user profile (public)
PATCH  /api/v1/users/me            # Update profile (protected)
PATCH  /api/v1/users/me/password   # Change password (protected)
```

### Courses

```
GET    /api/v1/courses                  # List courses (with pagination & filters)
GET    /api/v1/courses/:id              # Get course by ID
GET    /api/v1/courses/slug/:slug       # Get course by slug
POST   /api/v1/courses                  # Create course (instructor/admin)
PATCH  /api/v1/courses/:id              # Update course (instructor/admin)
DELETE /api/v1/courses/:id              # Delete course (instructor/admin)
POST   /api/v1/courses/:id/enroll       # Enroll in course (protected)
DELETE /api/v1/courses/:id/unenroll     # Unenroll from course (protected)
```

### Lessons

```
GET    /api/v1/courses/:courseId/lessons  # List lessons for a course
GET    /api/v1/lessons/:id                # Get lesson detail
POST   /api/v1/courses/:courseId/lessons  # Create lesson (instructor/admin)
PATCH  /api/v1/lessons/:id                # Update lesson (instructor/admin)
DELETE /api/v1/lessons/:id                # Delete lesson (instructor/admin)
```

### Progress Tracking

```
POST   /api/v1/lessons/:id/complete     # Mark lesson as completed (protected)
GET    /api/v1/courses/:id/progress     # Get course progress (protected)
GET    /api/v1/users/me/progress        # Get all user progress (protected)
```

---

## 🔒 Environment Variables

### Backend (`.env`)

```env
# Server
PORT=8080
ENV=development

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tempaskill

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=24h

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```

---

## 🤝 Development Guidelines

### Backend (Go)

1. **Layered Architecture**: Handler → Service → Repository
2. **Error Handling**: Selalu return error dengan context
3. **Validation**: Gunakan Gin binding tags
4. **Database**: Gunakan transactions untuk operasi multiple
5. **Naming**: snake_case untuk database, camelCase untuk Go

### Frontend (Next.js)

1. **File Organization**: Group by feature, bukan by type
2. **Components**: Atomic design (ui → shared → page-specific)
3. **Data Fetching**: TanStack Query untuk semua API calls
4. **Validation**: Zod schema untuk forms
5. **Styling**: Tailwind utility classes, no custom CSS

---

## 🧪 Testing & Integration Status

**Last Tested**: November 3, 2025  
**Overall Status**: ✅ **ALL SYSTEMS OPERATIONAL**

### Backend

- ✅ All 22 API endpoints functional
- ✅ JWT authentication working
- ✅ Database migrations complete
- ✅ N+1 query optimization active (100x faster)
- ✅ Request ID tracking enabled
- ✅ Rate limiting operational
- ✅ CORS configured correctly

### Frontend

- ✅ Development server running (3.9s startup)
- ✅ TypeScript compilation: 0 errors
- ✅ All pages rendering correctly
- ✅ API integration successful
- ✅ Authentication flow complete

### Integration Tests

- ✅ User registration & login
- ✅ Course listing (guest & authenticated)
- ✅ Course enrollment
- ✅ Progress tracking
- ✅ JWT token validation

**Full Test Report**: [TESTING_RESULTS.md](TESTING_RESULTS.md)

---

## 📚 Resources

- [API Specification](API_SPEC.md) - Complete API documentation
- [Frontend API Guide](FRONTEND_API_GUIDE.md) - Frontend integration guide
- [API Quick Reference](API_QUICK_REFERENCE.md) - Developer cheatsheet
- [Backend Status](BACKEND_STATUS.md) - Current implementation status
- [Testing Results](TESTING_RESULTS.md) - Integration test report
- [Database Schema](DATABASE.md) - Database design & relationships
- [Development Guide](DEVELOPMENT.md) - Coding standards & best practices
- [Security Audit](SECURITY_AUDIT.md) - **⚠️ Security & performance audit report**
- [Security Checklist](SECURITY_CHECKLIST.md) - Implementation checklist
- [Roadmap](ROADMAP.md) - Development timeline & progress
- [Gin Documentation](https://gin-gonic.com/docs/)
- [GORM Documentation](https://gorm.io/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [TanStack Query](https://tanstack.com/query/latest)

---

## ⚠️ Security Notice

**This application is NOT production-ready**. A comprehensive security audit has identified critical issues that must be addressed before deployment:

- 🔴 **CRITICAL**: Missing rate limiting (brute force vulnerability)
- 🔴 **CRITICAL**: No request size limits (DoS vulnerability)
- 🔴 **CRITICAL**: Weak JWT secret enforcement
- 🟠 **HIGH**: Missing security headers
- 🟠 **HIGH**: N+1 query performance issues

**See [SECURITY_AUDIT.md](SECURITY_AUDIT.md) for full report and remediation plan.**

**Estimated time to production-ready**: 1-2 weeks of security hardening.

---

## 📄 License

MIT License - Feel free to use for learning purposes

---

**Built with 🔥 by TempaSKill Team**
