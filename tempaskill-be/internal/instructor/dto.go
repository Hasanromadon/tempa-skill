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
