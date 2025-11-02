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
