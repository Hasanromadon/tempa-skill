# 🔥 TempaSKill - Hybrid Course Platform

> Platform kursus online berbasis teks dengan sesi live interaktif berkala

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?logo=next.js)](https://nextjs.org/)
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

#### Frontend (🚧 40% Complete)

- ✅ **Authentication Pages** - Login, Register with form validation
- ✅ **Landing Page** - Hero section, features showcase
- ✅ **Course Listing** - Search, pagination, guest/authenticated views
- ✅ **User Dashboard** - Enrolled courses, progress tracking
- ✅ **React Query Hooks** - Complete API integration layer
- ✅ **UI Components** - Shadcn UI (9 components installed)
- 🚧 **Course Detail Page** - Coming soon
- 🚧 **Lesson Viewer** - MDX rendering planned
- 🚧 **Profile Management** - Settings page pending

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
    │   │   ├── (dashboard)/ # Protected dashboard
    │   │   ├── courses/    # Course catalog & detail
    │   │   └── page.tsx    # Landing page
    │   ├── components/
    │   │   ├── ui/         # Shadcn components
    │   │   ├── shared/     # Reusable components
    │   │   └── layout/     # Layout components
    │   ├── lib/
    │   │   ├── hooks/      # Custom hooks
    │   │   ├── utils.ts    # Utility functions
    │   │   └── api.ts      # API client setup
    │   ├── queries/        # TanStack Query hooks
    │   ├── store/          # Zustand stores
    │   └── types/          # TypeScript types
    ├── content/            # MDX course content
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

| Layer         | Technology                | Purpose                    |
| ------------- | ------------------------- | -------------------------- |
| Framework     | **Next.js 14+**           | React with App Router      |
| Language      | **TypeScript**            | Type safety                |
| Styling       | **Tailwind CSS**          | Utility-first CSS          |
| UI Library    | **Shadcn/ui**             | Accessible components      |
| Content       | **MDX + Velite**          | Markdown course content    |
| Forms         | **React Hook Form + Zod** | Form handling & validation |
| Data Fetching | **TanStack Query v5**     | Server state management    |
| State         | **Zustand**               | Client state management    |
| Deployment    | **Vercel**                | Edge deployment            |

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

- [x] ✅ Setup Monorepo structure
- [x] ✅ **Backend**: Initialize Go project + database
- [x] ✅ **Backend**: Authentication system (JWT + middleware)
- [x] ✅ **Backend**: User Management (profile CRUD + password change)
- [x] ✅ **Testing**: Comprehensive test suite (11 unit + integration tests)
- [ ] 🚧 **Frontend**: Initialize Next.js project + UI components

### Phase 2: Core Features (Week 3-4) - ✅ BACKEND COMPLETED

- [x] ✅ **Backend**: Course CRUD & enrollment system (10/10 API tests passing)
- [x] ✅ **Backend**: Lesson management with MDX content storage
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
- npm/pnpm/yarn
```

### Quick Start (Both Services)

1. **Start Backend** (Terminal 1):

```bash
cd tempaskill-be
$env:GOTOOLCHAIN="auto"; go run cmd/api/main.go
# Server runs on http://localhost:8080
```

2. **Start Frontend** (Terminal 2):

```bash
cd tempaskill-fe
npm run dev
# Server runs on http://localhost:3000
```

3. **Access the Application**:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/v1
- Health Check: http://localhost:8080/api/v1/health

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

**Last Tested**: November 2, 2025  
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
