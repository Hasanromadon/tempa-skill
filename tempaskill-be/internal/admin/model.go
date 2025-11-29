package admin

// DashboardStats represents aggregated statistics for admin dashboard
type DashboardStats struct {
	TotalCourses       int64   `json:"total_courses"`
	PublishedCourses   int64   `json:"published_courses"`
	UnpublishedCourses int64   `json:"unpublished_courses"`
	TotalStudents      int64   `json:"total_students"`
	TotalInstructors   int64   `json:"total_instructors"`
	TotalEnrollments   int64   `json:"total_enrollments"`
	TotalRevenue       float64 `json:"total_revenue"`
	PendingPayments    int64   `json:"pending_payments"`
	CompletedPayments  int64   `json:"completed_payments"`
	TotalLessons       int64   `json:"total_lessons"`
	TotalSessions      int64   `json:"total_sessions"`
	UpcomingSessions   int64   `json:"upcoming_sessions"`
}
