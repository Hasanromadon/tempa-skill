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
- [Certificate Management](#certificate-management)
- [Payment Management](#payment-management)
- [Review Management](#review-management)
- [Session Management](#session-management)
- [Admin Dashboard](#admin-dashboard)
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

### List All Users (Admin Only)

Get paginated list of all users with optional filters.

```http
GET /api/v1/users?page=1&limit=10&role=student&search=john
Authorization: Bearer <admin_token>
```

**Query Parameters:**

- `page`: Optional, page number (default: 1)
- `limit`: Optional, items per page (default: 10, max: 100)
- `role`: Optional, filter by role (`student`, `instructor`, `admin`)
- `search`: Optional, search by name or email (case-insensitive)

**Response (200 OK):**

```json
{
  "data": {
    "users": [
      {
        "id": 123,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "student",
        "bio": "Passionate learner",
        "avatar_url": "https://...",
        "created_at": "2025-11-02 10:00:00"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 10,
    "total_pages": 15
  }
}
```

**Authentication Required**: ✅ Yes (Admin only)

**Error Responses:**

- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (non-admin user)

**Use Case:**
Admin user management page at `/admin/users`

---

### Change User Role (Admin Only)

Change a user's role (student, instructor, admin).

```http
PATCH /api/v1/users/:id/role
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "role": "instructor"
}
```

**Path Parameters:**

- `id`: User ID (required)

**Request Body:**

- `role`: New role value (`student`, `instructor`, or `admin`)

**Response (200 OK):**

```json
{
  "message": "User role updated successfully"
}
```

**Authentication Required**: ✅ Yes (Admin only)

**Error Responses:**

- `400` - Invalid role value or cannot change last admin
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (non-admin user)
- `404` - User not found

**Use Case:**
Admin changing user permissions

---

### Toggle User Status (Admin Only)

Suspend or activate a user account.

```http
PATCH /api/v1/users/:id/status?suspend=true
Authorization: Bearer <admin_token>
```

**Path Parameters:**

- `id`: User ID (required)

**Query Parameters:**

- `suspend`: Boolean (`true` to suspend, `false` to activate)

**Response (200 OK):**

```json
{
  "message": "User suspended successfully"
}
```

**Authentication Required**: ✅ Yes (Admin only)

**Error Responses:**

- `400` - Invalid user ID
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (non-admin user)
- `404` - User not found

**Use Case:**
Admin suspending/activating user accounts

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

### Get Course by Slug

```http
GET /courses/slug/:slug
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

**Note**: Same response format as `GET /courses/:id`, but uses slug instead of numeric ID for SEO-friendly URLs.

---

### Get Course Lessons

```http
GET /courses/:id/lessons
Authorization: Bearer <token> (optional)

Response (200 OK):
{
  "success": true,
  "data": {
    "course_id": 1,
    "course_title": "Golang Fundamentals",
    "lessons": [
      {
        "id": 101,
        "title": "Introduction to Go",
        "slug": "introduction-to-go",
        "order": 1,
        "duration_minutes": 30,
        "is_free": true,
        "is_completed": false,
        "content_preview": "Go is a statically typed programming language..."
      },
      {
        "id": 102,
        "title": "Variables and Types",
        "slug": "variables-and-types",
        "order": 2,
        "duration_minutes": 45,
        "is_free": false,
        "is_completed": false,
        "content_preview": null
      }
    ],
    "total_lessons": 20,
    "completed_lessons": 1,
    "progress_percentage": 5
  }
}
```

**Access Rules:**

- Public users: See all lessons with preview content for free lessons
- Enrolled users: See all lessons with completion status
- `is_completed`: Only shown for authenticated enrolled users

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

### Update Course (Instructor/Admin)

```http
PATCH /courses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated: Advanced React Patterns",
  "description": "Master advanced React design patterns",
  "category": "frontend",
  "difficulty": "intermediate"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "id": 10,
    "title": "Updated: Advanced React Patterns",
    "slug": "advanced-react-patterns",
    "description": "Master advanced React design patterns",
    "category": "frontend",
    "difficulty": "intermediate",
    "updated_at": "2025-11-02T16:00:00Z"
  },
  "message": "Course updated successfully"
}
```

**Required Role**: `instructor` or `admin` (course owner)

---

### Delete Course (Instructor/Admin)

```http
DELETE /courses/:id
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Course deleted successfully"
}
```

**Required Role**: `instructor` or `admin` (course owner)

**Business Rules:**

- Cannot delete courses with enrolled students
- All associated lessons and progress data will be deleted

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

### Unenroll from Course

```http
DELETE /courses/:id/enroll
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Successfully unenrolled from course"
}
```

**Business Rules:**

- User must be enrolled in the course
- Removes all progress data for the course
- Cannot unenroll from paid courses (future feature)

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

### Update Lesson (Instructor/Admin)

```http
PATCH /lessons/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated: Variables and Types",
  "content_mdx": "# Updated Variables in Go\n\n...",
  "order": 2,
  "duration_minutes": 50,
  "is_free": true
}

Response (200 OK):
{
  "success": true,
  "data": {
    "id": 102,
    "course_id": 1,
    "title": "Updated: Variables and Types",
    "slug": "variables-and-types",
    "content_mdx": "# Updated Variables in Go\n\n...",
    "order": 2,
    "duration_minutes": 50,
    "is_free": true,
    "updated_at": "2025-11-02T15:00:00Z"
  },
  "message": "Lesson updated successfully"
}
```

**Required Role**: `instructor` or `admin` (course owner)

---

### Delete Lesson (Instructor/Admin)

```http
DELETE /lessons/:id
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "message": "Lesson deleted successfully"
}
```

**Required Role**: `instructor` or `admin` (course owner)

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
POST /progress/lessons/:id/complete
Authorization: Bearer <token>

Request Body:
{
  "course_id": 1
}

Response (200 OK):
{
  "success": true,
  "data": {
    "course_id": 1,
    "user_id": 5,
    "completed_lessons": 5,
    "total_lessons": 20,
    "percentage": 25,
    "completed_lesson_ids": [101, 102, 103, 104, 105],
    "lessons": [
      {
        "lesson_id": 101,
        "title": "Introduction to Go",
        "is_completed": true,
        "completed_at": "2025-11-02T14:30:00Z"
      }
    ],
    "started_at": "2025-11-01T09:00:00Z",
    "last_accessed": "2025-11-02T14:30:00Z"
  },
  "message": "Lesson marked as completed"
}
```

**Business Rules:**

- User must be enrolled in the course
- Cannot mark the same lesson completed twice (idempotent)
- Automatically updates course progress
- Returns updated course progress data

---

### Get Course Progress

```http
GET /progress/courses/:id
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
GET /progress/me
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

## 🏆 Certificate Management

### Check Certificate Eligibility

Check if a user is eligible for a certificate for a specific course.

```http
GET /api/v1/certificates?course_id=1
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "data": {
    "eligible": true,
    "course_title": "Pemrograman Web Modern dengan React & Next.js",
    "progress_percentage": 100,
    "certificate_id": "CERT-123-456-1698765432",
    "issued_at": "2025-11-02T10:00:00Z"
  }
}
```

**Response (200 OK) - Not Eligible:**

```json
{
  "data": {
    "eligible": false,
    "course_title": "Pemrograman Web Modern dengan React & Next.js",
    "progress_percentage": 75,
    "message": "Kursus belum selesai. Sertifikat hanya tersedia jika semua pelajaran telah diselesaikan."
  }
}
```

**Authentication Required**: ✅ Yes

### Issue Certificate

Issue a certificate for a completed course.

```http
POST /api/v1/certificates/issue
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": 1
}
```

**Response (201 Created):**

```json
{
  "message": "Sertifikat berhasil dibuat",
  "data": {
    "certificate_id": "CERT-123-456-1698765432",
    "user_name": "John Doe",
    "course_title": "Pemrograman Web Modern dengan React & Next.js",
    "issued_at": "2025-11-02",
    "download_url": "/api/v1/certificates/CERT-123-456-1698765432/download"
  }
}
```

**Error Responses:**

- `400` - Course not completed or certificate already issued
- `404` - Course not found

**Authentication Required**: ✅ Yes

### Get User Certificates

Get all certificates issued to the current user.

```http
GET /api/v1/certificates/me
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "certificate_id": "CERT-123-456-1698765432",
      "user_name": "John Doe",
      "course_title": "Pemrograman Web Modern dengan React & Next.js",
      "issued_at": "2025-11-02",
      "download_url": "/api/v1/certificates/CERT-123-456-1698765432/download"
    }
  ]
}
```

**Authentication Required**: ✅ Yes

### Download Certificate PDF

Download certificate as PDF file.

```http
GET /api/v1/certificates/:certificate_id/download
Authorization: Bearer <token>
```

**Response (200 OK):**

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename=sertifikat.pdf`
- Body: PDF file binary data

**Error Responses:**

- `404` - Certificate not found

**Authentication Required**: ✅ Yes

---

## 💳 Payment Management

### Create Payment Transaction

Create a new payment transaction for course enrollment using Midtrans payment gateway.

```http
POST /api/v1/payment/create-transaction
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": 1,
  "payment_method": "gopay"
}
```

**Request Parameters:**

- `course_id`: Required, ID of the course to purchase
- `payment_method`: Optional, payment method (`gopay`, `bank_transfer`, `credit_card`, `qris`)

**Response (201 Created):**

```json
{
  "message": "Payment transaction created successfully",
  "data": {
    "id": 1,
    "user_id": 123,
    "course_id": 1,
    "course_title": "Pemrograman Web Modern dengan React & Next.js",
    "user_name": "John Doe",
    "order_id": "ORDER-123-456-1698765432",
    "gross_amount": 499000,
    "payment_type": "gopay",
    "transaction_status": "pending",
    "transaction_time": "2025-11-02T10:00:00Z",
    "payment_url": "https://app.midtrans.com/snap/v2/vtweb/...",
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T10:00:00Z"
  }
}
```

**Error Responses:**

- `400` - Invalid course ID or course not found
- `409` - User already enrolled in course

**Authentication Required**: ✅ Yes

### Get Payment Status

Get the status of a payment transaction by order ID.

```http
GET /api/v1/payment/status/:orderId
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "user_id": 123,
    "course_id": 1,
    "course_title": "Pemrograman Web Modern dengan React & Next.js",
    "user_name": "John Doe",
    "order_id": "ORDER-123-456-1698765432",
    "gross_amount": 499000,
    "payment_type": "gopay",
    "transaction_status": "settlement",
    "transaction_time": "2025-11-02T10:00:00Z",
    "settlement_time": "2025-11-02T10:05:00Z",
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T10:05:00Z"
  }
}
```

**Transaction Status Values:**

- `pending` - Payment initiated, waiting for user action
- `settlement` - Payment successful and settled
- `expire` - Payment expired
- `cancel` - Payment cancelled
- `failure` - Payment failed

**Authentication Required**: ✅ Yes

### Get User Payment History

Get payment history for the authenticated user.

```http
GET /api/v1/payment/user?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Optional, page number (default: 1)
- `limit`: Optional, items per page (default: 10, max: 50)

**Response (200 OK):**

```json
{
  "data": {
    "payments": [
      {
        "id": 1,
        "user_id": 123,
        "course_id": 1,
        "course_title": "Pemrograman Web Modern dengan React & Next.js",
        "user_name": "John Doe",
        "order_id": "ORDER-123-456-1698765432",
        "gross_amount": 499000,
        "payment_type": "gopay",
        "transaction_status": "settlement",
        "transaction_time": "2025-11-02T10:00:00Z",
        "settlement_time": "2025-11-02T10:05:00Z",
        "created_at": "2025-11-02T10:00:00Z",
        "updated_at": "2025-11-02T10:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

**Authentication Required**: ✅ Yes

### Get All Payments (Admin Only)

Get all payment transactions (admin only).

```http
GET /api/v1/payment/admin/all?page=1&limit=10
Authorization: Bearer <admin_token>
```

**Response (200 OK):**

```json
{
  "data": {
    "payments": [
      {
        "id": 1,
        "user_id": 123,
        "course_id": 1,
        "course_title": "Pemrograman Web Modern dengan React & Next.js",
        "user_name": "John Doe",
        "order_id": "ORDER-123-456-1698765432",
        "gross_amount": 499000,
        "payment_type": "gopay",
        "transaction_status": "settlement",
        "transaction_time": "2025-11-02T10:00:00Z",
        "settlement_time": "2025-11-02T10:05:00Z",
        "created_at": "2025-11-02T10:00:00Z",
        "updated_at": "2025-11-02T10:05:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

**Authentication Required**: ✅ Yes (Admin only)

### Midtrans Webhook

Handle payment status updates from Midtrans payment gateway. This endpoint is called automatically by Midtrans when payment status changes.

```http
POST /api/v1/payment/webhook
Content-Type: application/json
```

**Request Body:** (Sent by Midtrans)

```json
{
  "transaction_type": "settlement",
  "transaction_time": "2025-11-02T10:05:00Z",
  "transaction_status": "settlement",
  "transaction_id": "12345678-1234-1234-1234-123456789012",
  "status_message": "midtrans payment notification",
  "status_code": "200",
  "signature_key": "signature-key-here",
  "settlement_time": "2025-11-02T10:05:00Z",
  "payment_type": "gopay",
  "order_id": "ORDER-123-456-1698765432",
  "merchant_id": "M001234",
  "gross_amount": "499000.00",
  "fraud_status": "accept",
  "currency": "IDR"
}
```

**Response (200 OK):**

```json
{
  "message": "Webhook processed successfully"
}
```

**Authentication Required**: ❌ No (Called by Midtrans)

---

## ⭐ Review Management

### Create Review

Create a new review for a course. Users can only review courses they have completed.

```http
POST /api/v1/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": 1,
  "rating": 5,
  "review_text": "Kursus yang sangat bagus dan lengkap!"
}
```

**Request Parameters:**

- `course_id`: Required, ID of the course being reviewed
- `rating`: Required, rating from 1-5 stars
- `review_text`: Optional, review text (max 1000 characters)

**Response (201 Created):**

```json
{
  "message": "Review created successfully",
  "data": {
    "id": 1,
    "user_id": 123,
    "course_id": 1,
    "user_name": "John Doe",
    "user_avatar": "https://...",
    "rating": 5,
    "review_text": "Kursus yang sangat bagus dan lengkap!",
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T10:00:00Z"
  }
}
```

**Error Responses:**

- `400` - Invalid rating (must be 1-5) or course not completed
- `409` - User already reviewed this course

**Authentication Required**: ✅ Yes

### Get Review by ID

Get a specific review by its ID.

```http
GET /api/v1/reviews/:id
```

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "user_id": 123,
    "course_id": 1,
    "user_name": "John Doe",
    "user_avatar": "https://...",
    "rating": 5,
    "review_text": "Kursus yang sangat bagus dan lengkap!",
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T10:00:00Z"
  }
}
```

**Authentication Required**: ❌ No (Public)

### Update Review

Update an existing review. Users can only update their own reviews.

```http
PUT /api/v1/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "review_text": "Kursus yang bagus, tapi ada beberapa bagian yang bisa diperbaiki."
}
```

**Response (200 OK):**

```json
{
  "message": "Review updated successfully",
  "data": {
    "id": 1,
    "user_id": 123,
    "course_id": 1,
    "user_name": "John Doe",
    "user_avatar": "https://...",
    "rating": 4,
    "review_text": "Kursus yang bagus, tapi ada beberapa bagian yang bisa diperbaiki.",
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T11:00:00Z"
  }
}
```

**Authentication Required**: ✅ Yes (Review owner only)

### Delete Review

Delete a review. Users can only delete their own reviews.

```http
DELETE /api/v1/reviews/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Review deleted successfully"
}
```

**Authentication Required**: ✅ Yes (Review owner only)

### Get User Reviews

Get all reviews written by the authenticated user.

```http
GET /api/v1/reviews/user?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Optional, page number (default: 1)
- `limit`: Optional, items per page (default: 10, max: 50)

**Response (200 OK):**

```json
{
  "data": {
    "reviews": [
      {
        "id": 1,
        "user_id": 123,
        "course_id": 1,
        "user_name": "John Doe",
        "user_avatar": "https://...",
        "rating": 5,
        "review_text": "Kursus yang sangat bagus!",
        "created_at": "2025-11-02T10:00:00Z",
        "updated_at": "2025-11-02T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

**Authentication Required**: ✅ Yes

### Get Course Reviews

Get all reviews for a specific course.

```http
GET /api/v1/reviews/courses/:courseId?page=1&limit=10
```

**Query Parameters:**

- `page`: Optional, page number (default: 1)
- `limit`: Optional, items per page (default: 10, max: 50)

**Response (200 OK):**

```json
{
  "data": {
    "reviews": [
      {
        "id": 1,
        "user_id": 123,
        "course_id": 1,
        "user_name": "John Doe",
        "user_avatar": "https://...",
        "rating": 5,
        "review_text": "Kursus yang sangat bagus!",
        "created_at": "2025-11-02T10:00:00Z",
        "updated_at": "2025-11-02T10:00:00Z"
      },
      {
        "id": 2,
        "user_id": 456,
        "course_id": 1,
        "user_name": "Jane Smith",
        "rating": 4,
        "review_text": "Bagus, tapi bisa lebih detail di beberapa bagian.",
        "created_at": "2025-11-01T15:30:00Z",
        "updated_at": "2025-11-01T15:30:00Z"
      }
    ],
    "summary": {
      "course_id": 1,
      "total_reviews": 2,
      "average_rating": 4.5,
      "rating_counts": {
        "4": 1,
        "5": 1
      }
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2,
      "total_pages": 1
    }
  }
}
```

**Authentication Required**: ❌ No (Public)

### Get Course Review Summary

Get aggregated review statistics for a specific course.

```http
GET /api/v1/reviews/courses/:courseId/summary
```

**Response (200 OK):**

```json
{
  "data": {
    "course_id": 1,
    "total_reviews": 25,
    "average_rating": 4.2,
    "rating_counts": {
      "1": 1,
      "2": 0,
      "3": 3,
      "4": 8,
      "5": 13
    }
  }
}
```

**Authentication Required**: ❌ No (Public)

---

## 📅 Session Management

### Create Session

Create a new live session for a course (Instructor only).

```http
POST /api/v1/sessions
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "course_id": 1,
  "title": "Q&A Session: React Hooks",
  "description": "Diskusi mendalam tentang React Hooks dan best practices",
  "scheduled_at": "2025-11-15T14:00:00Z",
  "duration_minutes": 90,
  "max_participants": 100,
  "meeting_url": "https://zoom.us/j/123456789"
}
```

**Request Parameters:**

- `course_id`: Required, ID of the course
- `title`: Required, session title (3-200 characters)
- `description`: Optional, session description (max 1000 characters)
- `scheduled_at`: Required, ISO 8601 datetime string
- `duration_minutes`: Required, duration in minutes (15-480)
- `max_participants`: Required, maximum participants (1-500)
- `meeting_url`: Optional, meeting URL (max 500 characters)

**Response (201 Created):**

```json
{
  "message": "Session created successfully",
  "data": {
    "id": 1,
    "course_id": 1,
    "course_title": "Pemrograman Web Modern dengan React & Next.js",
    "course_slug": "pemrograman-web-modern-react-nextjs",
    "instructor_id": 2,
    "instructor_name": "Dr. Ahmad Rahman",
    "title": "Q&A Session: React Hooks",
    "description": "Diskusi mendalam tentang React Hooks dan best practices",
    "scheduled_at": "2025-11-15T14:00:00Z",
    "duration_minutes": 90,
    "max_participants": 100,
    "current_participants": 0,
    "meeting_url": "https://zoom.us/j/123456789",
    "recording_url": null,
    "is_cancelled": false,
    "is_registered": false,
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T10:00:00Z"
  }
}
```

**Authentication Required**: ✅ Yes (Instructor only)

### List Sessions

Get a list of sessions with optional filters.

```http
GET /api/v1/sessions?page=1&limit=10&course_id=1&upcoming=true
Authorization: Bearer <token>
```

**Query Parameters:**

- `page`: Optional, page number (default: 1)
- `limit`: Optional, items per page (default: 10, max: 100)
- `course_id`: Optional, filter by course ID
- `upcoming`: Optional, true for future sessions, false for past sessions
- `published`: Optional, filter by published status

**Response (200 OK):**

```json
{
  "data": {
    "sessions": [
      {
        "id": 1,
        "course_id": 1,
        "course_title": "Pemrograman Web Modern dengan React & Next.js",
        "course_slug": "pemrograman-web-modern-react-nextjs",
        "instructor_id": 2,
        "instructor_name": "Dr. Ahmad Rahman",
        "title": "Q&A Session: React Hooks",
        "description": "Diskusi mendalam tentang React Hooks dan best practices",
        "scheduled_at": "2025-11-15T14:00:00Z",
        "duration_minutes": 90,
        "max_participants": 100,
        "current_participants": 23,
        "meeting_url": "https://zoom.us/j/123456789",
        "recording_url": null,
        "is_cancelled": false,
        "is_registered": true,
        "created_at": "2025-11-02T10:00:00Z",
        "updated_at": "2025-11-02T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "total_pages": 1
    }
  }
}
```

**Authentication Required**: ✅ Yes

### Get Session by ID

Get detailed information about a specific session.

```http
GET /api/v1/sessions/:id
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "data": {
    "id": 1,
    "course_id": 1,
    "course_title": "Pemrograman Web Modern dengan React & Next.js",
    "course_slug": "pemrograman-web-modern-react-nextjs",
    "instructor_id": 2,
    "instructor_name": "Dr. Ahmad Rahman",
    "title": "Q&A Session: React Hooks",
    "description": "Diskusi mendalam tentang React Hooks dan best practices",
    "scheduled_at": "2025-11-15T14:00:00Z",
    "duration_minutes": 90,
    "max_participants": 100,
    "current_participants": 23,
    "meeting_url": "https://zoom.us/j/123456789",
    "recording_url": null,
    "is_cancelled": false,
    "is_registered": true,
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T10:00:00Z"
  }
}
```

**Authentication Required**: ✅ Yes

### Update Session

Update session details (Instructor only).

```http
PUT /api/v1/sessions/:id
Authorization: Bearer <instructor_token>
Content-Type: application/json

{
  "title": "Updated: Q&A Session: React Hooks",
  "meeting_url": "https://zoom.us/j/987654321",
  "recording_url": "https://zoom.us/recording/123"
}
```

**Response (200 OK):**

```json
{
  "message": "Session updated successfully",
  "data": {
    "id": 1,
    "course_id": 1,
    "course_title": "Pemrograman Web Modern dengan React & Next.js",
    "course_slug": "pemrograman-web-modern-react-nextjs",
    "instructor_id": 2,
    "instructor_name": "Dr. Ahmad Rahman",
    "title": "Updated: Q&A Session: React Hooks",
    "description": "Diskusi mendalam tentang React Hooks dan best practices",
    "scheduled_at": "2025-11-15T14:00:00Z",
    "duration_minutes": 90,
    "max_participants": 100,
    "current_participants": 23,
    "meeting_url": "https://zoom.us/j/987654321",
    "recording_url": "https://zoom.us/recording/123",
    "is_cancelled": false,
    "is_registered": true,
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T11:00:00Z"
  }
}
```

**Authentication Required**: ✅ Yes (Instructor only)

### Delete Session

Delete a session (Instructor only).

```http
DELETE /api/v1/sessions/:id
Authorization: Bearer <instructor_token>
```

**Response (200 OK):**

```json
{
  "message": "Session deleted successfully"
}
```

**Authentication Required**: ✅ Yes (Instructor only)

### Register for Session

Register as a participant for a session.

```http
POST /api/v1/sessions/:id/register
Authorization: Bearer <token>
```

**Response (201 Created):**

```json
{
  "message": "Successfully registered for session"
}
```

**Error Responses:**

- `409` - Already registered or session is full

**Authentication Required**: ✅ Yes

### Unregister from Session

Cancel registration for a session.

```http
DELETE /api/v1/sessions/:id/register
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "message": "Successfully unregistered from session"
}
```

**Authentication Required**: ✅ Yes

### Get Session Participants

Get list of participants for a session (Instructor only).

```http
GET /api/v1/sessions/:id/participants
Authorization: Bearer <instructor_token>
```

**Response (200 OK):**

```json
{
  "data": [
    {
      "user_id": 123,
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "registered_at": "2025-11-02T10:30:00Z",
      "attended_at": null
    },
    {
      "user_id": 456,
      "user_name": "Jane Smith",
      "user_email": "jane@example.com",
      "registered_at": "2025-11-02T11:00:00Z",
      "attended_at": "2025-11-15T14:15:00Z"
    }
  ]
}
```

**Authentication Required**: ✅ Yes (Instructor only)

### Mark Attendance

Mark a participant as attended (Instructor only).

```http
POST /api/v1/sessions/:id/attendance/:participantId
Authorization: Bearer <instructor_token>
```

**Response (200 OK):**

```json
{
  "message": "Attendance marked successfully"
}
```

**Authentication Required**: ✅ Yes (Instructor only)

---

## 📊 Admin Dashboard

### Get Dashboard Statistics

Get comprehensive dashboard statistics for admin panel. Returns aggregated data from all modules.

```http
GET /api/v1/admin/stats
Authorization: Bearer <admin_token>
```

**Response (200 OK):**

```json
{
  "data": {
    "total_courses": 25,
    "published_courses": 20,
    "unpublished_courses": 5,
    "total_students": 150,
    "total_instructors": 8,
    "total_enrollments": 320,
    "total_revenue": 149700000,
    "pending_payments": 3,
    "completed_payments": 45,
    "total_lessons": 180,
    "total_sessions": 12,
    "upcoming_sessions": 5
  }
}
```

**Fields Description:**

- `total_courses`: Total number of courses (published + unpublished)
- `published_courses`: Number of published courses
- `unpublished_courses`: Number of draft/unpublished courses
- `total_students`: Count of users with role 'student'
- `total_instructors`: Count of users with role 'instructor'
- `total_enrollments`: Total course enrollments
- `total_revenue`: Sum of completed payment transactions (IDR)
- `pending_payments`: Count of pending payment transactions
- `completed_payments`: Count of successfully completed payments
- `total_lessons`: Total number of lessons across all courses
- `total_sessions`: Total live sessions created
- `upcoming_sessions`: Count of future sessions (not cancelled)

**Authentication Required**: ✅ Yes (Admin only)

**Performance:**

- Uses efficient SQL COUNT aggregations
- No need to fetch full datasets
- Response time: < 100ms typically
- Cached for 5 minutes on frontend

**Use Case:**
Display comprehensive statistics on `/admin/dashboard` page without loading all data.

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
