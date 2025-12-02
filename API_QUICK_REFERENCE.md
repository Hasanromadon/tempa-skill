# 📋 API Quick Reference - TempaSKill

> Panduan cepat untuk frontend developer

**Base URL**: `http://localhost:8080/api/v1`  
**Semua response include**: `request_id` untuk debugging

---

## 🔑 Authentication

### Register
```http
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!"
}
```
**Response**: `{ user, token }`  
**Rate Limit**: 10/min

### Login
```http
POST /auth/login
{ "email": "john@example.com", "password": "SecurePass123!" }
```
**Response**: `{ user, token }`  
**Rate Limit**: 10/min

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## 👤 Users

### Get User by ID (Public)
```http
GET /users/:id
```

### Update Profile
```http
PATCH /users/me
Authorization: Bearer <token>
{ "name": "New Name", "bio": "...", "avatar_url": "..." }
```

### Change Password
```http
PUT /users/me/password
Authorization: Bearer <token>
{
  "current_password": "OldPass123!",
  "new_password": "NewPass123!",
  "new_password_confirmation": "NewPass123!"
}
```

---

## 📚 Courses

### List Courses (Optimized - 1 Query)
```http
GET /courses?page=1&limit=10&search=golang&category=programming&difficulty=beginner&published=true
Authorization: Bearer <token> (optional)
```
**Response**: 
```json
{
  "courses": [
    {
      "id": 1,
      "title": "...",
      "slug": "...",
      "lesson_count": 25,
      "is_enrolled": false,  // false for guest, actual status for auth users
      "enrolled_count": 150
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

### Get Course by ID
```http
GET /courses/:id
```

### Get Course by Slug
```http
GET /courses/slug/:slug
Authorization: Bearer <token> (optional)
```

### Create Course (Admin)
```http
POST /courses
Authorization: Bearer <token>
{
  "title": "Go Programming",
  "slug": "go-programming",
  "description": "...",
  "category": "programming",
  "difficulty": "beginner",
  "price": 99000,
  "is_published": true
}
```

### Update Course (Admin)
```http
PUT /courses/:id
Authorization: Bearer <token>
{ ...updates... }
```

### Delete Course (Admin)
```http
DELETE /courses/:id
Authorization: Bearer <token>
```

### Enroll in Course
```http
POST /courses/:id/enroll
Authorization: Bearer <token>
```
**Response**: `{ enrollment: { id, user_id, course_id, progress: 0 } }`

### Unenroll from Course
```http
DELETE /courses/:id/enroll
Authorization: Bearer <token>
```

---

## 📖 Lessons

### Get Course Lessons
```http
GET /courses/:id/lessons
```
**Response**: Array of lessons ordered by `order_index`

### Get Lesson by ID
```http
GET /courses/:courseId/lessons/:id
```

### Create Lesson (Admin)
```http
POST /courses/:id/lessons
Authorization: Bearer <token>
{
  "title": "Introduction to Go",
  "slug": "introduction-to-go",
  "content": "# Introduction\n\nWelcome...",
  "order_index": 1,
  "duration": 15,
  "is_published": true
}
```

### Update Lesson (Admin)
```http
PUT /courses/:courseId/lessons/:id
Authorization: Bearer <token>
{ ...updates... }
```

### Delete Lesson (Admin)
```http
DELETE /courses/:courseId/lessons/:id
Authorization: Bearer <token>
```

---

## 📊 Progress Tracking

### Mark Lesson Complete
```http
POST /progress/lessons/:lessonId/complete
Authorization: Bearer <token>
{ "course_id": 1 }
```
**Idempotent**: Safe to call multiple times  
**Response**: `{ lesson_progress: { id, user_id, lesson_id, completed_at } }`

### Get Course Progress
```http
GET /progress/courses/:courseId
Authorization: Bearer <token>
```
**Response**:
```json
{
  "course_id": 1,
  "total_lessons": 25,
  "completed_lessons": 10,
  "progress_percentage": 40,
  "is_completed": false,
  "completed_lesson_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "last_activity": "2025-11-02T10:00:00Z"
}
```

### Get All User Progress
```http
GET /progress/me
Authorization: Bearer <token>
```
**Response**: Array of course progress with course details

---

## 🎯 Response Format

### Success (200/201)
```json
{
  "success": true,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": { ... },
  "message": "Operation successful"
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Email is required"
    }
  }
}
```

---

## ⚡ Rate Limits

| Endpoint Type       | Limit       | Window  |
| ------------------- | ----------- | ------- |
| Auth (login/reg)    | 10 req      | 1 min   |
| General API         | 100 req     | 1 min   |
| Public (no auth)    | No limit    | -       |

**Headers**:
- `X-RateLimit-Limit`: Max requests
- `X-RateLimit-Remaining`: Requests left
- `X-RateLimit-Reset`: Reset timestamp

---

## 🔒 Authentication Header

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Store token from login/register response:
```typescript
localStorage.setItem('auth_token', data.token);
```

---

## ❌ Common Error Codes

| Code                  | HTTP | Description              |
| --------------------- | ---- | ------------------------ |
| `VALIDATION_ERROR`    | 400  | Invalid input            |
| `UNAUTHORIZED`        | 401  | Invalid/missing token    |
| `FORBIDDEN`           | 403  | Insufficient permissions |
| `NOT_FOUND`           | 404  | Resource not found       |
| `CONFLICT`            | 409  | Duplicate entry          |
| `RATE_LIMIT_EXCEEDED` | 429  | Too many requests        |
| `INTERNAL_ERROR`      | 500  | Server error             |

---

## 🎨 TypeScript Quick Types

```typescript
// User
interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

// Course
interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor_id: number;
  price: number;
  is_published: boolean;
  enrolled_count: number;
  lesson_count: number;
  is_enrolled: boolean;
  created_at: string;
  updated_at: string;
}

// Lesson
interface Lesson {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  content: string; // MDX format
  order_index: number;
  duration: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

// Progress
interface CourseProgress {
  course_id: number;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  is_completed: boolean;
  completed_lesson_ids: number[];
  last_activity: string;
}
```

---

## 📜 Certificates

### Check Eligibility
```http
GET /certificates?course_id=1
Authorization: Bearer <token>
```

### Issue Certificate
```http
POST /certificates/issue
{ "course_id": 1 }
```

### Get My Certificates
```http
GET /certificates/me
```

### Download Certificate PDF
```http
GET /certificates/:id/download
```

---

## 💰 Instructor Earnings

### Get Balance
```http
GET /instructor/withdrawals/balance
```

### Create Withdrawal
```http
POST /instructor/withdrawals
{
  "amount": 1000000,
  "bank_account_id": 1,
  "notes": "Withdrawal bulan Nov"
}
```

### List Withdrawals
```http
GET /instructor/withdrawals?status=pending&page=1&limit=10
```

### Get/Create Bank Account
```http
GET /instructor/withdrawals/bank-account
POST /instructor/withdrawals/bank-account
{
  "bank_name": "BCA",
  "account_number": "1234567890",
  "account_holder_name": "John Doe"
}
```

---

## 📊 Activity Logs

### Get User Activities
```http
GET /users/:id/activities?page=1&limit=20
```

### Admin: Get Recent Activities
```http
GET /admin/activities?action=course_enrollment&page=1&limit=50
Authorization: Bearer <token> (Admin)
```

---

## 👨‍🏫 Instructor Management

### List Instructors
```http
GET /instructors?search=John&specialty=programming&order_by=students&page=1&limit=10
```

### Get Instructor Detail
```http
GET /instructors/:id
```

### Get Instructor Courses
```http
GET /instructors/:id/courses?page=1&limit=10
```

### Get Instructor Stats
```http
GET /instructors/:id/stats
```

### Instructor: Get My Students
```http
GET /instructor/students?page=1&limit=20
Authorization: Bearer <token> (Instructor)
```

---

## 🔐 Admin Endpoints

### Process Withdrawal
```http
PUT /admin/withdrawals/:id/process
{ "status": "completed", "notes": "..." }
```

### Verify Bank Account
```http
PUT /admin/withdrawals/bank-accounts/:id/verify
{ "status": "verified", "notes": "..." }
```

### List Bank Accounts
```http
GET /admin/withdrawals/bank-accounts?verification_status=pending
```

---

## 📊 API Statistics

**Total Endpoints**: 100+  
**Authentication Endpoints**: 3  
**User Endpoints**: 3  
**Course Endpoints**: 12  
**Lesson Endpoints**: 6  
**Progress Endpoints**: 3  
**Payment Endpoints**: 8  
**Review Endpoints**: 4  
**Session Endpoints**: 8  
**Certificate Endpoints**: 4  
**Withdrawal Endpoints**: 12  
**Activity Endpoints**: 2  
**Instructor Endpoints**: 5  
**Admin Endpoints**: 15

---

## 🚀 Quick Setup Example

```typescript
// 1. Install dependencies
// npm install axios @tanstack/react-query

// 2. Create API client
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 3. Use in React Query
import { useQuery } from '@tanstack/react-query';

const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await api.get('/courses');
      return data.data;
    },
  });
};

// 4. Use in component
const { data, isLoading } = useCourses();
```

---

## 📚 Full Documentation

- [API_SPEC.md](./API_SPEC.md) - Complete API specification with 100+ endpoints
- [FRONTEND_API_GUIDE.md](./FRONTEND_API_GUIDE.md) - Complete guide with examples
- [DATABASE.md](./DATABASE.md) - Database schema with 15 tables

**Last Updated**: December 2, 2025  
**Version**: 2.0.0
- [API_SPEC.md](./API_SPEC.md) - Detailed API specification
- [DATABASE.md](./DATABASE.md) - Database schema

---

**Ready to build the frontend! 🎨**
