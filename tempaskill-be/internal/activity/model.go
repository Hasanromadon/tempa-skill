package activity

import (
	"time"
)

// ActivityLog represents a user activity record
type ActivityLog struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index" json:"user_id"`
	Action      string    `gorm:"size:100;not null;index" json:"action"`
	EntityType  *string   `gorm:"size:50;index" json:"entity_type,omitempty"`
	EntityID    *uint     `gorm:"index" json:"entity_id,omitempty"`
	Description *string   `gorm:"type:text" json:"description,omitempty"`
	IPAddress   *string   `gorm:"size:45" json:"ip_address,omitempty"`
	UserAgent   *string   `gorm:"type:text" json:"user_agent,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// TableName specifies the table name for ActivityLog
func (ActivityLog) TableName() string {
	return "activity_logs"
}
