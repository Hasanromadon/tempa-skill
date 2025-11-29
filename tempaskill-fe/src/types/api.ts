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
  sortBy?: string;
  sortOrder?: string;
  minPrice?: number;
  maxPrice?: number;
  instructorId?: number;
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
  percentage: number;
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
  last_activity: string | null;
  enrolled_at?: string;
  status?: string;
  thumbnail_url?: string;
}

export interface UserProgressSummary {
  total_enrolled: number;
  total_completed: number;
  total_in_progress: number;
  courses: UserProgress[];
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

// Session Types
export interface Session {
  id: number;
  course_id: number;
  course_title: string;
  course_slug: string;
  instructor_id: number;
  instructor_name: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  current_participants: number;
  meeting_url?: string;
  recording_url?: string;
  is_cancelled: boolean;
  is_registered: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionParticipant {
  user_id: number;
  user_name: string;
  user_email: string;
  registered_at: string;
  attended_at?: string;
}

export interface CreateSessionRequest {
  course_id: number;
  title: string;
  description?: string;
  scheduled_at: string; // ISO 8601 format
  duration_minutes: number;
  max_participants: number;
  meeting_url?: string;
}

export interface UpdateSessionRequest {
  title?: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes?: number;
  max_participants?: number;
  meeting_url?: string;
  recording_url?: string;
  is_cancelled?: boolean;
}

export interface SessionListQuery {
  page?: number;
  limit?: number;
  course_id?: number;
  user_id?: number;
  upcoming?: boolean;
  published?: boolean;
}

export interface SessionListResponse {
  items: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Review Types
export interface Review {
  id: number;
  user_id: number;
  course_id: number;
  rating: number; // 1-5 stars
  review_text?: string;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at?: string;
  user?: {
    id: number;
    name: string;
    avatar_url?: string;
  };
}

export interface CourseReviewSummary {
  course_id: number;
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewRequest {
  course_id: number;
  rating: number; // 1-5
  review_text?: string;
}

export interface UpdateReviewRequest {
  rating?: number; // 1-5
  review_text?: string;
}

export interface ReviewListQuery {
  page?: number;
  limit?: number;
  course_id?: number;
  user_id?: number;
  rating?: number; // Filter by specific rating
  sort_by?: "created_at" | "rating" | "helpful";
  sort_order?: "asc" | "desc";
}

export interface ReviewListResponse {
  items: Review[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Certificate Types
export interface Certificate {
  certificate_id: string;
  user_name: string;
  course_title: string;
  issued_at: string;
  download_url: string;
}

export interface CertificateEligibilityResponse {
  eligible: boolean;
  certificate?: Certificate;
  progress: number;
  message: string;
}

// Admin Dashboard Stats
export interface AdminDashboardStats {
  total_courses: number;
  published_courses: number;
  unpublished_courses: number;
  total_students: number;
  total_instructors: number;
  total_enrollments: number;
  total_revenue: number;
  pending_payments: number;
  completed_payments: number;
  total_lessons: number;
  total_sessions: number;
  upcoming_sessions: number;
}
