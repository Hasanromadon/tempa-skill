# 📖 Development Guide - TempaSKill

> Panduan lengkap untuk development consistency & best practices

---

## �🇩 BAHASA INDONESIA WAJIB (MANDATORY)

### ⚠️ CRITICAL RESTRICTION - TIDAK BOLEH DILANGGAR

**Semua text yang terlihat oleh user HARUS dalam Bahasa Indonesia!**

Ini BUKAN preferensi, ini adalah **REQUIREMENT WAJIB** untuk platform TempaSKill yang menargetkan pengguna Indonesia.

### ✅ DO (Contoh Benar)

```tsx
// Form Labels
<Label>Email</Label>              // OK - universal term
<Label>Kata Sandi</Label>         // ✅ Correct

// Buttons
<Button>Masuk</Button>
<Button>Daftar</Button>
<Button>Mulai Belajar</Button>
<Button disabled={isLoading}>
  {isLoading ? "Sedang memuat..." : "Simpan"}
</Button>

// Error Messages
setError("Email wajib diisi")
setError("Kata sandi minimal 6 karakter")
toast.error("Login gagal. Silakan coba lagi.")

// Success Messages
toast.success("Pendaftaran berhasil!")
toast.success("Profil berhasil diperbarui")

// Descriptions
<CardDescription>
  Masuk ke akun TempaSKill Anda untuk melanjutkan belajar
</CardDescription>

// Headings
<CardTitle>Selamat Datang Kembali</CardTitle>
<h1>Jelajahi Kursus</h1>
```

### ❌ DON'T (Contoh Salah)

```tsx
// ❌ English text - TIDAK BOLEH!
<Button>Sign In</Button>
<Label>Password</Label>
setError("Email is required")
<h1>Welcome Back</h1>
<CardDescription>Join TempaSKill to start learning</CardDescription>

// ❌ Mixed language - TIDAK KONSISTEN!
<Button>Login</Button>  // Gunakan "Masuk" atau "Daftar"
<Label>Password</Label> // Gunakan "Kata Sandi"
```

### 📚 Translation Quick Reference

| English            | Indonesian             | Context             |
| ------------------ | ---------------------- | ------------------- |
| Sign In / Login    | Masuk                  | Button, link        |
| Sign Up / Register | Daftar                 | Button, link        |
| Create Account     | Buat Akun              | Title, button       |
| Password           | Kata Sandi             | Label, placeholder  |
| Confirm Password   | Konfirmasi Kata Sandi  | Label               |
| Welcome Back       | Selamat Datang Kembali | Title, greeting     |
| Browse Courses     | Jelajahi Kursus        | Link, CTA           |
| Enroll             | Daftar / Ikuti         | Button for courses  |
| Continue Learning  | Lanjutkan Belajar      | Button, link        |
| Start Learning     | Mulai Belajar          | Button, CTA         |
| Get Started        | Mulai                  | CTA button          |
| Mark as Complete   | Tandai Selesai         | Button              |
| Dashboard          | Dasbor                 | Navigation          |
| Profile            | Profil                 | Navigation          |
| Settings           | Pengaturan             | Navigation          |
| Search             | Cari                   | Placeholder, button |
| Filter             | Filter                 | Button, label       |
| Category           | Kategori               | Label               |
| Difficulty         | Tingkat Kesulitan      | Label               |
| Price              | Harga                  | Label               |
| Free               | Gratis                 | Tag, label          |
| Lessons            | Pelajaran              | Counter, label      |
| Students           | Siswa                  | Counter, label      |
| Enrolled           | Terdaftar              | Status              |
| Progress           | Kemajuan               | Label               |
| Learn More         | Pelajari Lebih Lanjut  | Link                |
| Back               | Kembali                | Button              |
| Next               | Selanjutnya            | Button              |
| Previous           | Sebelumnya             | Button              |
| Cancel             | Batal                  | Button              |
| Submit             | Kirim                  | Button              |
| Save               | Simpan                 | Button              |
| Edit               | Ubah / Edit            | Button              |
| Delete             | Hapus                  | Button              |
| Update             | Perbarui               | Button              |
| Create             | Buat                   | Button              |
| Add                | Tambah                 | Button              |
| Remove             | Hapus                  | Button              |
| Loading...         | Sedang memuat...       | Loading state       |
| Please wait...     | Mohon tunggu...        | Loading state       |
| Try again          | Coba lagi              | Error action        |
| Error              | Kesalahan              | Error title         |
| Success            | Berhasil               | Success title       |
| Warning            | Peringatan             | Warning title       |

### Common Error Messages

```tsx
// ❌ English
"Email is required" → "Email wajib diisi"
"Password is required" → "Kata sandi wajib diisi"
"Invalid email format" → "Format email tidak valid"
"Passwords do not match" → "Kata sandi tidak cocok"
"Login failed. Please try again." → "Login gagal. Silakan coba lagi."
"Registration failed" → "Pendaftaran gagal"
"Something went wrong" → "Terjadi kesalahan"

// ✅ Indonesian
setError("Email wajib diisi")
setError("Kata sandi wajib diisi")
setError("Format email tidak valid")
setError("Kata sandi tidak cocok")
toast.error("Login gagal. Silakan coba lagi.")
```

### Enforcement

- **Pre-commit**: Check untuk English text di komponen UI
- **Code Review**: Reject PR yang mengandung English labels/messages
- **Testing**: Verify semua text user-facing dalam Bahasa Indonesia
- **Exception**: Hanya code comments, variable names, dan technical terms yang boleh English

---

## �🎯 Aturan Konteks Utama

### ⚖️ Deteksi Workspace Otomatis

**CRITICAL**: Selalu deteksi workspace aktif sebelum coding!

#### Jika bekerja di `tempaskill-be/`:

```
✅ Role: Senior Backend Developer
✅ Stack: Go + Gin + GORM + MySQL + JWT
✅ Port: 8080
✅ Output: JSON API endpoints
❌ TIDAK menulis: React, HTML, CSS, UI components
```

#### Jika bekerja di `tempaskill-fe/`:

```
✅ Role: Senior Frontend Developer
✅ Stack: Next.js + TypeScript + Tailwind + Shadcn/ui + MDX
✅ Port: 3000
✅ Output: UI components, pages, user interactions
❌ TIDAK menulis: Database queries, business logic API
```

---

## 🗂️ Struktur Folder Detail

### Backend (`tempaskill-be`)

```
tempaskill-be/
├── cmd/
│   └── api/
│       └── main.go                 # Entry point, server initialization
│
├── internal/                       # Private application code
│   ├── auth/
│   │   ├── auth_handler.go         # HTTP handlers (endpoints)
│   │   ├── auth_service.go         # Business logic
│   │   ├── auth_repository.go      # Database operations
│   │   └── auth_dto.go             # Request/Response DTOs
│   │
│   ├── user/
│   │   ├── user_handler.go
│   │   ├── user_service.go
│   │   ├── user_repository.go
│   │   └── user_model.go           # GORM model
│   │
│   ├── course/
│   │   ├── course_handler.go
│   │   ├── course_service.go
│   │   ├── course_repository.go
│   │   └── course_model.go
│   │
│   ├── lesson/
│   │   └── ...
│   │
│   ├── progress/
│   │   └── ...
│   │
│   └── middleware/
│       ├── auth.go                 # JWT validation middleware
│       └── cors.go                 # CORS middleware
│
├── pkg/                            # Public reusable packages
│   ├── database/
│   │   └── mysql.go                # DB connection & migration
│   ├── response/
│   │   └── response.go             # Standardized API response
│   └── validator/
│       └── validator.go            # Custom validators
│
├── config/
│   └── config.go                   # Environment configuration
│
├── migrations/                     # SQL migrations (optional)
│   ├── 001_create_users.sql
│   └── 002_create_courses.sql
│
├── .env.example
├── .gitignore
├── go.mod
├── go.sum
└── Makefile                        # Build & deployment scripts
```

#### Backend Layering Pattern

```go
// Handler Layer (HTTP)
func (h *AuthHandler) Register(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    user, err := h.authService.Register(req)
    // ... handle response
}

// Service Layer (Business Logic)
func (s *AuthService) Register(req RegisterRequest) (*User, error) {
    // Validate business rules
    // Hash password
    // Call repository
    return s.authRepo.Create(user)
}

// Repository Layer (Database)
func (r *AuthRepository) Create(user *User) error {
    return r.db.Create(user).Error
}
```

---

### Frontend (`tempaskill-fe`)

```
tempaskill-fe/
├── src/
│   ├── app/
│   │   ├── (auth)/                 # Route group (tidak muncul di URL)
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # ✅ Implemented
│   │   │   └── register/
│   │   │       └── page.tsx        # ✅ Implemented
│   │   │
│   │   ├── courses/
│   │   │   ├── page.tsx            # ✅ Course catalog with search
│   │   │   └── [slug]/
│   │   │       ├── page.tsx        # ✅ Course detail (521 lines)
│   │   │       └── lessons/
│   │   │           └── [id]/
│   │   │               └── page.tsx # 🚧 Lesson viewer (Next)
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx            # ✅ User dashboard
│   │   │
│   │   ├── layout.tsx              # ✅ Root layout with providers
│   │   ├── page.tsx                # ✅ Landing page (brand colors)
│   │   └── globals.css             # ✅ Global styles
│   │
│   ├── components/
│   │   ├── ui/                     # ✅ Shadcn components (8 installed)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── progress.tsx
│   │   │   └── skeleton.tsx
│   │   │
│   │   └── providers.tsx           # ✅ TanStack Query provider
│   │
│   ├── hooks/                      # ✅ Custom React Query hooks
│   │   ├── index.ts
│   │   ├── use-auth.ts             # Login, register, logout, etc.
│   │   ├── use-courses.ts          # Courses, enroll, unenroll
│   │   ├── use-lessons.ts          # Lessons, get lesson
│   │   ├── use-progress.ts         # Mark complete, get progress
│   │   └── use-user.ts             # Get user, update profile
│   │
│   ├── lib/
│   │   ├── api-client.ts           # ✅ Axios instance with interceptors
│   │   └── utils.ts                # ✅ cn(), formatPrice(), etc.
│   │   └── use-user.ts             # Get user, update profile
│   │
│   ├── lib/
│   │   ├── api-client.ts           # ✅ Axios instance with interceptors
│   │   └── utils.ts                # ✅ cn(), formatPrice(), etc.
│   │
│   └── types/                      # ✅ TypeScript type definitions
│       └── index.ts
│
├── public/                         # Static assets
│   └── (empty for now)
│
├── .env.local                      # ✅ Environment variables
├── .gitignore
├── next.config.ts
├── tailwind.config.ts              # ✅ Brand colors configured
├── tsconfig.json
├── package.json                    # ✅ Dependencies installed
└── components.json                 # ✅ Shadcn config
```

**Note**: Struktur ini berbeda dari dokumentasi awal karena:

- No `queries/` folder - hooks langsung di `hooks/` dengan React Query
- No `store/` folder - Auth state managed via React Query + localStorage
- No `schemas/` folder - Validation inline dengan Zod di components
- No `content/` folder yet - MDX akan ditambahkan di Task #2

---

## 🎨 Design System

### Tailwind Configuration (✅ Implemented)

```typescript
// tailwind.config.ts (Actual implementation)
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          primary: "#ea580c", // orange-600
          secondary: "#1e293b", // slate-800
          accent: "#3b82f6", // blue-500
        },

        // Semantic Colors
        success: "#10b981", // green-500
        warning: "#f59e0b", // amber-500
        error: "#ef4444", // red-500
        info: "#3b82f6", // blue-500
      },

      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Component Pattern (Shadcn)

```tsx
// Example: Button component dengan brand styling
import { Button } from '@/components/ui/button'

// Primary CTA (Orange)
<Button className="bg-brand-primary hover:bg-orange-700">
  Daftar Sekarang
</Button>

// Secondary action (Slate)
<Button variant="outline" className="border-slate-300">
  Lihat Detail
</Button>

// Accent action (Blue)
<Button className="bg-brand-accent hover:bg-blue-600">
  Mulai Belajar
</Button>
```

---

## 🔐 Authentication Flow

### Backend (JWT)

```go
// Register Flow
POST /api/v1/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Login Flow
POST /api/v1/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}

// Protected Endpoint
GET /api/v1/users/me
Headers: {
  "Authorization": "Bearer <token>"
}
```

### Frontend (TanStack Query + Zustand)

```typescript
// queries/auth.queries.ts
import { useMutation, useQuery } from "@tanstack/react-query";

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await api.post("/auth/login", credentials);
      return res.data;
    },
    onSuccess: (data) => {
      // Save token to store
      useAuthStore.getState().setToken(data.token);
      useAuthStore.getState().setUser(data.user);
    },
  });
};

// store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "auth-storage" }
  )
);
```

---

## 📝 Coding Standards

### Backend (Go)

#### ✅ DO

```go
// Good: Clear error handling
func (s *CourseService) GetByID(id uint) (*Course, error) {
    course, err := s.courseRepo.FindByID(id)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.New("course not found")
        }
        return nil, fmt.Errorf("failed to get course: %w", err)
    }
    return course, nil
}

// Good: Proper struct tags
type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:100;not null" json:"name"`
    Email     string    `gorm:"uniqueIndex;not null" json:"email"`
    Password  string    `gorm:"not null" json:"-"` // Exclude from JSON
    CreatedAt time.Time `json:"created_at"`
}
```

#### ❌ DON'T

```go
// Bad: Ignoring errors
user, _ := s.userRepo.FindByID(id)

// Bad: Magic strings
if user.Role == "admin" { } // Use constants instead

// Bad: No validation
func (h *Handler) Create(c *gin.Context) {
    var req Request
    c.BindJSON(&req) // No error check!
}
```

### Frontend (TypeScript/React)

#### ✅ DO

```tsx
// Good: Type-safe component with proper validation
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type LoginInput = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: login, isPending } = useLogin();

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>{/* Form fields */}</form>
    </Form>
  );
}

// Good: Server state with TanStack Query
export function CourseList() {
  const {
    data: courses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.get("/courses"),
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{/* Render courses */}</div>;
}
```

#### ❌ DON'T

```tsx
// Bad: No type safety
function LoginForm() {
  const [email, setEmail] = useState('') // No type
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    fetch('/api/login', { // Direct fetch, no error handling
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }
}

// Bad: Inline styles (use Tailwind)
<div style={{ color: 'orange' }}>Text</div>

// Bad: Hardcoded values
<Button className="bg-orange-600"> // Use bg-brand-primary
```

---

## 🧪 Testing Guidelines

### Backend Tests

TempaSKill uses **testify** for assertions and mocking. We follow a comprehensive testing approach:

#### Test Types

1. **Unit Tests** - Service layer with mocked repositories
2. **Integration Tests** - Handler layer with mock services
3. **Table-Driven Tests** - Multiple test scenarios in one function

#### Example: Unit Test (Service Layer)

```go
// internal/user/service_test.go
import (
    "context"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

// Mock repository
type MockRepository struct {
    mock.Mock
}

func (m *MockRepository) FindByID(ctx context.Context, id uint) (*User, error) {
    args := m.Called(ctx, id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*User), args.Error(1)
}

// Table-driven test
func TestService_GetUserByID(t *testing.T) {
    tests := []struct {
        name        string
        userID      uint
        mockReturn  *User
        mockError   error
        expectError error
    }{
        {
            name:   "Success - User Found",
            userID: 1,
            mockReturn: &User{Name: "John", Email: "john@test.com"},
            mockError: nil,
            expectError: nil,
        },
        {
            name:        "Error - User Not Found",
            userID:      999,
            mockReturn:  nil,
            mockError:   errors.New("not found"),
            expectError: ErrUserNotFound,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            mockRepo := new(MockRepository)
            mockRepo.On("FindByID", mock.Anything, tt.userID).Return(tt.mockReturn, tt.mockError)

            service := NewService(mockRepo)
            user, err := service.GetUserByID(context.Background(), tt.userID)

            if tt.expectError != nil {
                assert.Error(t, err)
                assert.Equal(t, tt.expectError, err)
            } else {
                assert.NoError(t, err)
                assert.NotNil(t, user)
            }

            mockRepo.AssertExpectations(t)
        })
    }
}
```

#### Example: Integration Test (Handler Layer)

```go
// internal/user/handler_test.go
import (
    "net/http"
    "net/http/httptest"
    "testing"
    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
)

func TestHandler_GetUserByID_Success(t *testing.T) {
    gin.SetMode(gin.TestMode)

    mockService := new(MockService)
    handler := NewHandler(mockService)

    testUser := &User{ID: 1, Name: "Test User"}
    mockService.On("GetUserByID", mock.Anything, uint(1)).Return(testUser, nil)

    router := gin.New()
    router.GET("/users/:id", handler.GetUserByID)

    w := httptest.NewRecorder()
    req, _ := http.NewRequest("GET", "/users/1", nil)
    router.ServeHTTP(w, req)

    assert.Equal(t, http.StatusOK, w.Code)
    mockService.AssertExpectations(t)
}
```

#### Running Tests

```bash
# Run all tests
make test

# Run unit tests only
make test-unit

# Run integration tests only
make test-integration

# Generate coverage report
make test-coverage
```

**Current Test Coverage**: 11 tests passing (7 unit + 4 integration)

### Frontend Tests

```typescript
// Use Vitest + React Testing Library
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("LoginForm", () => {
  it("should show validation error for invalid email", async () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await userEvent.type(emailInput, "invalid-email");

    expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument();
  });
});
```

---

## 🚀 Deployment Checklist

### Backend (VPS)

- [ ] Build Go binary: `go build -o tempaskill-api cmd/api/main.go`
- [ ] Setup systemd service
- [ ] Configure Nginx reverse proxy (port 8080 → 80/443)
- [ ] SSL certificate (Let's Encrypt)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Health check endpoint working

### Frontend (Vercel)

- [ ] Push to GitHub repository
- [ ] Connect Vercel to repo
- [ ] Set environment variables (`NEXT_PUBLIC_API_URL`)
- [ ] Custom domain configured
- [ ] Production build successful
- [ ] API connectivity verified

---

## 📞 Troubleshooting

### Common Issues

#### Backend

```bash
# CORS error
# Fix: Update ALLOWED_ORIGINS in .env

# Database connection failed
# Check: MySQL running, credentials correct

# JWT invalid
# Check: JWT_SECRET matches, token not expired
```

#### Frontend

```bash
# API calls failing
# Check: NEXT_PUBLIC_API_URL correct, backend running

# Shadcn component not found
# Run: npx shadcn-ui@latest add <component-name>

# Tailwind classes not working
# Check: Class name in content config, restart dev server
```

---

## 📚 Quick Reference

### Useful Commands

**Backend:**

```bash
# Run server
go run cmd/api/main.go

# Run tests
go test ./...

# Format code
go fmt ./...

# Update dependencies
go mod tidy
```

**Frontend:**

```bash
# Run dev server
npm run dev

# Build production
npm run build

# Add Shadcn component
npx shadcn-ui@latest add button

# Type check
npm run type-check
```

---

**Last Updated**: November 3, 2025  
**Maintained by**: TempaSKill Development Team
