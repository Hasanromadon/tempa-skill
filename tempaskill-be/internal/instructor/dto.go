package instructor

import "time"

// InstructorStudentResponse represents a student enrolled in instructor's courses
type InstructorStudentResponse struct {
	ID             uint      `json:"id"`
	Name           string    `json:"name"`
	Email          string    `json:"email"`
	AvatarURL      string    `json:"avatar_url,omitempty"`
	EnrolledCourses []string `json:"enrolled_courses"`      // List of course titles
	TotalEnrollments int     `json:"total_enrollments"`     // Count of courses enrolled
	CompletedCourses int     `json:"completed_courses"`     // Count of courses completed
	OverallProgress  float64  `json:"overall_progress"`     // Average progress across all courses
	JoinedAt         string   `json:"joined_at"`            // First enrollment date
	LastActive       *time.Time `json:"last_active,omitempty"` // Last lesson progress update
}

// InstructorStudentListResult represents paginated student list
type InstructorStudentListResult struct {
	Students   []InstructorStudentResponse `json:"students"`
	Total      int64                       `json:"total"`
	Page       int                         `json:"page"`
	Limit      int                         `json:"limit"`
	TotalPages int                         `json:"total_pages"`
}

// StudentListQuery represents query parameters for listing students
type StudentListQuery struct {
	Page      int    `form:"page" binding:"min=0"`
	Limit     int    `form:"limit" binding:"min=0,max=100"`
	Search    string `form:"search"`    // Search by name or email
	CourseID  uint   `form:"course_id"` // Filter by specific course
}

// CourseListQuery represents query parameters for listing instructor's courses
type CourseListQuery struct {
	Page       int     `form:"page" binding:"min=0"`
	Limit      int     `form:"limit" binding:"min=0,max=100"`
	Search     string  `form:"search"`     // Search by title or description
	Category   string  `form:"category"`   // Filter by category
	Difficulty string  `form:"difficulty"` // Filter by difficulty level
	Published  *bool   `form:"published"`  // Filter by published status
	SortBy     string  `form:"sort_by"`    // Sort field (created_at, title, etc)
	SortOrder  string  `form:"sort_order"` // Sort order (asc/desc)
}

// InstructorCourseResponse represents a course in instructor's list
type InstructorCourseResponse struct {
	ID               uint    `json:"id"`
	Title            string  `json:"title"`
	Slug             string  `json:"slug"`
	Description      string  `json:"description"`
	Category         string  `json:"category"`
	Difficulty       string  `json:"difficulty"`
	Price            float64 `json:"price"`
	ThumbnailURL     string  `json:"thumbnail_url,omitempty"`
	Published        bool    `json:"published"`
	TotalLessons     int     `json:"total_lessons"`
	TotalStudents    int     `json:"total_students"`
	TotalEnrollments int     `json:"total_enrollments"`
	TotalRevenue     float64 `json:"total_revenue"`
	AverageRating    float64 `json:"average_rating"`
	TotalReviews     int     `json:"total_reviews"`
	CreatedAt        string  `json:"created_at"`
	UpdatedAt        string  `json:"updated_at"`
}

// InstructorCourseListResult represents paginated course list for instructor
type InstructorCourseListResult struct {
	Courses    []InstructorCourseResponse `json:"courses"`
	Total      int64                      `json:"total"`
	Page       int                        `json:"page"`
	Limit      int                        `json:"limit"`
	TotalPages int                        `json:"total_pages"`
}
