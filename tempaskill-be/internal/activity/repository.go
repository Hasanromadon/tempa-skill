package activity

import (
	"gorm.io/gorm"
)

// Repository defines the interface for activity log operations
type Repository interface {
	Create(log *ActivityLog) error
	GetByUserID(userID uint, limit int) ([]ActivityLog, error)
	GetRecent(limit int) ([]ActivityLog, error)
}

type repository struct {
	db *gorm.DB
}

// NewRepository creates a new activity repository
func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// Create creates a new activity log
func (r *repository) Create(log *ActivityLog) error {
	return r.db.Create(log).Error
}

// GetByUserID retrieves activity logs for a specific user
func (r *repository) GetByUserID(userID uint, limit int) ([]ActivityLog, error) {
	var logs []ActivityLog
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Limit(limit).
		Find(&logs).Error
	return logs, err
}

// GetRecent retrieves recent activity logs across all users
func (r *repository) GetRecent(limit int) ([]ActivityLog, error) {
	var logs []ActivityLog
	err := r.db.Order("created_at DESC").
		Limit(limit).
		Find(&logs).Error
	return logs, err
}
