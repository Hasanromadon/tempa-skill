package admin

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type Service interface {
	GetDashboardStats(ctx context.Context, userID uint, userRole string) (*DashboardStats, error)
}

type service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) Service {
	return &service{db: db}
}

// GetDashboardStats retrieves aggregated statistics for admin/instructor dashboard
// Filters data based on user role:
// - Admin: sees ALL platform data
// - Instructor: sees only their own courses and related data
func (s *service) GetDashboardStats(ctx context.Context, userID uint, userRole string) (*DashboardStats, error) {
	stats := &DashboardStats{}

	// 1. Count total courses (filtered by instructor if not admin)
	coursesQuery := s.db.Table("courses")
	if userRole == "instructor" {
		coursesQuery = coursesQuery.Where("instructor_id = ?", userID)
	}
	if err := coursesQuery.Count(&stats.TotalCourses).Error; err != nil {
		return nil, err
	}

	// 2. Count published courses
	publishedQuery := s.db.Table("courses").Where("is_published = ?", true)
	if userRole == "instructor" {
		publishedQuery = publishedQuery.Where("instructor_id = ?", userID)
	}
	if err := publishedQuery.Count(&stats.PublishedCourses).Error; err != nil {
		return nil, err
	}

	// 3. Count unpublished courses
	stats.UnpublishedCourses = stats.TotalCourses - stats.PublishedCourses

	// 4. Count total students
	// For instructor: only students enrolled in their courses
	// For admin: all students in platform
	if userRole == "instructor" {
		// Count distinct students enrolled in instructor's courses
		if err := s.db.Table("users").
			Select("COUNT(DISTINCT users.id)").
			Joins("INNER JOIN enrollments ON enrollments.user_id = users.id").
			Joins("INNER JOIN courses ON courses.id = enrollments.course_id").
			Where("courses.instructor_id = ?", userID).
			Where("users.role = ?", "student").
			Scan(&stats.TotalStudents).Error; err != nil {
			return nil, err
		}
	} else {
		// Admin sees all students
		if err := s.db.Table("users").Where("role = ?", "student").Count(&stats.TotalStudents).Error; err != nil {
			return nil, err
		}
	}

	// 5. Count total instructors (only for admin)
	if userRole == "admin" {
		if err := s.db.Table("users").Where("role = ?", "instructor").Count(&stats.TotalInstructors).Error; err != nil {
			return nil, err
		}
	} else {
		// Instructors don't need to see total instructors
		stats.TotalInstructors = 0
	}

	// 6. Count total enrollments (filtered for instructor)
	enrollmentsQuery := s.db.Table("enrollments")
	if userRole == "instructor" {
		enrollmentsQuery = enrollmentsQuery.
			Joins("INNER JOIN courses ON courses.id = enrollments.course_id").
			Where("courses.instructor_id = ?", userID)
	}
	if err := enrollmentsQuery.Count(&stats.TotalEnrollments).Error; err != nil {
		return nil, err
	}

	// 7. Calculate total revenue from completed payments (filtered for instructor)
	var totalRevenue float64
	revenueQuery := s.db.Table("payment_transactions").
		Where("transaction_status = ?", "settlement")

	if userRole == "instructor" {
		// Revenue from instructor's courses only
		revenueQuery = revenueQuery.
			Joins("INNER JOIN courses ON courses.id = payment_transactions.course_id").
			Where("courses.instructor_id = ?", userID)
	}

	if err := revenueQuery.Select("COALESCE(SUM(gross_amount), 0)").
		Scan(&totalRevenue).Error; err != nil {
		return nil, err
	}
	stats.TotalRevenue = totalRevenue

	// 8. Count pending payments (filtered for instructor)
	pendingQuery := s.db.Table("payment_transactions").
		Where("transaction_status = ?", "pending")
	if userRole == "instructor" {
		pendingQuery = pendingQuery.
			Joins("INNER JOIN courses ON courses.id = payment_transactions.course_id").
			Where("courses.instructor_id = ?", userID)
	}
	if err := pendingQuery.Count(&stats.PendingPayments).Error; err != nil {
		return nil, err
	}

	// 9. Count completed payments (filtered for instructor)
	completedQuery := s.db.Table("payment_transactions").
		Where("transaction_status = ?", "settlement")
	if userRole == "instructor" {
		completedQuery = completedQuery.
			Joins("INNER JOIN courses ON courses.id = payment_transactions.course_id").
			Where("courses.instructor_id = ?", userID)
	}
	if err := completedQuery.Count(&stats.CompletedPayments).Error; err != nil {
		return nil, err
	}

	// 10. Count total lessons (filtered for instructor)
	lessonsQuery := s.db.Table("lessons")
	if userRole == "instructor" {
		lessonsQuery = lessonsQuery.
			Joins("INNER JOIN courses ON courses.id = lessons.course_id").
			Where("courses.instructor_id = ?", userID)
	}
	if err := lessonsQuery.Count(&stats.TotalLessons).Error; err != nil {
		return nil, err
	}

	// 11. Count total sessions (filtered for instructor)
	sessionsQuery := s.db.Table("sessions")
	if userRole == "instructor" {
		sessionsQuery = sessionsQuery.
			Joins("INNER JOIN courses ON courses.id = sessions.course_id").
			Where("courses.instructor_id = ?", userID)
	}
	if err := sessionsQuery.Count(&stats.TotalSessions).Error; err != nil {
		return nil, err
	}

	// 12. Count upcoming sessions (filtered for instructor)
	upcomingQuery := s.db.Table("sessions").
		Where("scheduled_at > ? AND is_cancelled = ?", time.Now(), false)
	if userRole == "instructor" {
		upcomingQuery = upcomingQuery.
			Joins("INNER JOIN courses ON courses.id = sessions.course_id").
			Where("courses.instructor_id = ?", userID)
	}
	if err := upcomingQuery.Count(&stats.UpcomingSessions).Error; err != nil {
		return nil, err
	}

	return stats, nil
}
