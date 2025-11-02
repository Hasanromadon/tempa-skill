package progress

import "time"

// LessonProgressResponse represents a single lesson's progress
type LessonProgressResponse struct {
	LessonID    uint       `json:"lesson_id"`
	Title       string     `json:"title"`
	IsCompleted bool       `json:"is_completed"`
	CompletedAt *time.Time `json:"completed_at"`
}

// CourseProgressResponse represents progress for a specific course
type CourseProgressResponse struct {
	CourseID         uint                      `json:"course_id"`
	UserID           uint                      `json:"user_id"`
	CompletedLessons int                       `json:"completed_lessons"`
	TotalLessons     int                       `json:"total_lessons"`
	Percentage       float64                   `json:"percentage"`
	Lessons          []*LessonProgressResponse `json:"lessons"`
	StartedAt        *time.Time                `json:"started_at"`
	LastAccessed     *time.Time                `json:"last_accessed"`
}

// UserProgressSummary represents overall user progress
type UserProgressSummary struct {
	TotalEnrolled   int                       `json:"total_enrolled"`
	TotalCompleted  int                       `json:"total_completed"`
	TotalInProgress int                       `json:"total_in_progress"`
	Courses         []*CourseProgressSummary  `json:"courses"`
}

// CourseProgressSummary represents a course in the user's progress list
type CourseProgressSummary struct {
	CourseID         uint       `json:"course_id"`
	Title            string     `json:"title"`
	ThumbnailURL     *string    `json:"thumbnail_url"`
	Percentage       float64    `json:"percentage"`
	CompletedLessons int        `json:"completed_lessons"`
	TotalLessons     int        `json:"total_lessons"`
	LastAccessed     *time.Time `json:"last_accessed"`
	Status           string     `json:"status"` // "not_started", "in_progress", "completed"
	CompletedAt      *time.Time `json:"completed_at,omitempty"`
}
