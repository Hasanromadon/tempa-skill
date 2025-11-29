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
