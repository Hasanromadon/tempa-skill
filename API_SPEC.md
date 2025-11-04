# 🎯 API Specification - TempaSKill Backend

> Complete API documentation for tempaskill-be

**Base URL**: `http://localhost:8080/api/v1`  
**Production**: `https://api.tempaskill.com/api/v1`

---

## 📋 Table of Contents

- [Response Format](#response-format)
- [Authentication](#authentication)
- [User Management](#user-management)
- [Course Management](#course-management)
- [Lesson Management](#lesson-management)
- [Progress Tracking](#progress-tracking)
- [Error Codes](#error-codes)

---

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required"
    }
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "total_pages": 10
    }
  }
}
```

---

## 🔐 Authentication

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-11-02T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Validation Rules:**

- `name`: Required, min 2 characters, max 100
- `email`: Required, valid email format, unique
- `password`: Required, min 8 characters

---

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid credentials
- `404 Not Found`: User not found

---

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "created_at": "2025-11-02T10:00:00Z"
  }
}
```

**Authentication Required**: ✅ Yes

---

## 👤 User Management

### Get User by ID (Public)

```http
GET /users/:id

Response (200 OK):
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "bio": "Passionate learner",
    "avatar_url": "https://...",
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T10:00:00Z"
  },
  "message": "User retrieved successfully"
}
```

**Authentication Required**: ❌ No (Public endpoint)

**Error Responses:**

- `400` - Invalid user ID format
- `404` - User not found

---

### Update User Profile

```http
PATCH /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "Learning every day",
  "avatar_url": "https://example.com/avatar.jpg"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Updated",
    "email": "john@example.com",
    "role": "student",
    "bio": "Learning every day",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T11:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

**Authentication Required**: ✅ Yes

**Validation Rules:**

- `name`: Optional, min 2 chars, max 100 chars
- `bio`: Optional, max 500 chars
- `avatar_url`: Optional, must be valid URL, max 255 chars

**Notes:**

- All fields are optional (partial update supported)
- Only the authenticated user can update their own profile

---

### Upload Image (Firebase Storage)

**Admin/Instructor Only** - Upload images to Firebase Storage for course thumbnails and MDX content.

```http
POST /upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

FormData:
  file: <binary image data>
  folder: "courses" | "lessons" | "avatars"

Response (200 OK):
{
  "success": true,
  "data": {
    "url": "https://firebasestorage.googleapis.com/v0/b/tempaskill.appspot.com/o/courses%2Fuuid-filename.jpg?alt=media&token=xxx",
    "path": "courses/uuid-filename.jpg"
  },
  "message": "Image uploaded successfully"
}
```

**Validation Rules:**

- `file`: Required, must be image (jpg, jpeg, png, webp, gif)
- `folder`: Required, must be one of: "courses", "lessons", "avatars"
- Max file size: 5 MB
- Filename sanitized and prefixed with UUID

**Authorization:**

- User must be authenticated
- Admin/Instructor role recommended

**Use Cases:**

- Course thumbnail upload
- Inline images in MDX editor
- User avatar upload (future)

---

### Change Password

```http
PATCH /users/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword456!"
}

Response (200 OK):
{
  "success": true,
  "data": null,
  "message": "Password changed successfully"
}
```

**Authentication Required**: ✅ Yes

**Validation Rules:**

- `current_password`: Required
- `new_password`: Required, min 6 chars, max 100 chars

**Error Responses:**

- `400` - Current password is incorrect
- `400` - Validation error (password too short)
- `401` - Unauthorized (invalid/missing token)
- `404` - User not found

---

## 📚 Course Management

### List All Courses

```http
GET /courses?page=1&limit=10&search=golang&category=programming

Response (200 OK):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "Golang Fundamentals",
        "slug": "golang-fundamentals",
        "description": "Learn Go from scratch",
        "thumbnail_url": "https://...",
        "category": "programming",
        "difficulty": "beginner",
        "instructor": {
          "id": 2,
          "name": "Jane Teacher"
        },
        "stats": {
          "enrolled_count": 150,
          "lesson_count": 20,
          "duration_minutes": 600
        },
        "is_enrolled": false,
        "created_at": "2025-10-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
```

**Query Parameters:**

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 50)
- `search`: Search by title or description
- `category`: Filter by category
- `difficulty`: Filter by difficulty (beginner, intermediate, advanced)

---

### Get Course Detail

```http
GET /courses/:id
Authorization: Bearer <token> (optional)

Response (200 OK):
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Golang Fundamentals",
    "slug": "golang-fundamentals",
    "description": "Complete guide to learning Go programming",
    "long_description": "In this course, you will...",
    "thumbnail_url": "https://...",
    "category": "programming",
    "difficulty": "beginner",
    "instructor": {
      "id": 2,
      "name": "Jane Teacher",
      "bio": "Senior Go Developer",
      "avatar_url": "https://..."
    },
    "stats": {
      "enrolled_count": 150,
      "lesson_count": 20,
      "duration_minutes": 600
    },
    "lessons": [
      {
        "id": 101,
        "title": "Introduction to Go",
        "slug": "introduction-to-go",
        "order": 1,
        "duration_minutes": 30,
        "is_free": true,
        "is_completed": false
      }
    ],
    "is_enrolled": false,
    "progress_percentage": 0,
    "created_at": "2025-10-01T00:00:00Z"
  }
}
```

---

### Create Course (Instructor/Admin)

```http
POST /courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Advanced React Patterns",
  "slug": "advanced-react-patterns",
  "description": "Master React design patterns",
  "long_description": "Deep dive into...",
  "thumbnail_url": "https://...",
  "category": "frontend",
  "difficulty": "advanced"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": 10,
    "title": "Advanced React Patterns",
    "slug": "advanced-react-patterns",
    // ... other fields
  },
  "message": "Course created successfully"
}
```

**Required Role**: `instructor` or `admin`

---

### Enroll in Course

```http
POST /courses/:id/enroll
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "enrollment_id": 123,
    "course_id": 1,
    "user_id": 5,
    "enrolled_at": "2025-11-02T12:00:00Z"
  },
  "message": "Successfully enrolled in course"
}
```

**Business Rules:**

- User cannot enroll in the same course twice
- Free courses: Instant enrollment
- Paid courses: Requires payment (future feature)

---

## 📖 Lesson Management

### Get Lesson Detail

```http
GET /lessons/:id
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "id": 101,
    "course_id": 1,
    "title": "Introduction to Go",
    "slug": "introduction-to-go",
    "content_mdx": "# Introduction\n\nGo is a statically typed...",
    "order": 1,
    "duration_minutes": 30,
    "is_free": true,
    "is_completed": false,
    "next_lesson": {
      "id": 102,
      "title": "Variables and Types",
      "slug": "variables-and-types"
    },
    "prev_lesson": null
  }
}
```

**Access Rules:**

- Free lessons (`is_free: true`): Accessible to everyone
- Premium lessons: Requires course enrollment

---

### Create Lesson (Instructor/Admin)

```http
POST /courses/:courseId/lessons
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Variables and Types",
  "slug": "variables-and-types",
  "content_mdx": "# Variables in Go\n\n...",
  "order": 2,
  "duration_minutes": 45,
  "is_free": false
}

Response (201 Created):
{
  "success": true,
  "data": {
    "id": 102,
    "course_id": 1,
    "title": "Variables and Types",
    // ... other fields
  },
  "message": "Lesson created successfully"
}
```

---

### Reorder Lessons

**Admin/Instructor Only** - Batch update lesson order for drag-drop interface.

```http
PATCH /lessons/reorder
Authorization: Bearer <token>
Content-Type: application/json

{
  "updates": [
    {
      "lesson_id": 101,
      "order_index": 0
    },
    {
      "lesson_id": 102,
      "order_index": 1
    },
    {
      "lesson_id": 103,
      "order_index": 2
    }
  ]
}

Response (200 OK):
{
  "success": true,
  "message": "Lessons reordered successfully"
}
```

**Validation Rules:**

- `updates`: Required, min 1 item
- `lesson_id`: Required, must be > 0
- `order_index`: Required, must be >= 0

**Authorization:**

- User must own the course (via first lesson in updates)
- Transaction-based: All updates succeed or all fail

**Use Case:** Admin drag-drops lessons in UI, frontend sends batch update

---

## 📊 Progress Tracking

### Mark Lesson as Completed

```http
POST /lessons/:id/complete
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "lesson_id": 101,
    "user_id": 5,
    "completed_at": "2025-11-02T14:30:00Z",
    "course_progress": {
      "completed_lessons": 5,
      "total_lessons": 20,
      "percentage": 25
    }
  },
  "message": "Lesson marked as completed"
}
```

**Business Rules:**

- User must be enrolled in the course
- Cannot mark the same lesson completed twice (idempotent)
- Automatically updates course progress

---

### Get Course Progress

```http
GET /courses/:id/progress
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "course_id": 1,
    "user_id": 5,
    "completed_lessons": 8,
    "total_lessons": 20,
    "percentage": 40,
    "lessons": [
      {
        "id": 101,
        "title": "Introduction to Go",
        "is_completed": true,
        "completed_at": "2025-11-01T10:00:00Z"
      },
      {
        "id": 102,
        "title": "Variables and Types",
        "is_completed": false,
        "completed_at": null
      }
    ],
    "started_at": "2025-11-01T09:00:00Z",
    "last_accessed": "2025-11-02T14:30:00Z"
  }
}
```

---

### Get All User Progress

```http
GET /users/me/progress
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": {
    "total_enrolled": 5,
    "total_completed": 2,
    "total_in_progress": 3,
    "courses": [
      {
        "course_id": 1,
        "title": "Golang Fundamentals",
        "thumbnail_url": "https://...",
        "progress_percentage": 40,
        "completed_lessons": 8,
        "total_lessons": 20,
        "last_accessed": "2025-11-02T14:30:00Z",
        "status": "in_progress"
      },
      {
        "course_id": 2,
        "title": "Next.js Mastery",
        "progress_percentage": 100,
        "completed_lessons": 15,
        "total_lessons": 15,
        "last_accessed": "2025-10-25T10:00:00Z",
        "status": "completed",
        "completed_at": "2025-10-25T10:00:00Z"
      }
    ]
  }
}
```

---

## ⚠️ Error Codes

| Code               | HTTP Status | Description                                 |
| ------------------ | ----------- | ------------------------------------------- |
| `VALIDATION_ERROR` | 400         | Invalid input data                          |
| `UNAUTHORIZED`     | 401         | Missing or invalid token                    |
| `FORBIDDEN`        | 403         | Insufficient permissions                    |
| `NOT_FOUND`        | 404         | Resource not found                          |
| `CONFLICT`         | 409         | Duplicate resource (e.g., already enrolled) |
| `INTERNAL_ERROR`   | 500         | Server error                                |

### Example Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Email already exists",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

---

## 🔒 Authentication

All protected endpoints require JWT token in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration**: 24 hours (configurable)

**Token Payload**:

```json
{
  "user_id": 1,
  "email": "john@example.com",
  "role": "student",
  "exp": 1730649600
}
```

---

## 📝 Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **Read endpoints (GET)**: 100 requests per minute
- **Write endpoints (POST/PUT/DELETE)**: 30 requests per minute

Response headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1730649600
```

---

## 🚀 Versioning

Current version: **v1**

All endpoints are prefixed with `/api/v1`

Future versions will be available at `/api/v2`, etc.

---

**Last Updated**: November 3, 2025  
**API Version**: 1.0.0
