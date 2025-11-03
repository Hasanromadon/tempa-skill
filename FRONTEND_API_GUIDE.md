# 🎨 Frontend API Integration Guide

> Complete guide for integrating Next.js frontend with TempaSKill Backend API

**Last Updated**: November 3, 2025  
**Backend Version**: 1.0.0  
**Base URL**: `http://localhost:8080/api/v1`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Response Structure](#response-structure)
- [Authentication Flow](#authentication-flow)
- [API Endpoints](#api-endpoints)
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

| Method | Endpoint          | Auth Required | Description          | Rate Limit     |
| ------ | ----------------- | ------------- | -------------------- | -------------- |
| POST   | `/auth/register`  | ❌            | Register new user    | 10 req/min     |
| POST   | `/auth/login`     | ❌            | Login user           | 10 req/min     |
| GET    | `/auth/me`        | ✅            | Get current user     | 100 req/min    |

---

### User Endpoints

| Method | Endpoint      | Auth Required | Description       | Rate Limit  |
| ------ | ------------- | ------------- | ----------------- | ----------- |
| GET    | `/users/:id`  | ❌            | Get user by ID    | 100 req/min |
| PATCH  | `/users/me`   | ✅            | Update profile    | 100 req/min |
| PUT    | `/users/me/password` | ✅     | Change password   | 100 req/min |

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

| Method | Endpoint                    | Auth Required | Description              | Rate Limit  |
| ------ | --------------------------- | ------------- | ------------------------ | ----------- |
| POST   | `/courses`                  | ✅ (admin)    | Create course            | 100 req/min |
| GET    | `/courses`                  | ❌            | List courses (paginated) | 100 req/min |
| GET    | `/courses/:id`              | ❌            | Get course by ID         | 100 req/min |
| GET    | `/courses/slug/:slug`       | ❌            | Get course by slug       | 100 req/min |
| PUT    | `/courses/:id`              | ✅ (admin)    | Update course            | 100 req/min |
| DELETE | `/courses/:id`              | ✅ (admin)    | Delete course (soft)     | 100 req/min |
| POST   | `/courses/:id/enroll`       | ✅            | Enroll in course         | 100 req/min |
| DELETE | `/courses/:id/enroll`       | ✅            | Unenroll from course     | 100 req/min |

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

| Method | Endpoint                      | Auth Required | Description          | Rate Limit  |
| ------ | ----------------------------- | ------------- | -------------------- | ----------- |
| POST   | `/courses/:id/lessons`        | ✅ (admin)    | Create lesson        | 100 req/min |
| GET    | `/courses/:id/lessons`        | ❌            | List course lessons  | 100 req/min |
| GET    | `/courses/:courseId/lessons/:id` | ❌         | Get lesson by ID     | 100 req/min |
| PUT    | `/courses/:courseId/lessons/:id` | ✅ (admin) | Update lesson        | 100 req/min |
| DELETE | `/courses/:courseId/lessons/:id` | ✅ (admin) | Delete lesson        | 100 req/min |

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

| Method | Endpoint                                    | Auth Required | Description               | Rate Limit  |
| ------ | ------------------------------------------- | ------------- | ------------------------- | ----------- |
| POST   | `/progress/lessons/:lessonId/complete`      | ✅            | Mark lesson complete      | 100 req/min |
| GET    | `/progress/courses/:courseId`               | ✅            | Get course progress       | 100 req/min |
| GET    | `/progress/me`                              | ✅            | Get all user progress     | 100 req/min |

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

## 📊 Data Models

### User

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
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
  difficulty: 'beginner' | 'intermediate' | 'advanced';
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

---

## ⚠️ Error Handling

### Common Error Codes

| Code                  | HTTP Status | Description                        |
| --------------------- | ----------- | ---------------------------------- |
| `VALIDATION_ERROR`    | 400         | Invalid input data                 |
| `UNAUTHORIZED`        | 401         | Missing or invalid auth token      |
| `FORBIDDEN`           | 403         | Insufficient permissions           |
| `NOT_FOUND`           | 404         | Resource not found                 |
| `CONFLICT`            | 409         | Duplicate entry (e.g., email)      |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests                  |
| `INTERNAL_ERROR`      | 500         | Server error                       |

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

| Category           | Limit          | Window  | Endpoints                     |
| ------------------ | -------------- | ------- | ----------------------------- |
| General API        | 100 req        | 1 min   | Most endpoints                |
| Authentication     | 10 req         | 1 min   | `/auth/register`, `/auth/login` |
| Public (No auth)   | No limit       | -       | Health check                  |

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
  const response = await fetch('/api/v1/courses');
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
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
  role: 'student' | 'instructor' | 'admin';
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

export interface CourseListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
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
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
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
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Authentication Queries

```typescript
// queries/auth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { 
  ApiResponse, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest,
  User 
} from '@/types/api';

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/register',
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
      }
    },
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<ApiResponse<AuthResponse>>(
        '/auth/login',
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      if (data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
      }
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { 
  ApiResponse, 
  Course, 
  CourseListQuery, 
  CourseListResponse 
} from '@/types/api';

export const useCourses = (params?: CourseListQuery) => {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CourseListResponse>>(
        '/courses',
        { params }
      );
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCourse = (slug: string) => {
  return useQuery({
    queryKey: ['course', slug],
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
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
};
```

### Progress Queries

```typescript
// queries/progress.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { 
  ApiResponse, 
  CourseProgress,
  UserProgress,
  MarkLessonCompleteRequest 
} from '@/types/api';

export const useCourseProgress = (courseId: number) => {
  return useQuery({
    queryKey: ['courseProgress', courseId],
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
    queryKey: ['userProgress'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<UserProgress[]>>(
        '/progress/me'
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
      courseId 
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
        queryKey: ['courseProgress', variables.courseId] 
      });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    },
  });
};
```

### Usage in Components

```typescript
// app/courses/page.tsx
'use client';

import { useCourses } from '@/queries/courses';
import { useState } from 'react';

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
'use client';

import { useCourse, useEnrollCourse } from '@/queries/courses';
import { useParams } from 'next/navigation';

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
        <button 
          onClick={handleEnroll}
          disabled={enrollMutation.isPending}
        >
          {enrollMutation.isPending ? 'Enrolling...' : 'Enroll Now'}
        </button>
      )}
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
  return localStorage.getItem('auth_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
```

### 2. Error Handling

```typescript
// lib/error-handler.ts
import type { ApiError } from '@/types/api';

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
  
  return 'An unexpected error occurred';
};
```

### 3. Request ID Tracking

```typescript
// Every response includes request_id for debugging
// Log it when errors occur

const handleError = (error: any) => {
  const requestId = error.response?.data?.request_id;
  console.error('Error occurred', {
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
        queryKey: ['courseProgress', courseId] 
      });
      
      const previousProgress = queryClient.getQueryData(['courseProgress', courseId]);
      
      queryClient.setQueryData(['courseProgress', courseId], (old: any) => ({
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
          ['courseProgress', variables.courseId],
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
