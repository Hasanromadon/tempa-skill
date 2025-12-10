# 🎯 Cheat Sheet - TempaSKill

> Quick reference untuk development sehari-hari

---

## 🚀 Quick Commands

### Backend (tempaskill-be)

```powershell
# Run server
go run cmd/api/main.go

# Install dependency
go get -u github.com/package/name

# Update dependencies
go mod tidy

# Format code
go fmt ./...

# Run tests
go test ./...

# Build binary
go build -o tempaskill-api cmd/api/main.go

# Run binary
.\tempaskill-api.exe
```

### Frontend (tempaskill-fe)

```powershell
# Run dev server
npm run dev

# Build production
npm run build

# Start production
npm start

# Install dependency
npm install package-name

# Add Shadcn component
npx shadcn-ui@latest add button

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 🎨 Brand Colors Quick Copy

```tsx
// Primary - Orange (CTA)
className = "bg-orange-600 hover:bg-orange-700 text-white";

// Secondary - Slate (Structure)
className = "bg-slate-800 text-white";
className = "bg-slate-700 text-slate-100";
className = "border-slate-300 text-slate-700";

// Accent - Blue (Info)
className = "bg-blue-500 hover:bg-blue-600 text-white";
className = "text-blue-600";

// Backgrounds
className = "bg-white";
className = "bg-gray-50";

// Text
className = "text-gray-900";
className = "text-slate-600";
```

---

## 📝 Code Templates

### Backend: New Handler

```go
package domain

import "github.com/gin-gonic/gin"

type DomainHandler struct {
    domainService *DomainService
}

func NewDomainHandler(service *DomainService) *DomainHandler {
    return &DomainHandler{domainService: service}
}

func (h *DomainHandler) GetAll(c *gin.Context) {
    items, err := h.domainService.GetAll()
    if err != nil {
        c.JSON(500, gin.H{
            "success": false,
            "error": gin.H{
                "code": "INTERNAL_ERROR",
                "message": err.Error(),
            },
        })
        return
    }

    c.JSON(200, gin.H{
        "success": true,
        "data": items,
    })
}
```

### Backend: New Service

```go
package domain

type DomainService struct {
    domainRepo *DomainRepository
}

func NewDomainService(repo *DomainRepository) *DomainService {
    return &DomainService{domainRepo: repo}
}

func (s *DomainService) GetAll() ([]Domain, error) {
    return s.domainRepo.FindAll()
}
```

### Backend: New Repository

```go
package domain

import "gorm.io/gorm"

type DomainRepository struct {
    db *gorm.DB
}

func NewDomainRepository(db *gorm.DB) *DomainRepository {
    return &DomainRepository{db: db}
}

func (r *DomainRepository) FindAll() ([]Domain, error) {
    var items []Domain
    err := r.db.Find(&items).Error
    return items, err
}
```

### Frontend: TanStack Query Hook

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// GET request
export const useItems = () => {
  return useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const { data } = await api.get("/items");
      return data.data;
    },
  });
};

// POST request
export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: CreateItemInput) => {
      const { data } = await api.post("/items", item);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
    },
  });
};
```

### Frontend: Zod Schema

```typescript
import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  age: z.number().min(18, "Minimal 18 tahun"),
});

export type ItemInput = z.infer<typeof itemSchema>;
```

### Frontend: Form Component

```tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function ItemForm() {
  const form = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const { mutate: createItem, isPending } = useCreateItem();

  const onSubmit = (data: ItemInput) => {
    createItem(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 🔐 Auth Patterns

### Backend: Protected Route

```go
// In router setup
protected := router.Group("/api/v1")
protected.Use(middleware.AuthMiddleware())
{
    protected.GET("/users/me", userHandler.GetProfile)
    protected.PUT("/users/me", userHandler.UpdateProfile)
}
```

### Backend: Auth Middleware

```go
func AuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.JSON(401, gin.H{"error": "Unauthorized"})
            c.Abort()
            return
        }

        // Remove "Bearer " prefix
        token = strings.TrimPrefix(token, "Bearer ")

        // Validate JWT
        claims, err := ValidateJWT(token)
        if err != nil {
            c.JSON(401, gin.H{"error": "Invalid token"})
            c.Abort()
            return
        }

        // Set user ID in context
        c.Set("user_id", claims.UserID)
        c.Next()
    }
}
```

### Frontend: API Client with Auth

```typescript
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Frontend: Protected Route

```tsx
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth-token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
```

---

## 🗄️ Database Quick Reference

### Common Queries

```go
// Find all
db.Find(&users)

// Find by ID
db.First(&user, id)

// Find by condition
db.Where("email = ?", email).First(&user)

// Create
db.Create(&user)

// Update
db.Model(&user).Updates(map[string]interface{}{
    "name": "New Name",
})

// Delete
db.Delete(&user)

// Count
var count int64
db.Model(&User{}).Count(&count)

// Preload relations
db.Preload("Courses").Find(&user)

// Join
db.Joins("LEFT JOIN courses ON courses.id = enrollments.course_id").Find(&enrollments)

// Transaction
db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&user).Error; err != nil {
        return err
    }
    if err := tx.Create(&profile).Error; err != nil {
        return err
    }
    return nil
})
```

---

## 📊 API Testing

### PowerShell (Invoke-RestMethod)

```powershell
# GET
$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/courses" -Method GET

# POST
$body = @{
    name = "John"
    email = "john@example.com"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/register" -Method POST -Body $body -ContentType "application/json"

# With Auth
$headers = @{
    "Authorization" = "Bearer your-token-here"
}

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/me" -Method GET -Headers $headers
```

### cURL (if installed)

```bash
# GET
curl http://localhost:8080/api/v1/courses

# POST
curl -X POST http://localhost:8080/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

# With Auth
curl http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer your-token-here"
```

---

## 🐛 Common Errors & Fixes

### Backend

**Error: "dial tcp: connect: connection refused"**

```powershell
# MySQL not running
Start-Service MySQL80
```

**Error: "bind: address already in use"**

```powershell
# Port 8080 in use
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Error: "record not found"**

```go
// Check if error is "not found"
if errors.Is(err, gorm.ErrRecordNotFound) {
    return nil, errors.New("resource not found")
}
```

### Frontend

**Error: "Module not found"**

```powershell
# Clear cache
rm -r node_modules
rm package-lock.json
npm install
```

**Error: "Hydration failed"**

```tsx
// Use client component for dynamic content
'use client'

// Or use suppressHydrationWarning
<div suppressHydrationWarning>
  {new Date().toString()}
</div>
```

**Error: "Class name did not match"**

```powershell
# Restart dev server after tailwind changes
# Ctrl+C, then npm run dev
```

---

## 📚 Import Shortcuts

### Backend

```go
// Common imports
import (
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "github.com/golang-jwt/jwt/v5"
    "golang.org/x/crypto/bcrypt"
    "errors"
    "time"
)
```

### Frontend

```typescript
// Common imports
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { cn } from "@/app/utils/cn-classes";
```

---

## 🔍 VS Code Shortcuts

```
Ctrl + P          → Quick file open
Ctrl + Shift + P  → Command palette
Ctrl + `          → Toggle terminal
Ctrl + B          → Toggle sidebar
Ctrl + /          → Toggle comment
Alt + Up/Down     → Move line
Ctrl + D          → Select next occurrence
F2                → Rename symbol
```

---

## 📞 Quick Help

**Stuck on Backend?**
→ Read: `DEVELOPMENT.md` → Backend section
→ Check: `API_SPEC.md` for endpoint patterns
→ Look at: Existing handlers for reference

**Stuck on Frontend?**
→ Read: `DEVELOPMENT.md` → Frontend section
→ Check: Shadcn/ui docs for components
→ Look at: Existing pages for patterns

**Database Issues?**
→ Read: `DATABASE.md` for schema & queries

**Setup Issues?**
→ Read: `QUICKSTART.md` for troubleshooting

---

## ✅ Pre-Commit Checklist

- [ ] Code formatted (go fmt / prettier)
- [ ] No console.log() in frontend
- [ ] All errors handled
- [ ] Types/interfaces defined
- [ ] Brand colors used (no random colors)
- [ ] Responsive design tested
- [ ] API tested manually
- [ ] No hardcoded values (use env vars)

---

**Keep this file handy! 📌**

Print or bookmark for daily reference during development.
