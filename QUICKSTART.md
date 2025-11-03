# Quick Start Guide - TempaSKill

> Panduan cepat untuk memulai development

---

## 🚀 Setup Awal (Hanya Sekali)

### 1. Prerequisites

Pastikan sudah terinstall:

```bash
# Backend
- Go 1.21+ → https://go.dev/dl/
- MySQL 8.0+ → https://dev.mysql.com/downloads/

# Frontend
- Node.js 18+ → https://nodejs.org/
- npm (otomatis terinstall dengan Node.js)
```

Verifikasi instalasi:

```powershell
go version      # go version go1.21.x
node --version  # v18.x.x atau lebih
npm --version   # 9.x.x atau lebih
mysql --version # mysql Ver 8.0.x
```

---

## ⚙️ Setup Backend (tempaskill-be)

### 1. Buat Database

```powershell
# Masuk ke MySQL
mysql -u root -p

# Buat database
CREATE DATABASE tempaskill;

# Buat user (optional, untuk keamanan)
CREATE USER 'tempaskill_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON tempaskill.* TO 'tempaskill_user'@'localhost';
FLUSH PRIVILEGES;

# Keluar
exit;
```

### 2. Setup Project Backend

```powershell
cd d:\non-bri\tempa-skill

# Buat folder backend
mkdir tempaskill-be
cd tempaskill-be

# Initialize Go module
go mod init github.com/yourusername/tempaskill-be

# Install dependencies (akan dilakukan saat setup)
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm
go get -u gorm.io/driver/mysql
go get -u github.com/golang-jwt/jwt/v5
go get -u golang.org/x/crypto/bcrypt
go get -u github.com/joho/godotenv
```

### 3. Environment Variables

```powershell
# Copy .env.example ke .env (akan dibuat nanti)
copy .env.example .env

# Edit .env dengan editor
notepad .env
```

---

## 🎨 Setup Frontend (tempaskill-fe)

### 1. Create Next.js Project

```powershell
cd d:\non-bri\tempa-skill

# Create Next.js app dengan TypeScript
npx create-next-app@latest tempaskill-fe --typescript --tailwind --app --src-dir --import-alias "@/*"

# Pilihan saat setup:
# ✔ Would you like to use TypeScript? → Yes
# ✔ Would you like to use ESLint? → Yes
# ✔ Would you like to use Tailwind CSS? → Yes
# ✔ Would you like your code inside a `src/` directory? → Yes
# ✔ Would you like to use App Router? → Yes
# ✔ Would you like to use Turbopack for `next dev`? → Yes
# ✔ Would you like to customize the import alias (@/* by default)? → No
```

### 2. Install Dependencies

```powershell
cd tempaskill-fe

# Install Shadcn/ui
npx shadcn@latest init

# Pilihan saat setup:
# ✔ Which style would you like to use? → New York
# ✔ Which color would you like to use as base color? → Neutral
# ✔ Would you like to use CSS variables for colors? → Yes

# Install core dependencies
npm install @tanstack/react-query @tanstack/react-query-devtools
npm install axios
npm install react-hook-form @hookform/resolvers zod
npm install zustand

# Install Shadcn components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add badge
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add skeleton
```

### 3. Environment Variables

```powershell
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1" > .env.local
```

### 4. Brand Colors Setup

Update `tailwind.config.ts` dengan brand colors TempaSKill:

```typescript
// tailwind.config.ts
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
        // Brand colors TempaSKill
        brand: {
          primary: "#ea580c", // orange-600
          secondary: "#1e293b", // slate-800
          accent: "#3b82f6", // blue-500
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 🏃 Running Development

### ⚡ Quick Start (Pilih Salah Satu)

**Opsi 1: PowerShell Scripts (Recommended - Windows)**

```powershell
# Dari root folder (d:\non-bri\tempa-skill)

# Jalankan KEDUANYA (Backend + Frontend sekaligus)
.\start-dev.ps1

# Atau jalankan terpisah di 2 terminal:
.\start-backend.ps1   # Terminal 1 - Backend only
.\start-frontend.ps1  # Terminal 2 - Frontend only
```

**Opsi 2: NPM/Yarn Scripts**

```bash
# Dari root folder
# (Install concurrently terlebih dahulu dengan: yarn install)

yarn dev              # Keduanya sekaligus
yarn dev:backend      # Backend only
yarn dev:frontend     # Frontend only
```

**Opsi 3: Makefile (Jika punya Make installed)**

```bash
# Dari root folder

make dev       # Keduanya sekaligus
make backend   # Backend only
make frontend  # Frontend only
make help      # Lihat semua commands
```

**Opsi 4: Manual (Cara Lama)**

Terminal 1 - Backend:

```powershell
cd tempaskill-be
$env:GOTOOLCHAIN="auto"; go run cmd/api/main.go
```

Terminal 2 - Frontend:

```powershell
cd tempaskill-fe
yarn dev
```

### 🌐 Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1
- **Swagger Docs**: http://localhost:8080/swagger/index.html
- **Health Check**: http://localhost:8080/api/v1/health

# Output:

# ▲ Next.js 14.x.x

# - Local: http://localhost:3000

# - Network: http://192.168.x.x:3000

````

### Akses Aplikasi

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080/api/v1

---

## 📋 Development Workflow

### Saat Mulai Kerja

1. Buka VS Code di folder `d:\non-bri\tempa-skill`
2. Buka 2 terminal:
   - Terminal 1: `cd tempaskill-be` → `go run cmd/api/main.go`
   - Terminal 2: `cd tempaskill-fe` → `npm run dev`
3. Mulai coding! 🔥

### Deteksi Workspace

**PENTING**: AI akan otomatis mendeteksi workspace berdasarkan file/folder yang Anda buka:

- Jika file di `tempaskill-be/` → Backend mode (Go/Gin/GORM)
- Jika file di `tempaskill-fe/` → Frontend mode (Next.js/React)

### Testing API

Gunakan salah satu tools:

- **Thunder Client** (VS Code extension)
- **Postman**
- **cURL**

Contoh test registration:

```powershell
# Using PowerShell (Invoke-RestMethod)
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method POST -Body $body -ContentType "application/json"
````

---

## 📁 Struktur Folder Saat Ini

```
d:\non-bri\tempa-skill\
├── 📄 README.md              ← Dokumentasi utama
├── 📄 DEVELOPMENT.md         ← Panduan development detail
├── 📄 API_SPEC.md           ← Spesifikasi API lengkap
├── 📄 DATABASE.md           ← Schema database
├── 📄 QUICKSTART.md         ← File ini
├── 📄 CONTEXT.md            ← Aturan untuk AI
├── 📄 DOCS.md               ← Index dokumentasi
├── 📄 ROADMAP.md            ← Development timeline
├── 📄 STRUCTURE.md          ← Folder structure
├── 📄 CHEATSHEET.md         ← Quick reference
├── 📄 UI_AUDIT_REPORT.md    ← UI compliance audit
├── 📄 BRAND_FIXES_SUMMARY.md ← Brand color fixes
├── 📄 .gitignore
│
├── 📁 tempaskill-be/        ← Backend workspace (✅ 100% Complete)
│   ├── cmd/api/
│   ├── internal/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── course/
│   │   ├── lesson/
│   │   ├── progress/
│   │   └── middleware/
│   ├── pkg/
│   ├── config/
│   ├── .env
│   ├── go.mod
│   └── Makefile
│
└── 📁 tempaskill-fe/        ← Frontend workspace (🚧 45% Complete)
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── login/page.tsx
    │   │   │   └── register/page.tsx
    │   │   ├── courses/
    │   │   │   ├── page.tsx         # Course listing
    │   │   │   └── [slug]/page.tsx  # Course detail (521 lines)
    │   │   ├── dashboard/page.tsx   # User dashboard
    │   │   ├── layout.tsx           # Root layout
    │   │   ├── page.tsx             # Landing page
    │   │   └── globals.css
    │   ├── components/
    │   │   ├── ui/                  # Shadcn components (8 installed)
    │   │   └── providers.tsx        # TanStack Query provider
    │   ├── hooks/                   # Custom React Query hooks
    │   │   ├── use-auth.ts
    │   │   ├── use-courses.ts
    │   │   ├── use-lessons.ts
    │   │   ├── use-progress.ts
    │   │   └── use-user.ts
    │   ├── lib/
    │   │   ├── api-client.ts        # Axios instance
    │   │   └── utils.ts             # cn() and formatters
    │   └── types/                   # TypeScript types
    ├── .env.local
    ├── package.json
    ├── tailwind.config.ts
    ├── tsconfig.json
    └── components.json
```

---

## 🎯 Development Roadmap

Lihat file `ROADMAP.md` untuk timeline lengkap.

**Phase 1 (Week 1-2)**: ✅ COMPLETED

- [x] Setup dokumentasi lengkap
- [x] Setup backend infrastructure
- [x] Setup frontend infrastructure
- [x] Authentication system (backend + frontend)
- [x] Brand identity implementation

**Phase 2 (Week 3-4)**: 🚧 85% COMPLETED

- [x] Backend API complete (22 endpoints)
- [x] Frontend core pages (landing, courses, detail, dashboard)
- [x] Brand compliance audit & fixes (100% compliant)
- [ ] Lesson viewer with MDX (Next: Task #2)

**Next Steps**:

1. ✅ ~~Setup struktur folder backend~~
2. ✅ ~~Konfigurasi database connection~~
3. ✅ ~~Buat authentication module~~
4. ✅ ~~Setup frontend dengan brand colors~~
5. ✅ ~~Integrasi login/register~~
6. ✅ ~~Implementasi course listing & detail~~
7. 🎯 **NEXT**: Lesson viewer with MDX rendering

---

## 🆘 Troubleshooting

### Backend tidak bisa connect ke database

```powershell
# Check MySQL service
Get-Service -Name MySQL*

# Jika stopped, start service
Start-Service MySQL80
```

### Port already in use

```powershell
# Check what's using port 8080
netstat -ano | findstr :8080

# Kill process by PID
taskkill /PID <PID> /F
```

### Frontend error "Module not found"

```powershell
# Clear cache dan reinstall
rm -r node_modules
rm package-lock.json
npm install
```

---

## 📚 Next: Baca Dokumentasi

Setelah setup selesai, baca dokumentasi berikut sesuai kebutuhan:

1. **DEVELOPMENT.md** → Coding standards & best practices
2. **API_SPEC.md** → Complete API documentation
3. **DATABASE.md** → Database schema & queries

---

## ✅ Checklist Setup

- [x] Go terinstall (v1.23+)
- [x] MySQL terinstall (v8.0+)
- [x] Node.js terinstall (v18+)
- [x] Database `tempaskill` sudah dibuat
- [x] Backend folder `tempaskill-be` sudah dibuat
- [x] Frontend folder `tempaskill-fe` sudah dibuat
- [x] Dependencies backend terinstall
- [x] Dependencies frontend terinstall (TanStack Query, Axios, Shadcn, etc.)
- [x] Environment variables dikonfigurasi
- [x] Backend berjalan di port 8080 (22 API endpoints)
- [x] Frontend berjalan di port 3000 (Next.js 16 + Turbopack)
- [x] Brand colors implemented (orange #ea580c)
- [x] 8 Shadcn components installed
- [x] All pages functional (landing, login, register, courses, detail, dashboard)

---

**Siap Mulai Development!** 🚀

Jika ada pertanyaan, tanyakan kepada AI assistant dengan membuka file yang relevan di workspace yang sesuai.
