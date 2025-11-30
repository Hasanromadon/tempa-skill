// Application constants

export const APP_NAME = "TempaSKill";
export const APP_DESCRIPTION =
  "Platform pembelajaran hybrid dengan konten berbasis teks dan sesi live interaktif";

// Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  COURSES: "/courses",
  PAYMENTS: "/payments",
  SESSIONS: "/sessions",
  COURSE_DETAIL: (slug: string) => `/courses/${slug}`,
  LESSON_DETAIL: (courseSlug: string, lessonSlug: string) =>
    `/courses/${courseSlug}/lessons/${lessonSlug}`,
  SESSION_DETAIL: (id: number) => `/sessions/${id}`,
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    COURSES: "/admin/courses",
    PAYMENTS: "/admin/payments",
    SESSIONS: "/admin/sessions",
    SESSIONS_NEW: "/admin/sessions/new",
    COURSE_NEW: "/admin/courses/new",
    COURSE_EDIT: (id: number) => `/admin/courses/${id}/edit`,
    COURSE_LESSONS: (courseId: number) => `/admin/courses/${courseId}/lessons`,
    LESSON_NEW: (courseId: number) => `/admin/courses/${courseId}/lessons/new`,
    LESSON_EDIT: (courseId: number, lessonId: number) =>
      `/admin/courses/${courseId}/lessons/${lessonId}/edit`,
    USERS: "/admin/users",
    SETTINGS: "/admin/settings",
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
  },
  COURSES: {
    LIST: "/courses",
    DETAIL: (slug: string) => `/courses/slug/${slug}`,
    BY_ID: (id: number) => `/courses/${id}`,
    CREATE: "/courses",
    UPDATE: (id: number) => `/courses/${id}`,
    DELETE: (id: number) => `/courses/${id}`,
    ENROLL: (id: number) => `/courses/${id}/enroll`,
    LESSONS: (id: number) => `/courses/${id}/lessons`,
  },
  LESSONS: {
    DETAIL: (id: number) => `/lessons/${id}`,
    CREATE: (courseId: number) => `/courses/${courseId}/lessons`,
    UPDATE: (id: number) => `/lessons/${id}`,
    DELETE: (id: number) => `/lessons/${id}`,
    REORDER: "/lessons/reorder",
  },
  PROGRESS: {
    COURSE: (courseId: number) => `/progress/courses/${courseId}`,
    USER: "/progress/me",
    COMPLETE_LESSON: (lessonId: number) =>
      `/progress/lessons/${lessonId}/complete`,
  },
  USERS: {
    DETAIL: (id: number) => `/users/${id}`,
    UPDATE_PROFILE: "/users/me",
    CHANGE_PASSWORD: "/users/me/password",
  },
  INSTRUCTOR: {
    STUDENTS: "/instructor/students",
  },
  UPLOAD: {
    IMAGE: "/upload/image",
  },
  PAYMENT: {
    CREATE_TRANSACTION: "/payment/create-transaction",
    CHECK_STATUS: (orderId: string) => `/payment/status/${orderId}`,
    WEBHOOK: "/payment/webhook",
    LIST: "/payment/list",
    STATS: "/payment/stats",
  },
  REVIEWS: {
    LIST: "/reviews",
    DETAIL: (id: number) => `/reviews/${id}`,
    CREATE: "/reviews",
    UPDATE: (id: number) => `/reviews/${id}`,
    DELETE: (id: number) => `/reviews/${id}`,
    BY_USER: "/reviews/user",
    BY_COURSE: (courseId: number) => `/reviews/courses/${courseId}`,
    COURSE_SUMMARY: (courseId: number) =>
      `/reviews/courses/${courseId}/summary`,
  },
  SESSIONS: {
    LIST: "/sessions",
    DETAIL: (id: number) => `/sessions/${id}`,
    CREATE: "/sessions",
    UPDATE: (id: number) => `/sessions/${id}`,
    DELETE: (id: number) => `/sessions/${id}`,
    REGISTER: (id: number) => `/sessions/${id}/register`,
    UNREGISTER: (id: number) => `/sessions/${id}/register`,
    PARTICIPANTS: (id: number) => `/sessions/${id}/participants`,
    MARK_ATTENDANCE: (sessionId: number, participantId: number) =>
      `/sessions/${sessionId}/attendance/${participantId}`,
  },
  ADMIN: {
    STATS: "/admin/stats",
  },
} as const;

// Difficulty levels
export const DIFFICULTY_LABELS = {
  beginner: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
} as const;

export const DIFFICULTY_COLORS = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
} as const;

// Course categories
export const CATEGORY_LABELS = {
  "Web Development": "Pengembangan Web",
  "Mobile Development": "Pengembangan Mobile",
  "Data Science": "Sains Data",
  DevOps: "DevOps",
  "UI/UX Design": "Desain UI/UX",
  Backend: "Backend",
  Frontend: "Frontend",
} as const;

export const CATEGORY_COLORS = {
  "Web Development": "bg-blue-100 text-blue-800",
  "Mobile Development": "bg-purple-100 text-purple-800",
  "Data Science": "bg-pink-100 text-pink-800",
  DevOps: "bg-indigo-100 text-indigo-800",
  "UI/UX Design": "bg-orange-100 text-orange-800",
  Backend: "bg-gray-100 text-gray-800",
  Frontend: "bg-cyan-100 text-cyan-800",
} as const;

// Pagination
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
} as const;

// Validation
export const PASSWORD_MIN_LENGTH = 6;
export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 100;

// Messages
export const MESSAGES = {
  AUTH: {
    LOGIN_SUCCESS: "Berhasil masuk",
    LOGOUT_SUCCESS: "Berhasil keluar",
    REGISTER_SUCCESS: "Akun berhasil dibuat",
    UNAUTHORIZED: "Anda harus masuk terlebih dahulu",
  },
  COURSE: {
    ENROLL_SUCCESS: "Berhasil mendaftar kursus",
    ALREADY_ENROLLED: "Anda sudah terdaftar di kursus ini",
    NOT_ENROLLED: "Anda belum terdaftar di kursus ini",
  },
  LESSON: {
    COMPLETE_SUCCESS: "Pelajaran selesai",
    CONTENT_NOT_FOUND: "Konten pelajaran tidak ditemukan",
  },
  ERROR: {
    GENERIC: "Terjadi kesalahan. Silakan coba lagi.",
    NETWORK: "Koneksi jaringan bermasalah",
    NOT_FOUND: "Halaman tidak ditemukan",
  },
} as const;
