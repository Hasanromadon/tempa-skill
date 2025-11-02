package progress

import (
	"time"
)

// LessonProgress tracks user progress on individual lessons
type LessonProgress struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"not null;index:idx_user_lesson,unique" json:"user_id"`
	LessonID    uint      `gorm:"not null;index:idx_user_lesson,unique;index:idx_lesson" json:"lesson_id"`
	CourseID    uint      `gorm:"not null;index:idx_user_course" json:"course_id"`
	CompletedAt time.Time `gorm:"not null" json:"completed_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// TableName specifies the table name for LessonProgress
func (LessonProgress) TableName() string {
	return "lesson_progress"
}
