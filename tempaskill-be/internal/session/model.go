package session

import (
	"time"

	"gorm.io/gorm"
)

// Session represents a live session in the system
type Session struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	CourseID         uint           `gorm:"not null;index" json:"course_id"`
	InstructorID     uint           `gorm:"not null;index" json:"instructor_id"`
	Title            string         `gorm:"type:varchar(200);not null" json:"title"`
	Description      string         `gorm:"type:text" json:"description"`
	ScheduledAt      time.Time      `gorm:"not null;index" json:"scheduled_at"`
	DurationMinutes  int            `gorm:"not null;default:60" json:"duration_minutes"`
	MaxParticipants  int            `gorm:"not null;default:50" json:"max_participants"`
	MeetingURL       string         `gorm:"type:varchar(500)" json:"meeting_url"`
	RecordingURL     string         `gorm:"type:varchar(500)" json:"recording_url"`
	IsCancelled      bool           `gorm:"default:false;index" json:"is_cancelled"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Course            Course             `gorm:"foreignKey:CourseID" json:"course,omitempty"`
	Instructor        User               `gorm:"foreignKey:InstructorID" json:"instructor,omitempty"`
	Participants      []SessionParticipant `gorm:"foreignKey:SessionID;constraint:OnDelete:CASCADE" json:"participants,omitempty"`
	ParticipantCount  int                `gorm:"-" json:"participant_count"`
}

// SessionParticipant represents a user's participation in a session
type SessionParticipant struct {
	SessionID    uint      `gorm:"primaryKey;not null" json:"session_id"`
	UserID       uint      `gorm:"primaryKey;not null" json:"user_id"`
	RegisteredAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"registered_at"`
	AttendedAt   *time.Time `json:"attended_at"`

	// Relations
	Session Session `gorm:"foreignKey:SessionID" json:"session,omitempty"`
	User    User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// User represents a user (simplified for session relations)
type User struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Name  string `gorm:"type:varchar(100);not null" json:"name"`
	Email string `gorm:"type:varchar(100);uniqueIndex;not null" json:"email"`
	Role  string `gorm:"type:varchar(20);not null;default:'student'" json:"role"`
}

// Course represents a course (simplified for session relations)
type Course struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Title  string `gorm:"type:varchar(200);not null" json:"title"`
	Slug   string `gorm:"type:varchar(250);uniqueIndex;not null" json:"slug"`
	Price  int    `gorm:"default:0" json:"price"`
}