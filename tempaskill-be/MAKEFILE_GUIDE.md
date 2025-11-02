# 🛠️ Makefile Commands Reference

Quick reference untuk semua Makefile commands yang tersedia.

## 📋 Prerequisites

- **Make** (GNU Make atau compatible)
  - Windows: Install via [Chocolatey](https://chocolatey.org/): `choco install make`
  - Or use built-in `nmake` on Windows
- **Go 1.21+**
- **MySQL 8.0+**

## 🚀 Quick Start

```bash
# Install dependencies
make setup

# Create database and start server
make start

# Or run individually:
make db-create
make run
```

## 📚 Available Commands

### SETUP Commands

| Command      | Description                                      |
| ------------ | ------------------------------------------------ |
| `make help`  | Show all available commands                      |
| `make setup` | Install Go dependencies (go mod download & tidy) |
| `make start` | Create database + start server (one-step setup)  |

### DATABASE Commands

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `make db-create` | Create `tempaskill` database         |
| `make db-drop`   | ⚠️ Drop database (deletes all data!) |
| `make db-reset`  | Drop and recreate database           |
| `make db-status` | Show tables and users data           |

### DEVELOPMENT Commands

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `make run`         | Run server in development mode              |
| `make dev`         | Alias for `make run`                        |
| `make build`       | Build Windows binary (`bin/tempaskill.exe`) |
| `make build-linux` | Build Linux binary for deployment           |
| `make test`        | Run all Go tests                            |
| `make test-auth`   | Test authentication endpoints (PowerShell)  |
| `make format`      | Format code with `gofmt`                    |

### UTILITY Commands

| Command           | Description                                  |
| ----------------- | -------------------------------------------- |
| `make clean`      | Clean build artifacts (bin/, coverage files) |
| `make git-status` | Show git status                              |

## 💡 Usage Examples

### First Time Setup

```bash
# 1. Clone repository
cd tempaskill-be

# 2. Install dependencies
make setup

# 3. Create database and run
make start
```

### Daily Development Workflow

```bash
# Start server
make run

# In another terminal: test endpoints
make test-auth

# Check database
make db-status

# Format code before commit
make format
```

### Build for Production

```bash
# Build Windows binary
make build

# Build Linux binary for VPS
make build-linux

# Clean old builds first
make clean
make build-linux
```

### Database Management

```bash
# Create fresh database
make db-create

# Check what's in database
make db-status

# Reset database (clean slate)
make db-reset
```

### Testing

```bash
# Run Go tests
make test

# Test authentication API
# (requires server running in another terminal)
make test-auth
```

## 🔧 Configuration

Makefile menggunakan variables yang bisa dikustomisasi:

```makefile
BINARY_NAME=tempaskill          # Output binary name
DB_NAME=tempaskill              # Database name
MYSQL_BIN=C:/tools/mysql/...    # MySQL executable path
MAIN_PATH=./cmd/api/main.go     # Main entry point
```

### Custom MySQL Path

Jika MySQL Anda di lokasi berbeda, edit `Makefile`:

```makefile
# Windows
MYSQL_BIN=C:/xampp/mysql/bin/mysql.exe

# Or add to PATH
MYSQL_BIN=mysql
```

## 🎯 Common Workflows

### 1. Fresh Start (New Developer)

```bash
make setup      # Install deps
make start      # Create DB + run
```

### 2. Reset Everything

```bash
make clean      # Clean builds
make db-reset   # Reset database
make run        # Start fresh
```

### 3. Pre-Commit Checklist

```bash
make format     # Format code
make test       # Run tests
make build      # Ensure builds
git add .
git commit -m "..."
```

### 4. Production Build

```bash
make clean
make build-linux
# Binary ready in bin/tempaskill
```

## 📝 Adding Custom Commands

Edit `Makefile` dan tambahkan target baru:

```makefile
.PHONY: my-command
my-command: ## Description of my command
	@echo Running my custom command...
	@go run my-script.go
```

Then run: `make my-command`

## ⚡ Pro Tips

1. **Tab Completion**: Type `make` + TAB untuk autocomplete commands
2. **Chain Commands**: `make clean build test`
3. **Background Server**: `make run &` (Linux) atau `start make run` (Windows)
4. **Check Help Anytime**: `make help` or just `make`

## 🐛 Troubleshooting

### "make: command not found"

**Windows:**

```powershell
# Install via Chocolatey
choco install make

# Or use nmake (built-in)
# Rename Makefile to Makefile.mak and use:
nmake /f Makefile.mak help
```

### MySQL Path Error

Update `MYSQL_BIN` in Makefile to your MySQL installation:

```bash
# Find MySQL location
where mysql
# Or
Get-Command mysql
```

### Port Already in Use

```bash
# Kill process on port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

## 📖 Related Documentation

- [README.md](README.md) - Project overview
- [API_TESTING.md](API_TESTING.md) - Manual API testing
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Development guidelines

---

**Quick Reference:**

```bash
make help        # Show all commands
make start       # Quick start
make db-status   # Check database
make test-auth   # Test API
```
