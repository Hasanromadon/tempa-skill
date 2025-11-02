package course

import (
	"time"

	"gorm.io/gorm"
)

// Course represents a course in the system
type Course struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Title         string         `gorm:"type:varchar(200);not null" json:"title"`
	Slug          string         `gorm:"type:varchar(250);uniqueIndex;not null" json:"slug"`
	Description   string         `gorm:"type:text" json:"description"`
	ThumbnailURL  string         `gorm:"type:varchar(255)" json:"thumbnail_url"`
	Category      string         `gorm:"type:varchar(50);not null" json:"category"`
	Difficulty    string         `gorm:"type:varchar(20);not null;default:'beginner'" json:"difficulty"` // beginner, intermediate, advanced
	InstructorID  uint           `gorm:"not null;index" json:"instructor_id"`
	Price         int            `gorm:"default:0" json:"price"` // in cents/rupiah
	IsPublished   bool           `gorm:"default:false" json:"is_published"`
	EnrolledCount int            `gorm:"default:0" json:"enrolled_count"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Lessons     []Lesson     `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"lessons,omitempty"`
	Enrollments []Enrollment `gorm:"foreignKey:CourseID;constraint:OnDelete:CASCADE" json:"-"`
}

// Lesson represents a lesson within a course
type Lesson struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	CourseID    uint           `gorm:"not null;index" json:"course_id"`
	Title       string         `gorm:"type:varchar(200);not null" json:"title"`
	Slug        string         `gorm:"type:varchar(250);not null" json:"slug"`
	Content     string         `gorm:"type:longtext" json:"content"` // MDX content
	OrderIndex  int            `gorm:"not null;default:0" json:"order_index"`
	Duration    int            `gorm:"default:0" json:"duration"` // estimated reading time in minutes
	IsPublished bool           `gorm:"default:false" json:"is_published"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Enrollment represents a student's enrollment in a course
type Enrollment struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `gorm:"not null;index" json:"user_id"`
	CourseID   uint           `gorm:"not null;index" json:"course_id"`
	Progress   int            `gorm:"default:0" json:"progress"` // percentage 0-100
	EnrolledAt time.Time      `json:"enrolled_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Course model
func (Course) TableName() string {
	return "courses"
}

// TableName specifies the table name for Lesson model
func (Lesson) TableName() string {
	return "lessons"
}

// TableName specifies the table name for Enrollment model
func (Enrollment) TableName() string {
	return "enrollments"
}

// CourseResponse is the sanitized course data for API responses
type CourseResponse struct {
	ID            uint      `json:"id"`
	Title         string    `json:"title"`
	Slug          string    `json:"slug"`
	Description   string    `json:"description"`
	ThumbnailURL  string    `json:"thumbnail_url"`
	Category      string    `json:"category"`
	Difficulty    string    `json:"difficulty"`
	InstructorID  uint      `json:"instructor_id"`
	Price         int       `json:"price"`
	IsPublished   bool      `json:"is_published"`
	EnrolledCount int       `json:"enrolled_count"`
	LessonCount   int       `json:"lesson_count"`
	IsEnrolled    bool      `json:"is_enrolled"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// ToResponse converts Course to CourseResponse
func (c *Course) ToResponse(lessonCount int, isEnrolled bool) *CourseResponse {
	return &CourseResponse{
		ID:            c.ID,
		Title:         c.Title,
		Slug:          c.Slug,
		Description:   c.Description,
		ThumbnailURL:  c.ThumbnailURL,
		Category:      c.Category,
		Difficulty:    c.Difficulty,
		InstructorID:  c.InstructorID,
		Price:         c.Price,
		IsPublished:   c.IsPublished,
		EnrolledCount: c.EnrolledCount,
		LessonCount:   lessonCount,
		IsEnrolled:    isEnrolled,
		CreatedAt:     c.CreatedAt,
		UpdatedAt:     c.UpdatedAt,
	}
}

// LessonResponse is the sanitized lesson data for API responses
type LessonResponse struct {
	ID          uint      `json:"id"`
	CourseID    uint      `json:"course_id"`
	Title       string    `json:"title"`
	Slug        string    `json:"slug"`
	Content     string    `json:"content,omitempty"` // Only include in detail view
	OrderIndex  int       `json:"order_index"`
	Duration    int       `json:"duration"`
	IsPublished bool      `json:"is_published"`
	CreatedAt   time.Time `json:"created_at"`
}

// ToResponse converts Lesson to LessonResponse
func (l *Lesson) ToResponse(includeContent bool) *LessonResponse {
	resp := &LessonResponse{
		ID:          l.ID,
		CourseID:    l.CourseID,
		Title:       l.Title,
		Slug:        l.Slug,
		OrderIndex:  l.OrderIndex,
		Duration:    l.Duration,
		IsPublished: l.IsPublished,
		CreatedAt:   l.CreatedAt,
	}
	
	if includeContent {
		resp.Content = l.Content
	}
	
	return resp
}
