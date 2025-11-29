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

	// Count completed courses (100% progress)
	var completed int64
	err = r.db.WithContext(ctx).Table("enrollments").
		Where("user_id = ? AND progress_percentage = ?", userID, 100).
		Count(&completed).Error
	if err != nil {
		logger.Error("Failed to count completed courses", zap.Error(err), zap.Uint("user_id", userID))
		return 0, 0, err
	}

	return int(enrolled), int(completed), nil
}
