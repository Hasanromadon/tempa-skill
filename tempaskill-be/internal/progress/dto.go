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
	CourseID           uint       `json:"course_id"`
	Title              string     `json:"title"`
	Slug               string     `json:"slug"`                 // Add slug for frontend navigation
	CourseTitle        string     `json:"course_title"`         // Alias for frontend compatibility
	CourseSlug         string     `json:"course_slug"`          // Alias for frontend compatibility
	ThumbnailURL       *string    `json:"thumbnail_url"`
	Percentage         float64    `json:"percentage"`
	ProgressPercentage float64    `json:"progress_percentage"`  // Alias for frontend compatibility
	CompletedLessons   int        `json:"completed_lessons"`
	TotalLessons       int        `json:"total_lessons"`
	LastAccessed       *time.Time `json:"last_accessed"`
	LastActivity       *time.Time `json:"last_activity"`        // Alias for frontend compatibility
	Status             string     `json:"status"`               // "not_started", "in_progress", "completed"
	IsCompleted        bool       `json:"is_completed"`         // Computed from status
	CompletedAt        *time.Time `json:"completed_at,omitempty"`
	EnrolledAt         *time.Time `json:"enrolled_at,omitempty"` // Add enrolled_at timestamp
}
