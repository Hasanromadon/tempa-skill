# TempaSKill Backend (tempaskill-be)

🚀 **Backend API** untuk platform kursus online TempaSKill - dibangun dengan Go, Gin, dan MySQL.

## 📋 Tech Stack

- **Language**: Go 1.23+
- **Framework**: Gin Gonic
- **Database**: MySQL 8.0+
- **ORM**: GORM
- **Authentication**: JWT (manual)
- **Password Hashing**: bcrypt
- **Testing**: testify, PowerShell API tests

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

### Option 1: Using Makefile (Recommended)

```bash
# Install dependencies
make setup

# Create database and start server
make start
```

See [MAKEFILE_GUIDE.md](MAKEFILE_GUIDE.md) for all available commands.

### Option 2: Manual Setup

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

### Quick Test Suites

Run the comprehensive API test suites:

```bash
# From project root
cd ..

# Test course management (10/10 tests)
.\test-course-quick.ps1

# Test progress tracking (10/10 tests)
.\test-progress.ps1
```

**Test Coverage**: 20/20 tests passing ✅

**Course Management** (10/10):

- Health check
- List courses with pagination
- Unauthorized access prevention
- User registration & authentication
- Course creation
- Course retrieval (by ID and slug)
- Course update
- Enrollment/Unenrollment
- Lesson creation

**Progress Tracking** (10/10):

- Setup course with lessons
- Student enrollment
- Mark lessons as complete
- Progress percentage calculation
- Idempotent completion
- Course completion (100%)
- User progress summary
- Enrollment validation
- Authentication requirements

### Manual API Testing

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

## 🔒 Security Features

### Phase 1: Critical Security (✅ Implemented)

All critical security vulnerabilities have been addressed and tested:

#### 1. Rate Limiting

- **Auth Endpoints**: 5 attempts per 15 minutes per IP
- **API Endpoints**: 100 requests per minute
- **Headers**: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- **Implementation**: `internal/middleware/ratelimit.go`

#### 2. Request Size Limits

- **Max Size**: 10MB per request
- **Protection**: Prevents DoS attacks via large payloads
- **Response**: 413 Request Entity Too Large for oversized requests

#### 3. JWT Secret Validation

- **Minimum Length**: 32 characters enforced
- **Current Secret**: 64 characters (strong)
- **Generation**: `openssl rand -base64 64` or PowerShell equivalent

#### 4. Security Headers

All responses include protective headers:

- `X-Content-Type-Options: nosniff` - Prevents MIME sniffing
- `X-Frame-Options: DENY` - Prevents clickjacking
- `X-XSS-Protection: 1; mode=block` - XSS protection
- `Strict-Transport-Security` - Forces HTTPS (production)
- `Content-Security-Policy` - Restricts resource loading
- `Referrer-Policy: strict-origin-when-cross-origin` - Privacy protection
- `Cache-Control: no-store, no-cache` - Prevents sensitive data caching

#### 5. HTTPS/TLS Support

- **Production**: Automatic TLS with cert.pem/key.pem
- **Development**: HTTP for local testing
- **Environment Detection**: Based on APP_ENV variable

### Security Testing

Run automated security tests:

```bash
# From project root
.\test-security-phase1.ps1
```

**Test Coverage**: 5/5 tests passing ✅

- Security headers validation
- Rate limiting enforcement
- JWT secret strength
- Request size limits

### Generating Strong JWT Secret

**Windows PowerShell**:

```powershell
# Generate 64-character random string
-join ((48..57) + (65..90) + (97..122) + (33..47) + (58..64) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

**Linux/Mac**:

```bash
# Generate base64 encoded secret
openssl rand -base64 64
```

Update your `.env` file:

```env
JWT_SECRET=your-generated-secret-here
```

**⚠️ IMPORTANT**: Never commit `.env` files to version control!

## 📊 Database Schema

Lihat `DATABASE.md` di root project untuk detail schema lengkap.

## 🎯 Development Roadmap

- [x] **Task 1**: Setup Backend Infrastructure ✅
- [x] **Task 2**: Implement Authentication (Register, Login, JWT Middleware) ✅
- [x] **Task 3**: Implement User Management (Profile, Update) ✅
- [x] **Task 4**: Implement Course Management (CRUD, Enrollment, Lessons) ✅
- [x] **Task 5**: Implement Progress Tracking ✅

## 📚 API Endpoints

### Authentication & Users

| Method  | Endpoint                    | Description      | Auth |
| ------- | --------------------------- | ---------------- | ---- |
| `GET`   | `/api/v1/health`            | Health check     | ❌   |
| `POST`  | `/api/v1/auth/register`     | Register user    | ❌   |
| `POST`  | `/api/v1/auth/login`        | Login user       | ❌   |
| `GET`   | `/api/v1/auth/me`           | Get current user | ✅   |
| `GET`   | `/api/v1/users/:id`         | Get user profile | ❌   |
| `PATCH` | `/api/v1/users/me`          | Update profile   | ✅   |
| `PATCH` | `/api/v1/users/me/password` | Change password  | ✅   |

### Courses

| Method   | Endpoint                       | Description          | Auth |
| -------- | ------------------------------ | -------------------- | ---- |
| `GET`    | `/api/v1/courses`              | List courses         | ❌   |
| `GET`    | `/api/v1/courses/:id`          | Get course by ID     | ❌   |
| `GET`    | `/api/v1/courses/slug/:slug`   | Get course by slug   | ❌   |
| `POST`   | `/api/v1/courses`              | Create course        | ✅   |
| `PATCH`  | `/api/v1/courses/:id`          | Update course        | ✅   |
| `DELETE` | `/api/v1/courses/:id`          | Delete course        | ✅   |
| `POST`   | `/api/v1/courses/:id/enroll`   | Enroll in course     | ✅   |
| `DELETE` | `/api/v1/courses/:id/unenroll` | Unenroll from course | ✅   |

### Lessons

| Method   | Endpoint                            | Description       | Auth |
| -------- | ----------------------------------- | ----------------- | ---- |
| `GET`    | `/api/v1/courses/:courseId/lessons` | List lessons      | ❌   |
| `GET`    | `/api/v1/lessons/:id`               | Get lesson detail | ❌   |
| `POST`   | `/api/v1/courses/:courseId/lessons` | Create lesson     | ✅   |
| `PATCH`  | `/api/v1/lessons/:id`               | Update lesson     | ✅   |
| `DELETE` | `/api/v1/lessons/:id`               | Delete lesson     | ✅   |

### Progress Tracking

| Method | Endpoint                       | Description          | Auth |
| ------ | ------------------------------ | -------------------- | ---- |
| `POST` | `/api/v1/lessons/:id/complete` | Mark lesson complete | ✅   |
| `GET`  | `/api/v1/courses/:id/progress` | Get course progress  | ✅   |
| `GET`  | `/api/v1/users/me/progress`    | Get user progress    | ✅   |

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

**Status**: ✅ Backend Core Complete (20/20 API tests passing)  
**Phase**: Backend development complete, ready for frontend integration
