package admin

import (
	"context"
	"time"

	"gorm.io/gorm"
)

type Service interface {
	GetDashboardStats(ctx context.Context) (*DashboardStats, error)
}

type service struct {
	db *gorm.DB
}

func NewService(db *gorm.DB) Service {
	return &service{db: db}
}

// GetDashboardStats retrieves aggregated statistics for admin dashboard
// Uses efficient COUNT queries instead of fetching all records
func (s *service) GetDashboardStats(ctx context.Context) (*DashboardStats, error) {
	stats := &DashboardStats{}

	// 1. Count total courses
	if err := s.db.Table("courses").Count(&stats.TotalCourses).Error; err != nil {
		return nil, err
	}

	// 2. Count published courses
	if err := s.db.Table("courses").Where("is_published = ?", true).Count(&stats.PublishedCourses).Error; err != nil {
		return nil, err
	}

	// 3. Count unpublished courses
	stats.UnpublishedCourses = stats.TotalCourses - stats.PublishedCourses

	// 4. Count total students (role = 'student')
	if err := s.db.Table("users").Where("role = ?", "student").Count(&stats.TotalStudents).Error; err != nil {
		return nil, err
	}

	// 5. Count total instructors (role = 'instructor')
	if err := s.db.Table("users").Where("role = ?", "instructor").Count(&stats.TotalInstructors).Error; err != nil {
		return nil, err
	}

	// 6. Count total enrollments
	if err := s.db.Table("enrollments").Count(&stats.TotalEnrollments).Error; err != nil {
		return nil, err
	}

	// 7. Calculate total revenue from completed payments
	var totalRevenue float64
	if err := s.db.Table("payment_transactions").
		Where("transaction_status = ?", "settlement").
		Select("COALESCE(SUM(gross_amount), 0)").
		Scan(&totalRevenue).Error; err != nil {
		return nil, err
	}
	stats.TotalRevenue = totalRevenue

	// 8. Count pending payments
	if err := s.db.Table("payment_transactions").
		Where("transaction_status = ?", "pending").
		Count(&stats.PendingPayments).Error; err != nil {
		return nil, err
	}

	// 9. Count completed payments
	if err := s.db.Table("payment_transactions").
		Where("transaction_status = ?", "settlement").
		Count(&stats.CompletedPayments).Error; err != nil {
		return nil, err
	}

	// 10. Count total lessons
	if err := s.db.Table("lessons").Count(&stats.TotalLessons).Error; err != nil {
		return nil, err
	}

	// 11. Count total sessions
	if err := s.db.Table("sessions").Count(&stats.TotalSessions).Error; err != nil {
		return nil, err
	}

	// 12. Count upcoming sessions (scheduled_at > now AND is_cancelled = false)
	if err := s.db.Table("sessions").
		Where("scheduled_at > ? AND is_cancelled = ?", time.Now(), false).
		Count(&stats.UpcomingSessions).Error; err != nil {
		return nil, err
	}

	return stats, nil
}
