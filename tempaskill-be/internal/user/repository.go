package user

import (
	"context"
	"errors"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/auth"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repository interface {
	FindByID(ctx context.Context, id uint) (*auth.User, error)
	List(ctx context.Context, query *UserListQuery) ([]*auth.User, int64, error)
	Update(ctx context.Context, user *auth.User) error
	UpdatePassword(ctx context.Context, id uint, hashedPassword string) error
	UpdateRole(ctx context.Context, id uint, role string) error
	UpdateStatus(ctx context.Context, id uint, status string) error
	Delete(ctx context.Context, id uint) error
	GetUserStats(ctx context.Context, userID uint) (enrolledCount int, completedCount int, err error)
	GetBatchUserStats(ctx context.Context, userIDs []uint) (map[uint]UserStats, error) // BATCH QUERY
	GetUserEnrollments(ctx context.Context, userID uint) ([]UserEnrollment, error)
	GetUserCertificates(ctx context.Context, userID uint) ([]UserCertificate, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) FindByID(ctx context.Context, id uint) (*auth.User, error) {
	var user auth.User
	if err := r.db.WithContext(ctx).First(&user, id).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			logger.Error("Database error finding user by ID",
				zap.Error(err),
				zap.Uint("user_id", id),
			)
		}
		return nil, err
	}
	return &user, nil
}

func (r *repository) Update(ctx context.Context, user *auth.User) error {
	err := r.db.WithContext(ctx).Model(user).Updates(user).Error
	if err != nil {
		logger.Error("Failed to update user in database",
			zap.Error(err),
			zap.Uint("user_id", user.ID),
		)
		return err
	}
	return nil
}

func (r *repository) UpdatePassword(ctx context.Context, id uint, hashedPassword string) error {
	err := r.db.WithContext(ctx).Model(&auth.User{}).Where("id = ?", id).Update("password", hashedPassword).Error
	if err != nil {
		logger.Error("Failed to update user password in database",
			zap.Error(err),
			zap.Uint("user_id", id),
		)
		return err
	}
	return nil
}

func (r *repository) List(ctx context.Context, query *UserListQuery) ([]*auth.User, int64, error) {
	var users []*auth.User
	var total int64

	db := r.db.WithContext(ctx).Model(&auth.User{})

	// Apply filters
	if query.Role != "" {
		db = db.Where("role = ?", query.Role)
	}

	if query.Search != "" {
		searchPattern := "%" + query.Search + "%"
		db = db.Where("name LIKE ? OR email LIKE ?", searchPattern, searchPattern)
	}

	// Count total
	if err := db.Count(&total).Error; err != nil {
		logger.Error("Failed to count users", zap.Error(err))
		return nil, 0, err
	}

	// Apply pagination
	offset := (query.Page - 1) * query.Limit
	if err := db.Order("created_at DESC").Offset(offset).Limit(query.Limit).Find(&users).Error; err != nil {
		logger.Error("Failed to list users", zap.Error(err))
		return nil, 0, err
	}

	return users, total, nil
}

func (r *repository) UpdateRole(ctx context.Context, id uint, role string) error {
	err := r.db.WithContext(ctx).Model(&auth.User{}).Where("id = ?", id).Update("role", role).Error
	if err != nil {
		logger.Error("Failed to update user role in database",
			zap.Error(err),
			zap.Uint("user_id", id),
		)
		return err
	}
	return nil
}

func (r *repository) UpdateStatus(ctx context.Context, id uint, status string) error {
	err := r.db.WithContext(ctx).Model(&auth.User{}).Where("id = ?", id).Update("status", status).Error
	if err != nil {
		logger.Error("Failed to update user status in database",
			zap.Error(err),
			zap.Uint("user_id", id),
		)
		return err
	}
	return nil
}

func (r *repository) Delete(ctx context.Context, id uint) error {
	err := r.db.WithContext(ctx).Delete(&auth.User{}, id).Error
	if err != nil {
		logger.Error("Failed to delete user from database",
			zap.Error(err),
			zap.Uint("user_id", id),
		)
		return err
	}
	return nil
}

func (r *repository) GetUserStats(ctx context.Context, userID uint) (enrolledCount int, completedCount int, err error) {
	// Count enrolled courses
	var enrolled int64
	err = r.db.WithContext(ctx).Table("enrollments").Where("user_id = ?", userID).Count(&enrolled).Error
	if err != nil {
		logger.Error("Failed to count user enrollments", zap.Error(err), zap.Uint("user_id", userID))
		return 0, 0, err
	}

	// Count completed courses
	// A course is completed when ALL lessons in that course are completed by the user
	var completed int64
	query := `
		SELECT COUNT(DISTINCT e.course_id)
		FROM enrollments e
		WHERE e.user_id = ?
		AND NOT EXISTS (
			SELECT 1 FROM lessons l
			WHERE l.course_id = e.course_id
			AND NOT EXISTS (
				SELECT 1 FROM lesson_progress lp
				WHERE lp.user_id = e.user_id
				AND lp.lesson_id = l.id
			)
		)
	`
	err = r.db.WithContext(ctx).Raw(query, userID).Count(&completed).Error
	if err != nil {
		logger.Error("Failed to count completed courses", zap.Error(err), zap.Uint("user_id", userID))
		return 0, 0, err
	}

	return int(enrolled), int(completed), nil
}

// GetBatchUserStats fetches stats for multiple users in ONE query (N+1 fix)
func (r *repository) GetBatchUserStats(ctx context.Context, userIDs []uint) (map[uint]UserStats, error) {
	if len(userIDs) == 0 {
		return make(map[uint]UserStats), nil
	}

	type StatsRow struct {
		UserID         uint `gorm:"column:user_id"`
		EnrolledCount  int  `gorm:"column:enrolled_count"`
		CompletedCount int  `gorm:"column:completed_count"`
	}

	var results []StatsRow

	// Single optimized query to get both enrolled and completed counts for all users
	query := `
		SELECT 
			e.user_id,
			COUNT(DISTINCT e.course_id) as enrolled_count,
			COUNT(DISTINCT CASE 
				WHEN NOT EXISTS (
					SELECT 1 FROM lessons l
					WHERE l.course_id = e.course_id
					AND l.deleted_at IS NULL
					AND NOT EXISTS (
						SELECT 1 FROM lesson_progress lp
						WHERE lp.user_id = e.user_id
						AND lp.lesson_id = l.id
					)
				) THEN e.course_id 
			END) as completed_count
		FROM enrollments e
		WHERE e.user_id IN (?) AND e.deleted_at IS NULL
		GROUP BY e.user_id
	`

	err := r.db.WithContext(ctx).Raw(query, userIDs).Scan(&results).Error
	if err != nil {
		logger.Error("Failed to batch fetch user stats", zap.Error(err))
		return nil, err
	}

	// Convert to map for O(1) lookup
	statsMap := make(map[uint]UserStats)
	for _, row := range results {
		statsMap[row.UserID] = UserStats{
			EnrolledCount:  row.EnrolledCount,
			CompletedCount: row.CompletedCount,
		}
	}

	// Fill in zeros for users with no enrollments
	for _, userID := range userIDs {
		if _, exists := statsMap[userID]; !exists {
			statsMap[userID] = UserStats{
				EnrolledCount:  0,
				CompletedCount: 0,
			}
		}
	}

	return statsMap, nil
}

func (r *repository) GetUserEnrollments(ctx context.Context, userID uint) ([]UserEnrollment, error) {
	var enrollments []UserEnrollment

	// Query based on actual database schema
	// Table: enrollments (user_id, course_id, enrolled_at)
	// Table: lesson_progress (for calculating progress percentage)
	err := r.db.WithContext(ctx).
		Table("enrollments e").
		Select(`
			c.id,
			c.title,
			c.slug,
			COALESCE(c.thumbnail_url, '') as thumbnail_url,
			COALESCE(
				(SELECT COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM lessons WHERE course_id = c.id), 0)
				 FROM lesson_progress lp 
				 WHERE lp.user_id = e.user_id AND lp.course_id = e.course_id), 
				0
			) as progress_percentage,
			e.enrolled_at,
			COALESCE(
				(SELECT MAX(completed_at) FROM lesson_progress lp WHERE lp.user_id = e.user_id AND lp.course_id = e.course_id),
				e.enrolled_at
			) as last_accessed_at,
			NULL as completed_at
		`).
		Joins("JOIN courses c ON e.course_id = c.id").
		Where("e.user_id = ?", userID).
		Order("e.enrolled_at DESC").
		Scan(&enrollments).Error

	if err != nil {
		logger.Error("Failed to get user enrollments", zap.Error(err), zap.Uint("user_id", userID))
		return nil, err
	}

	return enrollments, nil
}

// GetUserCertificates fetches all certificates earned by a user
func (r *repository) GetUserCertificates(ctx context.Context, userID uint) ([]UserCertificate, error) {
	var certificates []UserCertificate

	query := `
		SELECT 
			cert.id,
			cert.course_id,
			c.title AS course_title,
			c.slug AS course_slug,
			cert.certificate_id,
			cert.issued_at
		FROM certificates cert
		INNER JOIN courses c ON cert.course_id = c.id
		WHERE cert.user_id = ?
		ORDER BY cert.issued_at DESC
	`

	rows, err := r.db.WithContext(ctx).Raw(query, userID).Rows()
	if err != nil {
		logger.Error("Failed to get user certificates", zap.Error(err), zap.Uint("user_id", userID))
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var cert UserCertificate
		var issuedAt interface{}

		err := rows.Scan(
			&cert.ID,
			&cert.CourseID,
			&cert.CourseTitle,
			&cert.CourseSlug,
			&cert.CertificateID,
			&issuedAt,
		)
		if err != nil {
			logger.Error("Failed to scan certificate", zap.Error(err))
			continue
		}

		// Format date
		if t, ok := issuedAt.([]uint8); ok {
			cert.IssuedAt = string(t)
		}

		certificates = append(certificates, cert)
	}

	return certificates, nil
}
