// API Response Types
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

// User Types
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

// Course Types
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

// Lesson Types
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

// Progress Types
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

// Enrollment Types
export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  progress: number;
  enrolled_at: string;
  updated_at: string;
}
