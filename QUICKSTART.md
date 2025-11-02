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
# ✔ Would you like to use `src/` directory? → Yes
# ✔ Would you like to use App Router? → Yes
# ✔ Would you like to customize the default import alias? → Yes (@/*)
```

### 2. Install Dependencies

```powershell
cd tempaskill-fe

# Install Shadcn/ui
npx shadcn-ui@latest init

# Pilihan saat setup:
# ✔ Which style would you like to use? → Default
# ✔ Which color would you like to use as base color? → Slate
# ✔ Would you like to use CSS variables for colors? → Yes

# Install additional dependencies
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install axios
npm install velite -D

# Install Shadcn components yang sering dipakai
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add skeleton
```

### 3. Environment Variables

```powershell
# Copy .env.example ke .env.local
copy .env.example .env.local

# Edit .env.local
notepad .env.local
```

---

## 🏃 Running Development

### Terminal 1: Backend

```powershell
cd d:\non-bri\tempa-skill\tempaskill-be

# Run server
go run cmd/api/main.go

# Output:
# Server running on http://localhost:8080
# Database connected successfully
```

### Terminal 2: Frontend

```powershell
cd d:\non-bri\tempa-skill\tempaskill-fe

# Run dev server
npm run dev

# Output:
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3000
# - Network:      http://192.168.x.x:3000
```

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
```

---

## 📁 Struktur Folder Saat Ini

```
d:\non-bri\tempa-skill\
├── README.md              ← Dokumentasi utama
├── DEVELOPMENT.md         ← Panduan development detail
├── API_SPEC.md           ← Spesifikasi API lengkap
├── DATABASE.md           ← Schema database
├── QUICKSTART.md         ← File ini
├── .gitignore
│
├── tempaskill-be/        ← Backend workspace
│   └── (akan dibuat)
│
└── tempaskill-fe/        ← Frontend workspace
    └── (akan dibuat)
```

---

## 🎯 Development Roadmap

Lihat file `README.md` bagian **Development Roadmap** untuk timeline lengkap.

**Phase 1 (Week 1-2)**: Foundation

- [x] Setup dokumentasi
- [ ] Setup backend infrastructure
- [ ] Setup frontend infrastructure
- [ ] Authentication system

**Next Steps**:

1. Setup struktur folder backend
2. Konfigurasi database connection
3. Buat authentication module
4. Setup frontend dengan brand colors
5. Integrasi login/register

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

- [ ] Go terinstall
- [ ] MySQL terinstall
- [ ] Node.js terinstall
- [ ] Database `tempaskill` sudah dibuat
- [ ] Backend folder `tempaskill-be` sudah dibuat
- [ ] Frontend folder `tempaskill-fe` sudah dibuat
- [ ] Dependencies backend terinstall
- [ ] Dependencies frontend terinstall
- [ ] Environment variables dikonfigurasi
- [ ] Backend berjalan di port 8080
- [ ] Frontend berjalan di port 3000

---

**Siap Mulai Development!** 🚀

Jika ada pertanyaan, tanyakan kepada AI assistant dengan membuka file yang relevan di workspace yang sesuai.
