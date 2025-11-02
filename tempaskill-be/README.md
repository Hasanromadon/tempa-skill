# TempaSKill Backend (tempaskill-be)

🚀 **Backend API** untuk platform kursus online TempaSKill - dibangun dengan Go, Gin, dan MySQL.

## 📋 Tech Stack

- **Language**: Go 1.24+
- **Framework**: Gin Gonic
- **Database**: MySQL 8.0+
- **ORM**: GORM
- **Authentication**: JWT (manual)
- **Password Hashing**: bcrypt

## 🏗️ Arsitektur

```
tempaskill-be/
├── cmd/api/              # Application entry point
│   └── main.go
├── config/               # Configuration management
│   └── config.go
├── internal/             # Private application code
│   ├── auth/            # Authentication (handler, service, repository)
│   ├── user/            # User management
│   ├── course/          # Course management
│   ├── lesson/          # Lesson management
│   ├── progress/        # Progress tracking
│   └── middleware/      # Custom middlewares
├── pkg/                  # Public shared packages
│   ├── database/        # Database connection
│   ├── response/        # API response helpers
│   └── validator/       # Input validation
└── migrations/           # Database migrations
```

## 🚀 Quick Start

### 1. Clone & Install Dependencies

```bash
cd tempaskill-be
go mod download
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` dan sesuaikan konfigurasi database:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tempaskill
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Create Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE tempaskill CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run Migrations

```bash
# TODO: Akan ditambahkan di Task 2
```

### 5. Run Server

```bash
go run cmd/api/main.go
```

Server akan berjalan di `http://localhost:8080`

## 🧪 Test API

```bash
# Health check
curl http://localhost:8080/api/v1/health
```

Response:

```json
{
  "success": true,
  "message": "TempaSKill API is running",
  "data": {
    "version": "1.0.0",
    "environment": "development",
    "database": "connected"
  }
}
```

## 📦 Available Scripts

```bash
# Run in development
go run cmd/api/main.go

# Build for production
go build -o bin/tempaskill cmd/api/main.go

# Run production binary
./bin/tempaskill

# Run tests
go test ./...

# Format code
go fmt ./...

# Lint code
golangci-lint run
```

## 🔧 Environment Variables

| Variable               | Description                          | Default                 |
| ---------------------- | ------------------------------------ | ----------------------- |
| `PORT`                 | Server port                          | `8080`                  |
| `APP_ENV`              | Environment (development/production) | `development`           |
| `DB_HOST`              | MySQL host                           | `localhost`             |
| `DB_PORT`              | MySQL port                           | `3306`                  |
| `DB_USER`              | MySQL username                       | `root`                  |
| `DB_PASSWORD`          | MySQL password                       | ``                      |
| `DB_NAME`              | Database name                        | `tempaskill`            |
| `JWT_SECRET`           | JWT signing key                      | **required**            |
| `JWT_EXPIRATION_HOURS` | JWT token expiration                 | `24`                    |
| `ALLOWED_ORIGINS`      | CORS allowed origins                 | `http://localhost:3000` |

## 📁 Layer Pattern

### 1. **Handler** (HTTP Layer)

- Menerima HTTP request
- Validasi input
- Memanggil service layer
- Mengembalikan HTTP response

### 2. **Service** (Business Logic Layer)

- Implementasi business logic
- Orchestrasi antar repository
- Transaction management

### 3. **Repository** (Data Layer)

- Database operations (CRUD)
- Query builder
- Data mapping

## 🔐 Authentication Flow

1. User register → Hash password → Save to DB
2. User login → Validate credentials → Generate JWT
3. Protected routes → Verify JWT → Extract user data

## 📊 Database Schema

Lihat `DATABASE.md` di root project untuk detail schema lengkap.

## 🎯 Development Roadmap

- [x] **Task 1**: Setup Backend Infrastructure ✅
- [ ] **Task 2**: Implement Authentication (Register, Login, JWT Middleware)
- [ ] **Task 3**: Implement User Management (Profile, Update)
- [ ] **Task 4**: Implement Course Management (CRUD, Enrollment)
- [ ] **Task 5**: Implement Progress Tracking

## 📚 API Endpoints

| Method  | Endpoint                | Description      | Auth |
| ------- | ----------------------- | ---------------- | ---- |
| `GET`   | `/api/v1/health`        | Health check     | ❌   |
| `POST`  | `/api/v1/auth/register` | Register user    | ❌   |
| `POST`  | `/api/v1/auth/login`    | Login user       | ❌   |
| `GET`   | `/api/v1/auth/me`       | Get current user | ✅   |
| `GET`   | `/api/v1/users/:id`     | Get user profile | ❌   |
| `PATCH` | `/api/v1/users/me`      | Update profile   | ✅   |

Lihat `API_SPEC.md` untuk dokumentasi lengkap.

## 🛠️ Troubleshooting

### Database Connection Failed

```bash
# Check MySQL service
# Windows
net start MySQL80

# Linux
sudo systemctl start mysql
```

### Port Already in Use

```bash
# Change PORT in .env
PORT=8081
```

### JWT Secret Missing

```bash
# Generate secure JWT secret
openssl rand -base64 32
```

## 📖 Documentation

- [Root README](../README.md) - Project overview
- [API Specification](../API_SPEC.md) - Complete API docs
- [Database Schema](../DATABASE.md) - Database design
- [Development Guide](../DEVELOPMENT.md) - Coding standards

## 🤝 Contributing

Lihat [CONTRIBUTING.md](../CONTRIBUTING.md) untuk guidelines.

## 📄 License

MIT License - lihat [LICENSE](../LICENSE)

---

**Status**: ✅ Infrastructure Setup Complete  
**Next**: Task 2 - Implement Authentication
