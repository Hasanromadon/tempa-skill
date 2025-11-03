# 🤖 AI Context & Rules - TempaSKill

> **CRITICAL**: File ini HARUS dibaca oleh AI setiap kali memulai conversation baru

---

## ⚖️ ATURAN PALING PENTING: DETEKSI KONTEKS WORKSPACE

### 🎯 Deteksi Otomatis Workspace

AI **WAJIB** mendeteksi workspace berdasarkan file/folder yang sedang dibuka/diedit:

```
┌─────────────────────────────────────────────────────────┐
│ Jika file path mengandung: "tempaskill-be"             │
│ → MODE: Backend Developer                               │
│ → STACK: Go + Gin + GORM + MySQL + JWT                  │
│ → PORT: 8080                                            │
│ → OUTPUT: JSON API, business logic, database queries    │
│ → LARANGAN: ❌ Jangan tulis React/JSX/HTML/CSS/UI       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Jika file path mengandung: "tempaskill-fe"             │
│ → MODE: Frontend Developer                              │
│ → STACK: Next.js + TypeScript + Tailwind + Shadcn/ui   │
│ → PORT: 3000                                            │
│ → OUTPUT: React components, pages, UI/UX                │
│ → LARANGAN: ❌ Jangan tulis SQL/GORM/database logic     │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Dokumentasi yang Tersedia

Selalu rujuk dokumentasi berikut sesuai kebutuhan:

| File             | Isi                                               | Kapan Dibaca             |
| ---------------- | ------------------------------------------------- | ------------------------ |
| `README.md`      | Overview proyek, tech stack, roadmap              | Pertama kali, overview   |
| `DEVELOPMENT.md` | Coding standards, best practices, struktur folder | Sebelum coding           |
| `API_SPEC.md`    | Complete API endpoints & contracts                | Saat integrasi API       |
| `DATABASE.md`    | Schema, queries, optimizations                    | Saat kerja dengan DB     |
| `QUICKSTART.md`  | Setup guide, troubleshooting                      | Setup awal               |
| `CONTEXT.md`     | File ini - rules untuk AI                         | Setiap conversation baru |

---

## 🎨 Brand Identity (WAJIB IKUTI)

### Color Palette

```typescript
// PRIMARY - Orange (Api Tempaan)
bg-orange-600 (#ea580c)     // CTA buttons, important actions
hover:bg-orange-700         // Hover state

// SECONDARY - Slate (Metal/Besi)
bg-slate-800 (#1e293b)      // Navigation, cards, structural
bg-slate-700 (#334155)      // Lighter variant
text-slate-400              // Muted text

// ACCENT - Blue (Teknologi)
bg-blue-500 (#3b82f6)       // Secondary actions, info
text-blue-600               // Links

// BACKGROUND
bg-white                    // Main background
bg-gray-50                  // Alternative background
text-gray-900               // Body text
```

### Usage Rules

```tsx
// ✅ CORRECT - Primary CTA
<Button className="bg-orange-600 hover:bg-orange-700">
  Daftar Sekarang
</Button>

// ✅ CORRECT - Card structure
<Card className="bg-white border-slate-200">
  <CardHeader className="bg-slate-50">
    {/* ... */}
  </CardHeader>
</Card>

// ❌ WRONG - Random colors
<Button className="bg-red-500">Click</Button>
<div className="bg-purple-600">Content</div>
```

---

## 🏗️ Arsitektur Lengkap

### Backend Pattern (3-Layer)

```
Handler (HTTP) ──→ Service (Business Logic) ──→ Repository (Database)
     ↑                                               ↑
     │                                               │
  Gin Router                                      GORM
```

**File Naming**:

- `{domain}_handler.go` - HTTP endpoints
- `{domain}_service.go` - Business logic
- `{domain}_repository.go` - DB operations
- `{domain}_model.go` - GORM models
- `{domain}_dto.go` - Request/Response DTOs

**Example**:

```
internal/auth/
├── auth_handler.go      // POST /register, POST /login
├── auth_service.go      // ValidateCredentials(), HashPassword()
├── auth_repository.go   // CreateUser(), FindByEmail()
├── auth_model.go        // type User struct
└── auth_dto.go          // RegisterRequest, LoginResponse
```

### Frontend Pattern (Feature-Based)

```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Route group (no URL segment)
│   ├── (dashboard)/    # Protected routes
│   └── courses/        # Public routes
├── components/
│   ├── ui/             # Shadcn (atomic)
│   ├── shared/         # Reusable (organisms)
│   └── layout/         # Layouts
├── lib/                # Utils, hooks
├── queries/            # TanStack Query
├── store/              # Zustand
└── types/              # TypeScript types
```

---

## 🔐 Authentication Flow (End-to-End)

### Backend Implementation

```go
// 1. Handler - Validate request
func (h *AuthHandler) Register(c *gin.Context) {
    var req RegisterDTO
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    user, token, err := h.authService.Register(req)
    if err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    c.JSON(201, gin.H{
        "success": true,
        "data": gin.H{
            "user": user,
            "token": token,
        },
    })
}

// 2. Service - Business logic
func (s *AuthService) Register(req RegisterDTO) (*User, string, error) {
    // Check if email exists
    if s.authRepo.EmailExists(req.Email) {
        return nil, "", errors.New("email already exists")
    }

    // Hash password
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 10)

    // Create user
    user := &User{
        Name:     req.Name,
        Email:    req.Email,
        Password: string(hashedPassword),
    }

    if err := s.authRepo.Create(user); err != nil {
        return nil, "", err
    }

    // Generate JWT
    token, _ := s.generateJWT(user)

    return user, token, nil
}

// 3. Repository - Database
func (r *AuthRepository) Create(user *User) error {
    return r.db.Create(user).Error
}
```

### Frontend Implementation

```typescript
// 1. Schema - Validation
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

type RegisterInput = z.infer<typeof registerSchema>;

// 2. Query - API call
export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterInput) => {
      const res = await api.post("/auth/register", data);
      return res.data;
    },
    onSuccess: (data) => {
      // Save token
      useAuthStore.getState().setToken(data.data.token);
      useAuthStore.getState().setUser(data.data.user);

      // Redirect
      router.push("/dashboard");
    },
  });
};

// 3. Component - UI
export function RegisterForm() {
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate: register, isPending } = useRegister();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => register(data))}>
        <FormField name="name" />
        <FormField name="email" />
        <FormField name="password" />

        <Button
          type="submit"
          disabled={isPending}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isPending ? "Loading..." : "Daftar"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 📝 Coding Checklist

### Backend (Go)

- [ ] Gunakan 3-layer pattern (handler → service → repository)
- [ ] Semua error di-handle dengan proper context
- [ ] Validasi input dengan Gin binding tags
- [ ] Response format konsisten (success, data, message)
- [ ] JWT middleware untuk protected routes
- [ ] Database transactions untuk multiple operations
- [ ] Indexes untuk query performance
- [ ] Naming: snake_case (DB), camelCase (Go)

### Frontend (React/Next.js)

- [ ] TypeScript strict mode enabled
- [ ] Zod validation untuk semua forms
- [ ] TanStack Query untuk semua API calls
- [ ] Shadcn/ui components (jangan custom styling)
- [ ] Tailwind utility classes (ZERO custom CSS)
- [ ] Brand colors (orange, slate, blue)
- [ ] Loading states & error handling
- [ ] Responsive design (mobile-first)
- [ ] Naming: kebab-case (files), PascalCase (components)

---

## 🚫 LARANGAN MUTLAK

### Backend

```go
// ❌ NEVER - Ignoring errors
user, _ := repo.FindByID(id)

// ❌ NEVER - Magic strings
if user.Role == "admin" { } // Use constants!

// ❌ NEVER - Direct password storage
user.Password = req.Password // Must hash with bcrypt!

// ❌ NEVER - Missing validation
c.BindJSON(&req) // Must check error!
```

### Frontend

```tsx
// ❌ NEVER - Inline styles
<div style={{ color: 'red' }}>Error</div>

// ❌ NEVER - Direct fetch
fetch('/api/users') // Use TanStack Query!

// ❌ NEVER - Untyped state
const [data, setData] = useState() // Must add type!

// ❌ NEVER - Custom colors
<Button className="bg-red-500"> // Use brand colors!
```

---

## 🎯 Development Workflow

### Saat Mulai Task Baru

1. ✅ Deteksi workspace (backend/frontend)
2. ✅ Baca dokumentasi relevan
3. ✅ Check existing code patterns
4. ✅ Follow architecture rules
5. ✅ Implement with proper error handling
6. ✅ Test (manual atau automated)

### Saat Membuat API Endpoint (Backend)

1. Define DTO structs
2. Create repository method (database)
3. Create service method (business logic)
4. Create handler (HTTP endpoint)
5. Register route in router
6. Test dengan Postman/Thunder Client
7. Update API_SPEC.md

### Saat Membuat Page/Component (Frontend)

1. Create Zod schema (jika ada form)
2. Create TanStack Query hook
3. Create component dengan TypeScript types
4. Use Shadcn/ui components
5. Apply brand colors
6. Test responsive design
7. Handle loading & error states

---

## 📊 API Response Standards

### Success (Backend)

```go
c.JSON(200, gin.H{
    "success": true,
    "data": result,
    "message": "Operation successful",
})
```

### Error (Backend)

```go
c.JSON(400, gin.H{
    "success": false,
    "error": gin.H{
        "code": "VALIDATION_ERROR",
        "message": "Invalid input",
        "details": validationErrors,
    },
})
```

### Consumption (Frontend)

```typescript
// TanStack Query automatically handles:
const { data, error, isLoading } = useQuery({
  queryKey: ["courses"],
  queryFn: () => api.get("/courses"),
});

if (isLoading) return <Skeleton />;
if (error) return <ErrorMessage error={error} />;

// data.data.items (karena response structure)
```

---

## 🔄 State Management

### Server State (TanStack Query)

```typescript
// ✅ USE FOR: Data dari API
const { data: courses } = useQuery({
  queryKey: ["courses"],
  queryFn: () => api.get("/courses"),
});
```

### Client State (Zustand)

```typescript
// ✅ USE FOR: UI state, auth token, preferences
const { user, token, setUser } = useAuthStore();
```

### Form State (React Hook Form)

```typescript
// ✅ USE FOR: Form inputs & validation
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});
```

---

## 📞 Quick Reference

### Saat User Tanya: "Buatkan fitur X"

1. Tanya dulu: "Fitur ini untuk backend atau frontend?"
2. Jika tidak jelas, deteksi dari context
3. Implementasi sesuai workspace rules

### Saat Stuck/Error

1. Check dokumentasi (DEVELOPMENT.md)
2. Check API spec (API_SPEC.md)
3. Check database schema (DATABASE.md)
4. Lihat contoh code yang sudah ada

### Saat Butuh Install Dependency

```bash
# Backend
cd tempaskill-be
go get -u <package>

# Frontend
cd tempaskill-fe
npm install <package>
```

---

## ✅ Pre-Flight Checklist (Sebelum Coding)

Setiap kali AI akan menulis code:

- [ ] ✅ Deteksi workspace (backend/frontend) sudah benar?
- [ ] ✅ Tech stack yang dipakai sudah sesuai workspace?
- [ ] ✅ Brand colors sudah sesuai guideline? (jika frontend)
- [ ] ✅ Architecture pattern sudah sesuai? (3-layer/feature-based)
- [ ] ✅ Error handling sudah proper?
- [ ] ✅ Type safety sudah maksimal?
- [ ] ✅ Naming convention sudah konsisten?

Jika ada 1 saja yang ❌, **STOP dan perbaiki dulu!**

---

## 🎓 Example Responses

### ✅ GOOD Response

```
Saya deteksi Anda sedang bekerja di `tempaskill-be/internal/auth/`.
Mode: Backend Developer (Go + Gin + GORM)

Saya akan membuat authentication handler dengan pattern:
1. Handler - Validate request & return response
2. Service - Business logic (hash password, generate JWT)
3. Repository - Database operations

Berikut implementasinya:
[COMPLETE CODE WITH ERROR HANDLING]
```

### ❌ BAD Response

```
Oke, saya akan buatkan authentication.
[Langsung kasih code tanpa context check]
[Atau mix frontend + backend code]
```

---

**INGAT**: AI adalah pair programmer yang HARUS mengikuti aturan workspace dan tidak pernah melanggar guidelines di atas.

---

**Last Updated**: November 3, 2025  
**Context Version**: 1.0.0
