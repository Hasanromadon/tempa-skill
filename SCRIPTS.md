# 🚀 TempaSKill - Development Scripts

Script untuk mempermudah development workflow.

---

## 📁 File Scripts

### PowerShell Scripts (Windows)

1. **`start-backend.ps1`** - Jalankan backend saja
2. **`start-frontend.ps1`** - Jalankan frontend saja  
3. **`start-dev.ps1`** - Jalankan keduanya bersamaan

### NPM Scripts (Cross-platform)

File: `package.json` di root folder

```json
{
  "scripts": {
    "dev": "concurrently ...",           // Keduanya
    "dev:backend": "cd tempaskill-be...", // Backend only
    "dev:frontend": "cd tempaskill-fe..." // Frontend only
  }
}
```

### Makefile (Linux/Mac/Windows dengan Make)

File: `Makefile` di root folder

---

## 🎯 Cara Menggunakan

### Opsi 1: PowerShell Scripts (Recommended untuk Windows)

```powershell
# Dari root folder project (d:\non-bri\tempa-skill)

# Jalankan KEDUANYA
.\start-dev.ps1

# Atau jalankan TERPISAH di 2 terminal:
.\start-backend.ps1   # Terminal 1 - Backend only (port 8080)
.\start-frontend.ps1  # Terminal 2 - Frontend only (port 3000)
```

**Keuntungan:**
- ✅ Tidak perlu install dependencies tambahan
- ✅ Mudah dibaca dan dimodifikasi
- ✅ Native Windows PowerShell
- ✅ Auto-check folder & dependencies

---

### Opsi 2: NPM/Yarn Scripts

**Setup (Sekali Saja):**

```bash
# Install concurrently
cd d:\non-bri\tempa-skill
npm install
# atau
yarn install
```

**Jalankan:**

```bash
# Keduanya sekaligus
npm run dev
# atau
yarn dev

# Backend only
npm run dev:backend
yarn dev:backend

# Frontend only
npm run dev:frontend
yarn dev:frontend
```

**Keuntungan:**
- ✅ Cross-platform (Windows/Linux/Mac)
- ✅ Familiar bagi developer Node.js
- ✅ Bisa dipanggil dari package.json lain

---

### Opsi 3: Makefile

**Prerequisite:**
- Install Make (Windows: `choco install make` atau Git Bash)

**Jalankan:**

```bash
make dev       # Keduanya sekaligus
make backend   # Backend only
make frontend  # Frontend only
make help      # Lihat semua commands
```

**Keuntungan:**
- ✅ Standard untuk development workflow
- ✅ Familiar bagi developer C/Go
- ✅ Powerful untuk automation

---

### Opsi 4: Manual (2 Terminal)

**Terminal 1 - Backend:**

```powershell
cd tempaskill-be
$env:GOTOOLCHAIN="auto"; go run cmd/api/main.go
```

**Terminal 2 - Frontend:**

```powershell
cd tempaskill-fe
yarn dev
```

---

## 🌐 URL Akses

Setelah menjalankan scripts:

| Service          | URL                                              |
| ---------------- | ------------------------------------------------ |
| **Frontend**     | http://localhost:3000                            |
| **Backend API**  | http://localhost:8080/api/v1                     |
| **Swagger Docs** | http://localhost:8080/swagger/index.html         |
| **Health Check** | http://localhost:8080/api/v1/health              |

---

## 🔧 Troubleshooting

### Script PowerShell tidak bisa dijalankan

**Error:**
```
.\start-dev.ps1 : File cannot be loaded because running scripts is disabled
```

**Solusi:**
```powershell
# Set execution policy (sekali saja)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Atau jalankan dengan bypass:
powershell -ExecutionPolicy Bypass -File .\start-dev.ps1
```

---

### Port 8080 atau 3000 sudah digunakan

**Backend (8080):**
```powershell
# Cek proses yang pakai port 8080
netstat -ano | findstr :8080

# Kill proses (ganti PID dengan yang muncul)
taskkill /PID <PID> /F
```

**Frontend (3000):**
```powershell
# Cek proses yang pakai port 3000
netstat -ano | findstr :3000

# Kill proses
taskkill /PID <PID> /F
```

---

### Concurrently tidak terinstall (NPM Scripts)

**Error:**
```
'concurrently' is not recognized...
```

**Solusi:**
```bash
# Install dari root folder
cd d:\non-bri\tempa-skill
npm install
# atau
yarn install
```

---

### Database connection error (Backend)

**Error:**
```
Error connecting to database...
```

**Solusi:**

1. Pastikan MySQL running:
```powershell
# Start MySQL service
net start MySQL80
```

2. Cek database exists:
```sql
mysql -u root -p
SHOW DATABASES;
-- Harus ada 'tempaskill'
```

3. Cek `.env` file di `tempaskill-be/`:
```env
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tempaskill
```

---

## 📝 Modifikasi Scripts

### Mengubah Port

**Backend (default 8080):**

Edit `tempaskill-be/cmd/api/main.go`:
```go
r.Run(":8080") // Ganti ke port lain
```

**Frontend (default 3000):**

Next.js otomatis pakai port 3000. Untuk ganti:
```bash
# Jalankan dengan port custom
cd tempaskill-fe
PORT=3001 yarn dev
```

---

### Menambahkan Script Baru

**PowerShell:**
```powershell
# Buat file baru: start-test.ps1
Write-Host "Running tests..." -ForegroundColor Green
cd tempaskill-be
go test ./...
```

**NPM Script:**

Edit `package.json` di root:
```json
{
  "scripts": {
    "test": "cd tempaskill-be && go test ./..."
  }
}
```

**Makefile:**

Edit `Makefile`:
```makefile
test:
	@echo "Running tests..."
	cd tempaskill-be && go test ./...
```

---

## 🎉 Rekomendasi

**Untuk Development Harian:**
- ✅ **Windows**: Gunakan `.\start-dev.ps1` (paling mudah)
- ✅ **Linux/Mac**: Gunakan `make dev` atau `npm run dev`
- ✅ **CI/CD**: Gunakan Makefile untuk konsistensi

**Untuk Debugging:**
- Gunakan 2 terminal manual supaya bisa lihat log terpisah
- Backend: `.\start-backend.ps1`
- Frontend: `.\start-frontend.ps1`

---

## 📚 Referensi

- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [Concurrently NPM](https://www.npmjs.com/package/concurrently)
- [Make Documentation](https://www.gnu.org/software/make/manual/)
- [Next.js CLI](https://nextjs.org/docs/api-reference/cli)
- [Go Command](https://pkg.go.dev/cmd/go)
