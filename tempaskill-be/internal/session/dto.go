package session

import "time"

// CreateSessionRequest represents session creation payload
type CreateSessionRequest struct {
	CourseID        uint   `json:"course_id" binding:"required"`
	Title           string `json:"title" binding:"required,min=3,max=200"`
	Description     string `json:"description" binding:"omitempty,max=1000"`
	ScheduledAt     string `json:"scheduled_at" binding:"required"` // ISO 8601 format
	DurationMinutes int    `json:"duration_minutes" binding:"required,min=15,max=480"`
	MaxParticipants int    `json:"max_participants" binding:"required,min=1,max=500"`
	MeetingURL      string `json:"meeting_url" binding:"omitempty,url,max=500"`
}

// UpdateSessionRequest represents session update payload
type UpdateSessionRequest struct {
	Title           *string `json:"title" binding:"omitempty,min=3,max=200"`
	Description     *string `json:"description" binding:"omitempty,max=1000"`
	ScheduledAt     *string `json:"scheduled_at" binding:"omitempty"` // ISO 8601 format
	DurationMinutes *int    `json:"duration_minutes" binding:"omitempty,min=15,max=480"`
	MaxParticipants *int    `json:"max_participants" binding:"omitempty,min=1,max=500"`
	MeetingURL      *string `json:"meeting_url" binding:"omitempty,url,max=500"`
	RecordingURL    *string `json:"recording_url" binding:"omitempty,url,max=500"`
	IsCancelled     *bool   `json:"is_cancelled"`
}

// RegisterParticipantRequest represents participant registration payload
type RegisterParticipantRequest struct {
	SessionID uint `json:"session_id" binding:"required"`
}

// SessionListQuery represents query parameters for listing sessions
type SessionListQuery struct {
	Page      int    `form:"page" binding:"omitempty,min=1"`
	Limit     int    `form:"limit" binding:"omitempty,min=1,max=100"`
	CourseID  uint   `form:"course_id"`
	UserID    uint   `form:"user_id"`
	Upcoming  *bool  `form:"upcoming"` // true for future sessions, false for past
	Published *bool  `form:"published"`
}

// SessionResponse represents session data in responses
type SessionResponse struct {
	ID               uint      `json:"id"`
	CourseID         uint      `json:"course_id"`
	CourseTitle      string    `json:"course_title"`
	CourseSlug       string    `json:"course_slug"`
	InstructorID     uint      `json:"instructor_id"`
	InstructorName   string    `json:"instructor_name"`
	Title            string    `json:"title"`
	Description      string    `json:"description"`
	ScheduledAt      time.Time `json:"scheduled_at"`
	DurationMinutes  int       `json:"duration_minutes"`
	MaxParticipants  int       `json:"max_participants"`
	CurrentParticipants int    `json:"current_participants"`
	MeetingURL       string    `json:"meeting_url"`
	RecordingURL     string    `json:"recording_url"`
	IsCancelled      bool      `json:"is_cancelled"`
	IsRegistered     bool      `json:"is_registered"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// ParticipantResponse represents participant data in responses
type ParticipantResponse struct {
	UserID       uint      `json:"user_id"`
	UserName     string    `json:"user_name"`
	UserEmail    string    `json:"user_email"`
	RegisteredAt time.Time `json:"registered_at"`
	AttendedAt   *time.Time `json:"attended_at"`
}