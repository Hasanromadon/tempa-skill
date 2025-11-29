package auth

import (
	"errors"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// Repository handles database operations for users
type Repository interface {
	Create(user *User) error
	FindByEmail(email string) (*User, error)
	FindByID(id uint) (*User, error)
	Update(user *User) error
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new auth repository
func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// Create inserts a new user into the database
func (r *repository) Create(user *User) error {
	err := r.db.Create(user).Error
	if err != nil {
		logger.Error("Failed to create user in database",
			zap.Error(err),
			zap.String("email", user.Email),
		)
		return err
	}
	return nil
}

// FindByEmail retrieves a user by email
func (r *repository) FindByEmail(email string) (*User, error) {
	var user User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		logger.Error("Database error finding user by email",
			zap.Error(err),
			zap.String("email", email),
		)
		return nil, err
	}
	return &user, nil
}

// FindByID retrieves a user by ID
func (r *repository) FindByID(id uint) (*User, error) {
	var user User
	err := r.db.First(&user, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		logger.Error("Database error finding user by ID",
			zap.Error(err),
			zap.Uint("user_id", id),
		)
		return nil, err
	}
	return &user, nil
}

// Update updates user data
func (r *repository) Update(user *User) error {
	err := r.db.Save(user).Error
	if err != nil {
		logger.Error("Failed to update user in database",
			zap.Error(err),
			zap.Uint("user_id", user.ID),
		)
		return err
	}
	return nil
}
