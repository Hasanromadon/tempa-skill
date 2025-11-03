// Common type definitions used across the application

/**
 * Generic status type for async operations
 */
export type Status = "idle" | "loading" | "success" | "error";

/**
 * Course difficulty levels
 */
export type Difficulty = "beginner" | "intermediate" | "advanced";

/**
 * User roles
 */
export type UserRole = "student" | "instructor" | "admin";

/**
 * Breadcrumb item for navigation
 */
export interface Breadcrumb {
  label: string;
  href?: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Generic select option
 */
export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

/**
 * API error response
 */
export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * API success response
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * File upload data
 */
export interface FileUpload {
  file: File;
  preview?: string;
  progress?: number;
}

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

/**
 * Course category
 */
export type CourseCategory =
  | "Web Development"
  | "Mobile Development"
  | "Data Science"
  | "DevOps"
  | "UI/UX Design"
  | "Backend"
  | "Frontend";

/**
 * Sort order
 */
export type SortOrder = "asc" | "desc";

/**
 * Sort by field for courses
 */
export type CourseSortBy =
  | "title"
  | "created_at"
  | "updated_at"
  | "price"
  | "enrolled_count";

/**
 * Filter options for courses
 */
export interface CourseFilter {
  search?: string;
  category?: CourseCategory;
  difficulty?: Difficulty;
  minPrice?: number;
  maxPrice?: number;
  isFree?: boolean;
  sortBy?: CourseSortBy;
  sortOrder?: SortOrder;
}

/**
 * Query parameters for pagination
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Combined course query params
 */
export type CourseQueryParams = CourseFilter & PaginationParams;
