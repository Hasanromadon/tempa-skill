package certificate

import (
	"time"
)

type Certificate struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `json:"user_id"`
	CourseID     uint      `json:"course_id"`
	IssuedAt     time.Time `json:"issued_at"`
	CertificateID string   `gorm:"size:32;uniqueIndex" json:"certificate_id"`
}
