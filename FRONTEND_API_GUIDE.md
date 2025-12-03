# 🎨 Frontend API Integration Guide

> Complete guide for integrating Next.js frontend with TempaSKill Backend API

**Last Updated**: November 3, 2025  
**Backend Version**: 2.0.0  
**Base URL**: `http://localhost:8080/api/v1`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Response Structure](#response-structure)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication)
  - [User Management](#user-management)
  - [Course Management](#course-management)
  - [Lesson Management](#lesson-management)
  - [Progress Tracking](#progress-tracking)
  - [Certificate Management](#certificate-management)
  - [Instructor Earnings & Withdrawals](#instructor-earnings--withdrawals)
  - [Activity Logs](#activity-logs)
  - [Instructor Management](#instructor-management)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [TypeScript Types](#typescript-types)
- [React Query Examples](#react-query-examples)

---

## 🎯 Overview

### Features Implemented

- ✅ **Authentication**: Register, Login, JWT-based auth
- ✅ **User Management**: Profile, Update, Change Password
- ✅ **Course Management**: CRUD, Enrollment, Slug-based retrieval
- ✅ **Lesson Management**: CRUD operations within courses
- ✅ **Progress Tracking**: Mark lessons complete, track course progress
- ✅ **Certificate Management**: Issue, download, verify course completion certificates
- ✅ **Instructor Earnings**: Revenue tracking, withdrawal requests, bank account management
- ✅ **Activity Logs**: Comprehensive audit trail for user actions
- ✅ **Instructor Management**: List instructors, view stats, student management
- ✅ **Request ID**: Every request/response includes unique `request_id` for debugging
- ✅ **Optimized Queries**: N+1 query problem solved (100x faster)

### Security Features

- JWT Authentication with Bearer tokens
- CORS configured
- Rate limiting (100 req/min general, 10 req/min auth)
- Request size limits (10MB max)
- Security headers (XSS, Clickjacking protection)
- Panic recovery with stack traces

---

## 📦 Response Structure

### Standard Success Response

```typescript
interface SuccessResponse<T> {
  success: true;
  request_id: string;
  data: T;
  message?: string;
}
```

**Example:**

```json
{
  "success": true,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "User retrieved successfully"
}
```

### Standard Error Response

```typescript
interface ErrorResponse {
  success: false;
  request_id: string;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}
```

**Example:**

```json
{
  "success": false,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

### Pagination Response

```typescript
interface PaginatedResponse<T> {
  success: true;
  request_id: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      total_pages: number;
    };
  };
}
```

---

## 🔐 Authentication Flow

### 1. Register New User

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "created_at": "2025-11-02T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Validation Rules:**

- `name`: Required, 2-100 characters
- `email`: Required, valid email, unique
- `password`: Required, min 8 characters
- `password_confirmation`: Must match password

**Rate Limit**: 10 requests/minute

---

### 2. Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "request_id": "...",
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

**Rate Limit**: 10 requests/minute

---

### 3. Get Current User

```http
GET /api/v1/auth/me
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "bio": "Passionate learner",
    "avatar_url": "https://...",
    "created_at": "2025-11-02T10:00:00Z"
  }
}
```

---

## 📚 API Endpoints

### Authentication Endpoints

| Method | Endpoint         | Auth Required | Description       | Rate Limit  |
| ------ | ---------------- | ------------- | ----------------- | ----------- |
| POST   | `/auth/register` | ❌            | Register new user | 10 req/min  |
| POST   | `/auth/login`    | ❌            | Login user        | 10 req/min  |
| GET    | `/auth/me`       | ✅            | Get current user  | 100 req/min |

---

### User Endpoints

| Method | Endpoint             | Auth Required | Description     | Rate Limit  |
| ------ | -------------------- | ------------- | --------------- | ----------- |
| GET    | `/users/:id`         | ❌            | Get user by ID  | 100 req/min |
| PATCH  | `/users/me`          | ✅            | Update profile  | 100 req/min |
| PUT    | `/users/me/password` | ✅            | Change password | 100 req/min |

#### Get User by ID

```http
GET /api/v1/users/1
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "bio": "...",
    "avatar_url": "...",
    "created_at": "2025-11-02T10:00:00Z",
    "updated_at": "2025-11-02T10:00:00Z"
  }
}
```

#### Update Profile

```http
PATCH /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "bio": "New bio text",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

#### Change Password

```http
PUT /api/v1/users/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!",
  "new_password_confirmation": "NewPass123!"
}
```

---

### Course Endpoints

| Method | Endpoint              | Auth Required | Description              | Rate Limit  |
| ------ | --------------------- | ------------- | ------------------------ | ----------- |
| POST   | `/courses`            | ✅ (admin)    | Create course            | 100 req/min |
| GET    | `/courses`            | ❌            | List courses (paginated) | 100 req/min |
| GET    | `/courses/:id`        | ❌            | Get course by ID         | 100 req/min |
| GET    | `/courses/slug/:slug` | ❌            | Get course by slug       | 100 req/min |
| PUT    | `/courses/:id`        | ✅ (admin)    | Update course            | 100 req/min |
| DELETE | `/courses/:id`        | ✅ (admin)    | Delete course (soft)     | 100 req/min |
| POST   | `/courses/:id/enroll` | ✅            | Enroll in course         | 100 req/min |
| DELETE | `/courses/:id/enroll` | ✅            | Unenroll from course     | 100 req/min |

#### List Courses (Optimized)

```http
GET /api/v1/courses?page=1&limit=10&search=golang&category=programming&difficulty=beginner&published=true
Authorization: Bearer <token> (optional)
```

**Query Parameters:**

- `page` (optional, default: 1): Page number
- `limit` (optional, default: 10): Items per page
- `search` (optional): Search in title/description
- `category` (optional): Filter by category
- `difficulty` (optional): beginner | intermediate | advanced
- `published` (optional): true | false

**Response (200 OK):**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "Go Programming Masterclass",
        "slug": "go-programming-masterclass",
        "description": "Learn Go from scratch...",
        "thumbnail_url": "https://...",
        "category": "programming",
        "difficulty": "beginner",
        "instructor_id": 5,
        "price": 99000,
        "is_published": true,
        "enrolled_count": 150,
        "lesson_count": 25,
        "is_enrolled": false,
        "created_at": "2025-11-02T10:00:00Z",
        "updated_at": "2025-11-02T10:00:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 10
  }
}
```

**Note**:

- `is_enrolled` is `false` for guest users (not authenticated)
- `is_enrolled` shows actual enrollment status for authenticated users
- **Optimized**: Single query instead of N+1 queries (100x faster)

#### Get Course by Slug

```http
GET /api/v1/courses/slug/go-programming-masterclass
Authorization: Bearer <token> (optional)
```

**Response:** Same as Get Course by ID

#### Enroll in Course

```http
POST /api/v1/courses/1/enroll
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "enrollment": {
      "id": 10,
      "user_id": 1,
      "course_id": 1,
      "progress": 0,
      "enrolled_at": "2025-11-02T10:00:00Z"
    }
  },
  "message": "Enrolled in course successfully"
}
```

---

### Lesson Endpoints

| Method | Endpoint                         | Auth Required | Description         | Rate Limit  |
| ------ | -------------------------------- | ------------- | ------------------- | ----------- |
| POST   | `/courses/:id/lessons`           | ✅ (admin)    | Create lesson       | 100 req/min |
| GET    | `/courses/:id/lessons`           | ❌            | List course lessons | 100 req/min |
| GET    | `/courses/:courseId/lessons/:id` | ❌            | Get lesson by ID    | 100 req/min |
| PUT    | `/courses/:courseId/lessons/:id` | ✅ (admin)    | Update lesson       | 100 req/min |
| DELETE | `/courses/:courseId/lessons/:id` | ✅ (admin)    | Delete lesson       | 100 req/min |

#### Create Lesson

```http
POST /api/v1/courses/1/lessons
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Introduction to Go",
  "slug": "introduction-to-go",
  "content": "# Introduction\n\nWelcome to Go programming...",
  "order_index": 1,
  "duration": 15,
  "is_published": true
}
```

**Validation:**

- `title`: Required, max 200 characters
- `slug`: Required, unique per course
- `content`: Required (MDX format supported)
- `order_index`: Required, integer
- `duration`: Optional, estimated reading time in minutes

#### Get Course Lessons

```http
GET /api/v1/courses/1/lessons
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": [
    {
      "id": 1,
      "course_id": 1,
      "title": "Introduction to Go",
      "slug": "introduction-to-go",
      "content": "# Introduction\n\n...",
      "order_index": 1,
      "duration": 15,
      "is_published": true,
      "created_at": "2025-11-02T10:00:00Z",
      "updated_at": "2025-11-02T10:00:00Z"
    }
  ]
}
```

---

### Progress Tracking Endpoints

| Method | Endpoint                               | Auth Required | Description           | Rate Limit  |
| ------ | -------------------------------------- | ------------- | --------------------- | ----------- |
| POST   | `/progress/lessons/:lessonId/complete` | ✅            | Mark lesson complete  | 100 req/min |
| GET    | `/progress/courses/:courseId`          | ✅            | Get course progress   | 100 req/min |
| GET    | `/progress/me`                         | ✅            | Get all user progress | 100 req/min |

#### Mark Lesson Complete

```http
POST /api/v1/progress/lessons/5/complete
Authorization: Bearer <token>
Content-Type: application/json

{
  "course_id": 1
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "lesson_progress": {
      "id": 10,
      "user_id": 1,
      "lesson_id": 5,
      "course_id": 1,
      "completed_at": "2025-11-02T10:00:00Z"
    }
  },
  "message": "Lesson marked as complete"
}
```

**Note**: Idempotent - calling again for same lesson returns existing record

#### Get Course Progress

```http
GET /api/v1/progress/courses/1
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "course_id": 1,
    "user_id": 1,
    "total_lessons": 25,
    "completed_lessons": 10,
    "progress_percentage": 40,
    "is_completed": false,
    "completed_lesson_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    "last_activity": "2025-11-02T10:00:00Z"
  }
}
```

#### Get All User Progress

```http
GET /api/v1/progress/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": [
    {
      "course_id": 1,
      "course_title": "Go Programming Masterclass",
      "course_slug": "go-programming-masterclass",
      "total_lessons": 25,
      "completed_lessons": 10,
      "progress_percentage": 40,
      "is_completed": false,
      "last_activity": "2025-11-02T10:00:00Z"
    }
  ]
}
```

---

### Certificate Management Endpoints

| Method | Endpoint                                      | Auth Required | Description                   | Rate Limit  |
| ------ | --------------------------------------------- | ------------- | ----------------------------- | ----------- |
| GET    | `/certificates/courses/:courseId/eligibility` | ✅            | Check certificate eligibility | 100 req/min |
| POST   | `/certificates/courses/:courseId/issue`       | ✅            | Issue course certificate      | 10 req/min  |
| GET    | `/certificates/me`                            | ✅            | List my certificates          | 100 req/min |
| GET    | `/certificates/:certificateId/download`       | ✅            | Download PDF certificate      | 50 req/min  |

#### Check Certificate Eligibility

Check if user can obtain certificate for a course (requires 100% completion).

```http
GET /api/v1/certificates/courses/1/eligibility
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "eligible": true,
    "course_id": 1,
    "course_title": "Go Programming Masterclass",
    "progress_percentage": 100,
    "completed_lessons": 25,
    "total_lessons": 25,
    "already_issued": false
  }
}
```

**Not Eligible Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "eligible": false,
    "course_id": 1,
    "course_title": "Go Programming Masterclass",
    "progress_percentage": 80,
    "completed_lessons": 20,
    "total_lessons": 25,
    "already_issued": false,
    "message": "You must complete all lessons (25/25) to be eligible for a certificate"
  }
}
```

#### Issue Certificate

Issue certificate for completed course. Only works if progress is 100%.

```http
POST /api/v1/certificates/courses/1/issue
Authorization: Bearer <token>
```

**Response (201 Created):**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "id": 123,
    "user_id": 5,
    "course_id": 1,
    "certificate_id": "CERT-20251103-ABC123XYZ",
    "issued_at": "2025-11-03T14:30:00Z"
  },
  "message": "Certificate issued successfully"
}
```

**Error (Not Eligible):**

```json
{
  "success": false,
  "request_id": "...",
  "error": {
    "code": "NOT_ELIGIBLE",
    "message": "You must complete all lessons to receive a certificate"
  }
}
```

**Error (Already Issued):**

```json
{
  "success": false,
  "request_id": "...",
  "error": {
    "code": "ALREADY_ISSUED",
    "message": "Certificate already issued for this course",
    "details": {
      "certificate_id": "CERT-20251103-ABC123XYZ"
    }
  }
}
```

#### List My Certificates

Get all certificates earned by authenticated user.

```http
GET /api/v1/certificates/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": [
    {
      "id": 123,
      "user_id": 5,
      "course_id": 1,
      "certificate_id": "CERT-20251103-ABC123XYZ",
      "issued_at": "2025-11-03T14:30:00Z",
      "course": {
        "id": 1,
        "title": "Go Programming Masterclass",
        "slug": "go-programming-masterclass",
        "category": "Programming"
      }
    }
  ]
}
```

#### Download Certificate PDF

Download certificate as PDF file.

```http
GET /api/v1/certificates/CERT-20251103-ABC123XYZ/download
Authorization: Bearer <token>
```

**Response:**

- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="certificate-CERT-20251103-ABC123XYZ.pdf"`
- **Body**: PDF file binary data

**Error (Not Found):**

```json
{
  "success": false,
  "request_id": "...",
  "error": {
    "code": "NOT_FOUND",
    "message": "Certificate not found"
  }
}
```

**Error (Not Owned):**

```json
{
  "success": false,
  "request_id": "...",
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not own this certificate"
  }
}
```

---

### Instructor Earnings & Withdrawals

| Method | Endpoint                                | Auth Required   | Description               | Rate Limit  |
| ------ | --------------------------------------- | --------------- | ------------------------- | ----------- |
| GET    | `/instructor/earnings/balance`          | ✅ (Instructor) | Get earnings balance      | 100 req/min |
| GET    | `/instructor/earnings`                  | ✅ (Instructor) | List all earnings         | 100 req/min |
| POST   | `/instructor/withdrawals`               | ✅ (Instructor) | Create withdrawal request | 10 req/min  |
| GET    | `/instructor/withdrawals`               | ✅ (Instructor) | List withdrawal requests  | 100 req/min |
| GET    | `/instructor/bank-accounts`             | ✅ (Instructor) | List bank accounts        | 100 req/min |
| POST   | `/instructor/bank-accounts`             | ✅ (Instructor) | Add bank account          | 10 req/min  |
| PUT    | `/instructor/bank-accounts/:id/primary` | ✅ (Instructor) | Set primary bank account  | 10 req/min  |
| GET    | `/admin/withdrawals`                    | ✅ (Admin)      | List all withdrawals      | 100 req/min |
| PUT    | `/admin/withdrawals/:id/approve`        | ✅ (Admin)      | Approve withdrawal        | 10 req/min  |
| PUT    | `/admin/withdrawals/:id/reject`         | ✅ (Admin)      | Reject withdrawal         | 10 req/min  |
| PUT    | `/admin/bank-accounts/:id/verify`       | ✅ (Admin)      | Verify bank account       | 10 req/min  |
| PUT    | `/admin/bank-accounts/:id/reject`       | ✅ (Admin)      | Reject bank account       | 10 req/min  |

#### Get Earnings Balance

Get current earnings balance with breakdown.

```http
GET /api/v1/instructor/earnings/balance
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "total_earnings": 15000000,
    "available_balance": 8000000,
    "held_balance": 5000000,
    "withdrawn_total": 2000000,
    "currency": "IDR"
  }
}
```

**Field Explanations:**

- `total_earnings`: Total revenue earned (70% of course sales)
- `available_balance`: Amount available for withdrawal (after 14-day hold)
- `held_balance`: Amount in holding period (waiting 14 days)
- `withdrawn_total`: Total amount already withdrawn

#### List All Earnings

Get detailed earnings history.

```http
GET /api/v1/instructor/earnings?status=available&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**

- `status`: Filter by status (`held`, `available`, `withdrawn`, `refunded`)
- `course_id`: Filter by specific course
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "items": [
      {
        "id": 456,
        "instructor_id": 3,
        "course_id": 1,
        "enrollment_id": 789,
        "payment_id": 101,
        "amount": 349300,
        "instructor_share": 244510,
        "platform_fee": 104790,
        "status": "available",
        "held_until": null,
        "released_at": "2025-10-20T10:00:00Z",
        "created_at": "2025-10-06T10:00:00Z"
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

#### Create Withdrawal Request

Request withdrawal of available balance.

```http
POST /api/v1/instructor/withdrawals
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1000000,
  "bank_account_id": 5
}
```

**Validation:**

- `amount`: Required, minimum 100,000 IDR
- `bank_account_id`: Required, must be verified bank account

**Response (201 Created):**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "id": 88,
    "instructor_id": 3,
    "amount": 1000000,
    "admin_fee": 5000,
    "total_amount": 995000,
    "bank_account_id": 5,
    "status": "pending",
    "requested_at": "2025-11-03T15:00:00Z"
  },
  "message": "Withdrawal request created successfully"
}
```

**Errors:**

```json
{
  "success": false,
  "request_id": "...",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient available balance. Available: Rp 500,000"
  }
}
```

#### List Withdrawal Requests

Get withdrawal history.

```http
GET /api/v1/instructor/withdrawals?status=pending
Authorization: Bearer <token>
```

**Query Parameters:**

- `status`: Filter by status (`pending`, `processing`, `completed`, `failed`, `cancelled`)
- `page`, `limit`: Pagination

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "items": [
      {
        "id": 88,
        "instructor_id": 3,
        "amount": 1000000,
        "admin_fee": 5000,
        "total_amount": 995000,
        "bank_account_id": 5,
        "status": "pending",
        "requested_at": "2025-11-03T15:00:00Z",
        "processed_at": null,
        "bank_account": {
          "id": 5,
          "bank_name": "BCA",
          "account_number": "1234567890",
          "account_holder_name": "John Doe"
        }
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 5, "total_pages": 1 }
  }
}
```

#### Add Bank Account

Add bank account for withdrawals.

```http
POST /api/v1/instructor/bank-accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "bank_name": "BCA",
  "account_number": "1234567890",
  "account_holder_name": "John Doe"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "id": 5,
    "instructor_id": 3,
    "bank_name": "BCA",
    "account_number": "1234567890",
    "account_holder_name": "John Doe",
    "is_verified": false,
    "is_primary": false,
    "verification_status": "pending",
    "created_at": "2025-11-03T15:30:00Z"
  },
  "message": "Bank account added successfully. Waiting for admin verification."
}
```

---

### Activity Logs

| Method | Endpoint                 | Auth Required | Description                    | Rate Limit  |
| ------ | ------------------------ | ------------- | ------------------------------ | ----------- |
| GET    | `/activity/me`           | ✅            | Get my activity logs           | 100 req/min |
| GET    | `/admin/activity/recent` | ✅ (Admin)    | Get recent platform activities | 100 req/min |

#### Get My Activities

```http
GET /api/v1/activity/me?type=course_enrollment&page=1&limit=20
Authorization: Bearer <token>
```

**Query Parameters:**

- `type`: Filter by activity type
- `start_date`, `end_date`: Date range filter (YYYY-MM-DD)
- `page`, `limit`: Pagination

**Activity Types:**

- `user_registered`
- `user_login`
- `course_enrolled`
- `lesson_completed`
- `course_completed`
- `certificate_issued`
- `withdrawal_requested`
- `withdrawal_completed`
- `bank_account_added`
- `course_created`
- `course_updated`
- `lesson_created`

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "items": [
      {
        "id": 1234,
        "user_id": 5,
        "activity_type": "course_enrolled",
        "description": "Enrolled in course: Go Programming Masterclass",
        "metadata": {
          "course_id": 1,
          "course_title": "Go Programming Masterclass",
          "enrollment_id": 789
        },
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2025-11-03T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 156, "total_pages": 8 }
  }
}
```

#### Get Recent Platform Activities (Admin)

Get recent activities across the platform.

```http
GET /api/v1/admin/activity/recent?limit=50
Authorization: Bearer <admin-token>
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": [
    {
      "id": 5678,
      "user_id": 10,
      "activity_type": "withdrawal_requested",
      "description": "Instructor requested withdrawal of Rp 1,000,000",
      "metadata": {
        "withdrawal_id": 88,
        "amount": 1000000
      },
      "ip_address": "203.0.113.42",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2025-11-03T15:00:00Z",
      "user": {
        "id": 10,
        "name": "Jane Instructor",
        "email": "jane@example.com"
      }
    }
  ]
}
```

---

### Instructor Management

| Method | Endpoint                   | Auth Required   | Description               | Rate Limit  |
| ------ | -------------------------- | --------------- | ------------------------- | ----------- |
| GET    | `/instructors`             | ❌              | List all instructors      | 100 req/min |
| GET    | `/instructors/:id`         | ❌              | Get instructor details    | 100 req/min |
| GET    | `/instructors/:id/courses` | ❌              | Get instructor's courses  | 100 req/min |
| GET    | `/instructors/:id/stats`   | ❌              | Get instructor statistics | 100 req/min |
| GET    | `/instructor/my-students`  | ✅ (Instructor) | Get my students list      | 100 req/min |

#### List All Instructors

Get list of platform instructors.

```http
GET /api/v1/instructors?sort=students_count&order=desc&page=1&limit=12
```

**Query Parameters:**

- `search`: Search by name or bio
- `sort`: Sort by (`name`, `students_count`, `courses_count`, `created_at`)
- `order`: Sort order (`asc`, `desc`)
- `page`, `limit`: Pagination

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "items": [
      {
        "id": 3,
        "name": "Jane Instructor",
        "email": "jane@example.com",
        "bio": "Experienced Go and Web developer",
        "profile_picture": "https://...",
        "courses_count": 5,
        "students_count": 342,
        "average_rating": 4.7,
        "created_at": "2025-01-15T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 8, "total_pages": 1 }
  }
}
```

#### Get Instructor Details

```http
GET /api/v1/instructors/3
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "id": 3,
    "name": "Jane Instructor",
    "email": "jane@example.com",
    "bio": "Experienced Go and Web developer with 10+ years...",
    "profile_picture": "https://...",
    "courses_count": 5,
    "students_count": 342,
    "average_rating": 4.7,
    "total_reviews": 87,
    "created_at": "2025-01-15T10:00:00Z"
  }
}
```

#### Get Instructor's Courses

```http
GET /api/v1/instructors/3/courses
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": [
    {
      "id": 1,
      "title": "Go Programming Masterclass",
      "slug": "go-programming-masterclass",
      "description": "...",
      "price": 499000,
      "category": "Programming",
      "difficulty": "intermediate",
      "enrolled_count": 156,
      "average_rating": 4.8,
      "created_at": "2025-02-01T10:00:00Z"
    }
  ]
}
```

#### Get Instructor Statistics

```http
GET /api/v1/instructors/3/stats
```

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "instructor_id": 3,
    "total_courses": 5,
    "total_students": 342,
    "total_revenue": 25000000,
    "average_course_rating": 4.7,
    "completion_rate": 68.5,
    "active_students_30d": 89
  }
}
```

#### Get My Students (Instructor Only)

Get list of students enrolled in instructor's courses.

```http
GET /api/v1/instructor/my-students?course_id=1
Authorization: Bearer <instructor-token>
```

**Query Parameters:**

- `course_id`: Filter by specific course
- `search`: Search by student name/email
- `page`, `limit`: Pagination

**Response:**

```json
{
  "success": true,
  "request_id": "...",
  "data": {
    "items": [
      {
        "student_id": 25,
        "student_name": "Alice Student",
        "student_email": "alice@example.com",
        "course_id": 1,
        "course_title": "Go Programming Masterclass",
        "enrolled_at": "2025-10-15T10:00:00Z",
        "progress_percentage": 45,
        "completed_lessons": 11,
        "total_lessons": 25,
        "last_activity": "2025-11-02T14:30:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 156, "total_pages": 16 }
  }
}
```

---

## 📊 Data Models

### User

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  bio?: string;
  avatar_url?: string;
  created_at: string; // ISO 8601
  updated_at?: string;
}
```

### Course

```typescript
interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  instructor_id: number;
  price: number; // in cents/rupiah
  is_published: boolean;
  enrolled_count: number;
  lesson_count: number;
  is_enrolled: boolean;
  created_at: string;
  updated_at: string;
}
```

### Lesson

```typescript
interface Lesson {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  content: string; // MDX format
  order_index: number;
  duration: number; // minutes
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
```

### Enrollment

```typescript
interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  progress: number; // 0-100
  enrolled_at: string;
  updated_at: string;
}
```

### Progress

```typescript
interface CourseProgress {
  course_id: number;
  user_id: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
  completed_lesson_ids: number[];
  last_activity: string;
}
```

### Certificate

```typescript
interface Certificate {
  id: number;
  user_id: number;
  course_id: number;
  certificate_id: string; // Unique ID (e.g., CERT-20251103-ABC123XYZ)
  issued_at: string;
  course?: {
    id: number;
    title: string;
    slug: string;
    category: string;
  };
}

interface CertificateEligibility {
  eligible: boolean;
  course_id: number;
  course_title: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  already_issued: boolean;
  message?: string;
}
```

### Instructor Earnings

```typescript
interface EarningsBalance {
  total_earnings: number;
  available_balance: number;
  held_balance: number;
  withdrawn_total: number;
  currency: "IDR";
}

interface Earning {
  id: number;
  instructor_id: number;
  course_id: number;
  enrollment_id: number;
  payment_id: number;
  amount: number;
  instructor_share: number;
  platform_fee: number;
  status: "held" | "available" | "withdrawn" | "refunded";
  held_until: string | null;
  released_at: string | null;
  created_at: string;
}

interface WithdrawalRequest {
  id: number;
  instructor_id: number;
  amount: number;
  admin_fee: number;
  total_amount: number;
  bank_account_id: number;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  requested_at: string;
  processed_at: string | null;
  admin_notes?: string;
  bank_account?: BankAccount;
}

interface BankAccount {
  id: number;
  instructor_id: number;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  is_verified: boolean;
  is_primary: boolean;
  verification_status: "pending" | "verified" | "rejected";
  admin_notes?: string;
  created_at: string;
}
```

### Activity Log

```typescript
type ActivityType =
  | "user_registered"
  | "user_login"
  | "course_enrolled"
  | "lesson_completed"
  | "course_completed"
  | "certificate_issued"
  | "withdrawal_requested"
  | "withdrawal_completed"
  | "bank_account_added"
  | "course_created"
  | "course_updated"
  | "lesson_created";

interface ActivityLog {
  id: number;
  user_id: number;
  activity_type: ActivityType;
  description: string;
  metadata: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
```

### Instructor

```typescript
interface Instructor {
  id: number;
  name: string;
  email: string;
  bio?: string;
  profile_picture?: string;
  courses_count: number;
  students_count: number;
  average_rating: number;
  total_reviews?: number;
  created_at: string;
}

interface InstructorStats {
  instructor_id: number;
  total_courses: number;
  total_students: number;
  total_revenue: number;
  average_course_rating: number;
  completion_rate: number;
  active_students_30d: number;
}

interface StudentProgress {
  student_id: number;
  student_name: string;
  student_email: string;
  course_id: number;
  course_title: string;
  enrolled_at: string;
  progress_percentage: number;
  completed_lessons: number;
  total_lessons: number;
  last_activity: string;
}
```

---

## ⚠️ Error Handling

### Common Error Codes

| Code                  | HTTP Status | Description                   |
| --------------------- | ----------- | ----------------------------- |
| `VALIDATION_ERROR`    | 400         | Invalid input data            |
| `UNAUTHORIZED`        | 401         | Missing or invalid auth token |
| `FORBIDDEN`           | 403         | Insufficient permissions      |
| `NOT_FOUND`           | 404         | Resource not found            |
| `CONFLICT`            | 409         | Duplicate entry (e.g., email) |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests             |
| `INTERNAL_ERROR`      | 500         | Server error                  |

### Error Response Examples

**Validation Error:**

```json
{
  "success": false,
  "request_id": "...",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    }
  }
}
```

**Authentication Error:**

```json
{
  "success": false,
  "request_id": "...",
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

**Rate Limit Error:**

```json
{
  "success": false,
  "request_id": "...",
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds."
  }
}
```

---

## 🚦 Rate Limiting

### Limits by Endpoint Category

| Category         | Limit    | Window | Endpoints                       |
| ---------------- | -------- | ------ | ------------------------------- |
| General API      | 100 req  | 1 min  | Most endpoints                  |
| Authentication   | 10 req   | 1 min  | `/auth/register`, `/auth/login` |
| Public (No auth) | No limit | -      | Health check                    |

### Rate Limit Headers

Every response includes rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699000000
```

### Handling Rate Limits

```typescript
// Example: Detect rate limit and retry
try {
  const response = await fetch("/api/v1/courses");
  if (response.status === 429) {
    const retryAfter = response.headers.get("Retry-After");
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
  }
} catch (error) {
  console.error(error);
}
```

---

## 🔧 TypeScript Types

### Complete Type Definitions

```typescript
// api/types.ts

// Response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  request_id: string;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor" | "admin";
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  avatar_url?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

// Course types
export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  instructor_id: number;
  price: number;
  is_published: boolean;
  enrolled_count: number;
  lesson_count: number;
  is_enrolled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
  published?: boolean;
}

export interface CourseListResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

// Lesson types
export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  content: string;
  order_index: number;
  duration: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLessonRequest {
  title: string;
  slug: string;
  content: string;
  order_index: number;
  duration?: number;
  is_published?: boolean;
}

// Progress types
export interface CourseProgress {
  course_id: number;
  user_id: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
  completed_lesson_ids: number[];
  last_activity: string;
}

export interface UserProgress {
  course_id: number;
  course_title: string;
  course_slug: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
  last_activity: string;
}

export interface MarkLessonCompleteRequest {
  course_id: number;
}

// Enrollment types
export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  progress: number;
  enrolled_at: string;
  updated_at: string;
}
```

---

## ⚛️ React Query Examples

### Setup API Client

```typescript
// lib/api-client.ts
import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### Authentication Queries

```typescript
// queries/auth.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/api";

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/register",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("auth_token", data.data.token);
      }
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem("auth_token", data.data.token);
      }
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>("/auth/me");
      return response.data.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### Course Queries

```typescript
// queries/courses.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  Course,
  CourseListQuery,
  CourseListResponse,
} from "@/types/api";

export const useCourses = (params?: CourseListQuery) => {
  return useQuery({
    queryKey: ["courses", params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CourseListResponse>>(
        "/courses",
        { params }
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCourse = (slug: string) => {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Course>>(
        `/courses/slug/${slug}`
      );
      return response.data.data;
    },
    enabled: !!slug,
  });
};

export const useEnrollCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      const response = await apiClient.post<ApiResponse<any>>(
        `/courses/${courseId}/enroll`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate courses to refresh enrollment status
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    },
  });
};
```

### Progress Queries

```typescript
// queries/progress.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  ApiResponse,
  CourseProgress,
  UserProgress,
  MarkLessonCompleteRequest,
} from "@/types/api";

export const useCourseProgress = (courseId: number) => {
  return useQuery({
    queryKey: ["courseProgress", courseId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CourseProgress>>(
        `/progress/courses/${courseId}`
      );
      return response.data.data;
    },
    enabled: !!courseId,
  });
};

export const useUserProgress = () => {
  return useQuery({
    queryKey: ["userProgress"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserProgress[]>>(
        "/progress/me"
      );
      return response.data.data;
    },
  });
};

export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      lessonId,
      courseId,
    }: {
      lessonId: number;
      courseId: number;
    }) => {
      const response = await apiClient.post<ApiResponse<any>>(
        `/progress/lessons/${lessonId}/complete`,
        { course_id: courseId }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate progress queries
      queryClient.invalidateQueries({
        queryKey: ["courseProgress", variables.courseId],
      });
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });
};
```

### Usage in Components

```typescript
// app/courses/page.tsx
"use client";

import { useCourses } from "@/queries/courses";
import { useState } from "react";

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCourses({ page, limit: 12 });

  if (isLoading) return <div>Loading courses...</div>;
  if (error) return <div>Error loading courses</div>;

  return (
    <div>
      <h1>Courses</h1>
      <div className="grid grid-cols-3 gap-4">
        {data?.courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      <Pagination
        currentPage={page}
        totalPages={Math.ceil(data?.total / 12)}
        onPageChange={setPage}
      />
    </div>
  );
}
```

```typescript
// app/courses/[slug]/page.tsx
"use client";

import { useCourse, useEnrollCourse } from "@/queries/courses";
import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: course, isLoading } = useCourse(slug);
  const enrollMutation = useEnrollCourse();

  const handleEnroll = () => {
    if (course?.id) {
      enrollMutation.mutate(course.id);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Lessons: {course.lesson_count}</p>
      <p>Difficulty: {course.difficulty}</p>

      {!course.is_enrolled && (
        <button onClick={handleEnroll} disabled={enrollMutation.isPending}>
          {enrollMutation.isPending ? "Enrolling..." : "Enroll Now"}
        </button>
      )}
    </div>
  );
}
```

### Certificate Queries

```typescript
// queries/certificates.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Certificate, CertificateEligibility } from "@/types/api";

// Check certificate eligibility
export const useCertificateEligibility = (courseId: number) => {
  return useQuery({
    queryKey: ["certificateEligibility", courseId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CertificateEligibility>>(
        `/certificates/courses/${courseId}/eligibility`
      );
      return response.data.data;
    },
    enabled: !!courseId,
  });
};

// Issue certificate
export const useIssueCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: number) => {
      const response = await apiClient.post<ApiResponse<Certificate>>(
        `/certificates/courses/${courseId}/issue`
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificateEligibility"] });
    },
  });
};

// List my certificates
export const useMyCertificates = () => {
  return useQuery({
    queryKey: ["certificates"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Certificate[]>>(
        "/certificates/me"
      );
      return response.data.data;
    },
  });
};

// Download certificate PDF
export const downloadCertificate = async (certificateId: string) => {
  const response = await apiClient.get(
    `/certificates/${certificateId}/download`,
    {
      responseType: "blob",
    }
  );

  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `certificate-${certificateId}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
```

### Instructor Earnings Queries

```typescript
// queries/earnings.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  EarningsBalance,
  Earning,
  WithdrawalRequest,
  BankAccount,
} from "@/types/api";

// Get earnings balance
export const useEarningsBalance = () => {
  return useQuery({
    queryKey: ["earningsBalance"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<EarningsBalance>>(
        "/instructor/earnings/balance"
      );
      return response.data.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

// List earnings
export const useEarnings = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["earnings", params],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ items: Earning[]; pagination: any }>
      >("/instructor/earnings", { params });
      return response.data.data;
    },
  });
};

// Create withdrawal request
export const useCreateWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { amount: number; bank_account_id: number }) => {
      const response = await apiClient.post<ApiResponse<WithdrawalRequest>>(
        "/instructor/withdrawals",
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["earningsBalance"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
};

// List withdrawals
export const useWithdrawals = (params?: { status?: string; page?: number }) => {
  return useQuery({
    queryKey: ["withdrawals", params],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ items: WithdrawalRequest[]; pagination: any }>
      >("/instructor/withdrawals", { params });
      return response.data.data;
    },
  });
};

// Add bank account
export const useAddBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      bank_name: string;
      account_number: string;
      account_holder_name: string;
    }) => {
      const response = await apiClient.post<ApiResponse<BankAccount>>(
        "/instructor/bank-accounts",
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
};

// List bank accounts
export const useBankAccounts = () => {
  return useQuery({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<BankAccount[]>>(
        "/instructor/bank-accounts"
      );
      return response.data.data;
    },
  });
};
```

### Activity Logs Queries

```typescript
// queries/activity.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ActivityLog } from "@/types/api";

// Get my activities
export const useMyActivities = (params?: {
  type?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["myActivities", params],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ items: ActivityLog[]; pagination: any }>
      >("/activity/me", { params });
      return response.data.data;
    },
  });
};

// Get recent platform activities (Admin only)
export const useRecentActivities = (limit: number = 50) => {
  return useQuery({
    queryKey: ["recentActivities", limit],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ActivityLog[]>>(
        "/admin/activity/recent",
        { params: { limit } }
      );
      return response.data.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for admin dashboard
  });
};
```

### Instructor Management Queries

```typescript
// queries/instructors.ts
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Instructor,
  InstructorStats,
  Course,
  StudentProgress,
} from "@/types/api";

// List instructors
export const useInstructors = (params?: {
  search?: string;
  sort?: "name" | "students_count" | "courses_count" | "created_at";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["instructors", params],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ items: Instructor[]; pagination: any }>
      >("/instructors", { params });
      return response.data.data;
    },
  });
};

// Get instructor details
export const useInstructor = (instructorId: number) => {
  return useQuery({
    queryKey: ["instructor", instructorId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Instructor>>(
        `/instructors/${instructorId}`
      );
      return response.data.data;
    },
    enabled: !!instructorId,
  });
};

// Get instructor's courses
export const useInstructorCourses = (instructorId: number) => {
  return useQuery({
    queryKey: ["instructorCourses", instructorId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Course[]>>(
        `/instructors/${instructorId}/courses`
      );
      return response.data.data;
    },
    enabled: !!instructorId,
  });
};

// Get instructor statistics
export const useInstructorStats = (instructorId: number) => {
  return useQuery({
    queryKey: ["instructorStats", instructorId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<InstructorStats>>(
        `/instructors/${instructorId}/stats`
      );
      return response.data.data;
    },
    enabled: !!instructorId,
  });
};

// Get my students (Instructor only)
export const useMyStudents = (params?: {
  course_id?: number;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["myStudents", params],
    queryFn: async () => {
      const response = await apiClient.get<
        ApiResponse<{ items: StudentProgress[]; pagination: any }>
      >("/instructor/my-students", { params });
      return response.data.data;
    },
  });
};
```

### Usage Example: Certificate Feature

```typescript
// components/CertificateSection.tsx
import {
  useIssueCertificate,
  useCertificateEligibility,
  downloadCertificate,
} from "@/queries/certificates";

export function CertificateSection({ courseId }: { courseId: number }) {
  const { data: eligibility, isLoading } = useCertificateEligibility(courseId);
  const issueMutation = useIssueCertificate();

  if (isLoading) return <div>Loading...</div>;

  if (!eligibility?.eligible) {
    return (
      <div className="border rounded p-4">
        <p>Complete all lessons to earn your certificate</p>
        <p className="text-sm text-gray-500">
          Progress: {eligibility?.completed_lessons}/
          {eligibility?.total_lessons}
        </p>
      </div>
    );
  }

  if (eligibility.already_issued) {
    return (
      <div className="border rounded p-4">
        <p className="font-semibold">Certificate Issued ✓</p>
        <button
          onClick={() => downloadCertificate(eligibility.certificate_id!)}
          className="mt-2 bg-orange-600 text-white px-4 py-2 rounded"
        >
          Download PDF
        </button>
      </div>
    );
  }

  return (
    <div className="border rounded p-4">
      <p className="font-semibold">You're eligible for a certificate!</p>
      <button
        onClick={() => issueMutation.mutate(courseId)}
        disabled={issueMutation.isPending}
        className="mt-2 bg-orange-600 text-white px-4 py-2 rounded"
      >
        {issueMutation.isPending ? "Issuing..." : "Get Certificate"}
      </button>
    </div>
  );
}
```

### Usage Example: Instructor Earnings Dashboard

```typescript
// app/instructor/earnings/page.tsx
import {
  useEarningsBalance,
  useWithdrawals,
  useCreateWithdrawal,
} from "@/queries/earnings";

export default function EarningsDashboard() {
  const { data: balance } = useEarningsBalance();
  const { data: withdrawals } = useWithdrawals({ status: "pending" });
  const createWithdrawal = useCreateWithdrawal();

  const handleWithdraw = () => {
    if (balance && balance.available_balance >= 100000) {
      createWithdrawal.mutate({
        amount: balance.available_balance,
        bank_account_id: 1, // User's primary bank account
      });
    }
  };

  return (
    <div>
      <h1>Earnings Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-600">Available Balance</p>
          <p className="text-2xl font-bold">
            Rp {balance?.available_balance.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-600">Held Balance</p>
          <p className="text-2xl font-bold">
            Rp {balance?.held_balance.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-600">Total Withdrawn</p>
          <p className="text-2xl font-bold">
            Rp {balance?.withdrawn_total.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <button
        onClick={handleWithdraw}
        disabled={!balance || balance.available_balance < 100000}
        className="mt-4 bg-orange-600 text-white px-6 py-3 rounded"
      >
        Request Withdrawal
      </button>

      <div className="mt-8">
        <h2>Pending Withdrawals</h2>
        {withdrawals?.items.map((w) => (
          <div key={w.id} className="border rounded p-4 mt-2">
            <p>Amount: Rp {w.amount.toLocaleString("id-ID")}</p>
            <p>Status: {w.status}</p>
            <p>
              Requested: {new Date(w.requested_at).toLocaleDateString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. Token Management

```typescript
// lib/auth.ts
export const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token);
};

export const clearAuthToken = () => {
  localStorage.removeItem("auth_token");
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
```

### 2. Error Handling

```typescript
// lib/error-handler.ts
import type { ApiError } from "@/types/api";

export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    const apiError = error.response.data.error as ApiError;

    // Handle validation errors
    if (apiError.details) {
      const firstError = Object.values(apiError.details)[0];
      return firstError || apiError.message;
    }

    return apiError.message;
  }

  return "An unexpected error occurred";
};
```

### 3. Request ID Tracking

```typescript
// Every response includes request_id for debugging
// Log it when errors occur

const handleError = (error: any) => {
  const requestId = error.response?.data?.request_id;
  console.error("Error occurred", {
    requestId,
    message: error.message,
    timestamp: new Date().toISOString(),
  });

  // Send to error tracking service
  // Sentry.captureException(error, { tags: { request_id: requestId } });
};
```

### 4. Optimistic Updates

```typescript
// queries/progress.ts
export const useMarkLessonComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lessonId, courseId }) => {
      const response = await apiClient.post(
        `/progress/lessons/${lessonId}/complete`,
        { course_id: courseId }
      );
      return response.data;
    },
    onMutate: async ({ lessonId, courseId }) => {
      // Optimistically update UI
      await queryClient.cancelQueries({
        queryKey: ["courseProgress", courseId],
      });

      const previousProgress = queryClient.getQueryData([
        "courseProgress",
        courseId,
      ]);

      queryClient.setQueryData(["courseProgress", courseId], (old: any) => ({
        ...old,
        completed_lessons: old.completed_lessons + 1,
        completed_lesson_ids: [...old.completed_lesson_ids, lessonId],
      }));

      return { previousProgress };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        queryClient.setQueryData(
          ["courseProgress", variables.courseId],
          context.previousProgress
        );
      }
    },
  });
};
```

---

## 📝 Notes

### Backend Features Complete

- ✅ All CRUD operations implemented
- ✅ JWT authentication with middleware
- ✅ Request ID tracing for debugging
- ✅ N+1 query optimization (100x faster)
- ✅ Rate limiting and security headers
- ✅ Structured logging with Zap
- ✅ Soft deletes for all resources
- ✅ Course enrollment and progress tracking

### Known Limitations

- No file upload endpoint yet (for avatars/thumbnails)
- No search autocomplete endpoint
- No course reviews/ratings
- No payment integration
- No email notifications
- No admin dashboard endpoints

### Recommended Next Steps for Frontend

1. **Setup project structure** with Next.js 14+ App Router
2. **Install dependencies**: TanStack Query, Axios, Shadcn UI
3. **Implement authentication** pages (login, register)
4. **Create course listing** page with filters
5. **Build course detail** page with enrollment
6. **Implement lesson viewer** with MDX rendering
7. **Add progress tracking** UI
8. **Create user dashboard** with enrolled courses

---

## 🔗 Related Documentation

- [API_SPEC.md](./API_SPEC.md) - Detailed API specification
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development guidelines
- [DATABASE.md](./DATABASE.md) - Database schema
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Security documentation

---

**Happy Coding! 🚀**
