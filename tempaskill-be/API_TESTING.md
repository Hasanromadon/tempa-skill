# TempaSKill API Testing Guide

## 🧪 Authentication Endpoints Testing

### Base URL

```
http://localhost:8080/api/v1
```

---

## 1. Health Check (Public)

```bash
curl http://localhost:8080/api/v1/health
```

**Expected Response:**

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

---

## 2. Register User (Public)

### Register as Student

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Register as Instructor

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Jane Instructor\",\"email\":\"instructor@example.com\",\"password\":\"password123\",\"role\":\"instructor\"}"
```

**Expected Response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "bio": "",
    "avatar_url": "",
    "created_at": "2025-11-02T10:30:00Z"
  }
}
```

**Validation Errors (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Key: 'RegisterRequest.Email' Error:Field validation for 'Email' failed on the 'email' tag"
}
```

**Email Already Exists (400):**

```json
{
  "success": false,
  "message": "email already registered"
}
```

---

## 3. Login (Public)

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "bio": "",
      "avatar_url": "",
      "created_at": "2025-11-02T10:30:00Z"
    }
  }
}
```

**Invalid Credentials (401):**

```json
{
  "success": false,
  "message": "invalid email or password"
}
```

---

## 4. Get Current User (Protected)

**Copy the token from login response and use it:**

```bash
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Expected Response (200):**

```json
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "bio": "",
    "avatar_url": "",
    "created_at": "2025-11-02T10:30:00Z"
  }
}
```

**No Token (401):**

```json
{
  "success": false,
  "message": "Authorization header required"
}
```

**Invalid Token (401):**

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## 🔧 PowerShell Testing (Windows)

### Register

```powershell
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/register" -Body $body -ContentType "application/json"
```

### Login

```powershell
$body = @{
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/api/v1/auth/login" -Body $body -ContentType "application/json"
$token = $response.data.token
Write-Host "Token: $token"
```

### Get Current User

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Method Get -Uri "http://localhost:8080/api/v1/auth/me" -Headers $headers
```

---

## 📝 Testing Checklist

- [ ] Server is running on port 8080
- [ ] Health check returns success
- [ ] Can register new student
- [ ] Can register new instructor
- [ ] Cannot register duplicate email
- [ ] Validation works (invalid email, short password)
- [ ] Can login with valid credentials
- [ ] Cannot login with wrong password
- [ ] Receive JWT token after login
- [ ] Can access /auth/me with valid token
- [ ] Cannot access /auth/me without token
- [ ] Cannot access /auth/me with expired/invalid token

---

## 🐛 Common Issues

### Server Not Running

```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080

# Or change PORT in .env
PORT=8081
```

### Database Connection Error

```bash
# Verify MySQL is running
# Check .env credentials match your MySQL setup
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=tempaskill
```

### JWT Secret Error

```bash
# Ensure JWT_SECRET is set in .env
JWT_SECRET=tempaskill-dev-secret-key-please-change-in-production-2025
```

---

## 🚀 Next Steps

After authentication works:

1. Test user management endpoints (Task 3)
2. Test course CRUD operations (Task 4)
3. Test progress tracking (Task 5)
