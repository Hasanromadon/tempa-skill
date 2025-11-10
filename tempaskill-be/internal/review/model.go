package review

import (
	"time"
)

// CourseReview represents a user review for a course
type CourseReview struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"not null;index" json:"user_id"`
	CourseID   uint      `gorm:"not null;index" json:"course_id"`
	Rating     uint      `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating" binding:"required,min=1,max=5"`
	ReviewText string    `gorm:"type:text" json:"review_text"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Relations
	User   User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Course Course `gorm:"foreignKey:CourseID" json:"course,omitempty"`
}

// TableName specifies the table name for GORM
func (CourseReview) TableName() string {
	return "course_reviews"
}

// User represents a basic user model for relations
type User struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

// Course represents a basic course model for relations
type Course struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
}