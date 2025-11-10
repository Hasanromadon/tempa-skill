package session

import (
	"context"
	"errors"
	"time"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"go.uber.org/zap"
)

var (
	ErrSessionNotFound      = errors.New("session not found")
	ErrUnauthorized         = errors.New("unauthorized access")
	ErrAlreadyRegistered    = errors.New("already registered for this session")
	ErrNotRegistered        = errors.New("not registered for this session")
	ErrSessionFull          = errors.New("session is full")
	ErrSessionCancelled     = errors.New("session is cancelled")
	ErrSessionInPast        = errors.New("cannot modify past session")
	ErrInvalidScheduleTime  = errors.New("scheduled time must be in the future")
)

type Service interface {
	// Session operations
	CreateSession(ctx context.Context, userID uint, req *CreateSessionRequest) (*Session, error)
	GetSessionByID(ctx context.Context, userID uint, sessionID uint) (*SessionResponse, error)
	ListSessions(ctx context.Context, userID uint, query *SessionListQuery) (*SessionListResponse, error)
	UpdateSession(ctx context.Context, userID uint, sessionID uint, req *UpdateSessionRequest) (*Session, error)
	DeleteSession(ctx context.Context, userID uint, sessionID uint) error

	// Participant operations
	RegisterForSession(ctx context.Context, userID uint, sessionID uint) error
	UnregisterFromSession(ctx context.Context, userID uint, sessionID uint) error
	GetSessionParticipants(ctx context.Context, userID uint, sessionID uint) ([]*ParticipantResponse, error)
	MarkAttendance(ctx context.Context, userID uint, sessionID uint, participantID uint) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// Session operations
func (s *service) CreateSession(ctx context.Context, userID uint, req *CreateSessionRequest) (*Session, error) {
	// Parse scheduled time
	scheduledAt, err := time.Parse(time.RFC3339, req.ScheduledAt)
	if err != nil {
		logger.Error("Invalid scheduled time format",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.String("scheduled_at", req.ScheduledAt),
		)
		return nil, errors.New("invalid scheduled time format")
	}

	// Validate scheduled time is in the future
	if scheduledAt.Before(time.Now()) {
		logger.Error("Scheduled time is in the past",
			zap.Uint("user_id", userID),
			zap.Time("scheduled_at", scheduledAt),
		)
		return nil, ErrInvalidScheduleTime
	}

	// TODO: Check if user is instructor of the course
	// For now, allow any authenticated user to create sessions

	session := &Session{
		CourseID:        req.CourseID,
		InstructorID:    userID,
		Title:           req.Title,
		Description:     req.Description,
		ScheduledAt:     scheduledAt,
		DurationMinutes: req.DurationMinutes,
		MaxParticipants: req.MaxParticipants,
		MeetingURL:      req.MeetingURL,
	}

	err = s.repo.CreateSession(ctx, session)
	if err != nil {
		logger.Error("Failed to create session",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("course_id", req.CourseID),
		)
		return nil, err
	}

	return session, nil
}

func (s *service) GetSessionByID(ctx context.Context, userID uint, sessionID uint) (*SessionResponse, error) {
	session, err := s.repo.FindSessionByID(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to find session by ID",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return nil, err
	}
	if session == nil {
		return nil, ErrSessionNotFound
	}

	// Check if user is registered
	isRegistered, err := s.repo.IsUserRegistered(ctx, sessionID, userID)
	if err != nil {
		logger.Error("Failed to check user registration for session",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return nil, err
	}

	response := &SessionResponse{
		ID:                  session.ID,
		CourseID:           session.CourseID,
		CourseTitle:        session.Course.Title,
		CourseSlug:         session.Course.Slug,
		InstructorID:       session.InstructorID,
		InstructorName:     session.Instructor.Name,
		Title:              session.Title,
		Description:        session.Description,
		ScheduledAt:        session.ScheduledAt,
		DurationMinutes:    session.DurationMinutes,
		MaxParticipants:    session.MaxParticipants,
		CurrentParticipants: session.ParticipantCount,
		MeetingURL:         session.MeetingURL,
		RecordingURL:       session.RecordingURL,
		IsCancelled:        session.IsCancelled,
		IsRegistered:       isRegistered,
		CreatedAt:          session.CreatedAt,
		UpdatedAt:          session.UpdatedAt,
	}

	return response, nil
}

func (s *service) ListSessions(ctx context.Context, userID uint, query *SessionListQuery) (*SessionListResponse, error) {
	sessions, total, err := s.repo.FindSessions(ctx, query)
	if err != nil {
		logger.Error("Failed to find sessions",
			zap.Error(err),
			zap.Uint("user_id", userID),
		)
		return nil, err
	}

	// Convert to response format
	sessionResponses := make([]*SessionResponse, len(sessions))
	for i, session := range sessions {
		// Check if user is registered for each session
		isRegistered, err := s.repo.IsUserRegistered(ctx, session.ID, userID)
		if err != nil {
			logger.Error("Failed to check user registration for session",
				zap.Error(err),
				zap.Uint("user_id", userID),
				zap.Uint("session_id", session.ID),
			)
			continue
		}

		sessionResponses[i] = &SessionResponse{
			ID:                  session.ID,
			CourseID:           session.CourseID,
			CourseTitle:        session.Course.Title,
			CourseSlug:         session.Course.Slug,
			InstructorID:       session.InstructorID,
			InstructorName:     session.Instructor.Name,
			Title:              session.Title,
			Description:        session.Description,
			ScheduledAt:        session.ScheduledAt,
			DurationMinutes:    session.DurationMinutes,
			MaxParticipants:    session.MaxParticipants,
			CurrentParticipants: session.ParticipantCount,
			MeetingURL:         session.MeetingURL,
			RecordingURL:       session.RecordingURL,
			IsCancelled:        session.IsCancelled,
			IsRegistered:       isRegistered,
			CreatedAt:          session.CreatedAt,
			UpdatedAt:          session.UpdatedAt,
		}
	}

	response := &SessionListResponse{
		Sessions: sessionResponses,
		Pagination: PaginationMeta{
			Page:     query.Page,
			Limit:    query.Limit,
			Total:    total,
			TotalPages: (total + query.Limit - 1) / query.Limit,
		},
	}

	return response, nil
}

func (s *service) UpdateSession(ctx context.Context, userID uint, sessionID uint, req *UpdateSessionRequest) (*Session, error) {
	// Get existing session
	session, err := s.repo.FindSessionByID(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to find session for update",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return nil, err
	}
	if session == nil {
		return nil, ErrSessionNotFound
	}

	// Check if user is the instructor
	if session.InstructorID != userID {
		logger.Error("User is not authorized to update session",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
			zap.Uint("instructor_id", session.InstructorID),
		)
		return nil, ErrUnauthorized
	}

	// Check if session is in the past
	if session.ScheduledAt.Before(time.Now()) {
		logger.Error("Cannot update past session",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
			zap.Time("scheduled_at", session.ScheduledAt),
		)
		return nil, ErrSessionInPast
	}

	// Update fields
	if req.Title != nil {
		session.Title = *req.Title
	}
	if req.Description != nil {
		session.Description = *req.Description
	}
	if req.ScheduledAt != nil {
		scheduledAt, err := time.Parse(time.RFC3339, *req.ScheduledAt)
		if err != nil {
			logger.Error("Invalid scheduled time format for update",
				zap.Error(err),
				zap.Uint("user_id", userID),
				zap.String("scheduled_at", *req.ScheduledAt),
			)
			return nil, errors.New("invalid scheduled time format")
		}
		if scheduledAt.Before(time.Now()) {
			logger.Error("New scheduled time is in the past",
				zap.Uint("user_id", userID),
				zap.Time("new_scheduled_at", scheduledAt),
			)
			return nil, ErrInvalidScheduleTime
		}
		session.ScheduledAt = scheduledAt
	}
	if req.DurationMinutes != nil {
		session.DurationMinutes = *req.DurationMinutes
	}
	if req.MaxParticipants != nil {
		session.MaxParticipants = *req.MaxParticipants
	}
	if req.MeetingURL != nil {
		session.MeetingURL = *req.MeetingURL
	}
	if req.RecordingURL != nil {
		session.RecordingURL = *req.RecordingURL
	}
	if req.IsCancelled != nil {
		session.IsCancelled = *req.IsCancelled
	}

	err = s.repo.UpdateSession(ctx, session)
	if err != nil {
		logger.Error("Failed to update session in database",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return nil, err
	}

	return session, nil
}

func (s *service) DeleteSession(ctx context.Context, userID uint, sessionID uint) error {
	// Get existing session
	session, err := s.repo.FindSessionByID(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to find session for deletion",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return err
	}
	if session == nil {
		return ErrSessionNotFound
	}

	// Check if user is the instructor
	if session.InstructorID != userID {
		logger.Error("User is not authorized to delete session",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
			zap.Uint("instructor_id", session.InstructorID),
		)
		return ErrUnauthorized
	}

	err = s.repo.DeleteSession(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to delete session from database",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return err
	}

	return nil
}

// Participant operations
func (s *service) RegisterForSession(ctx context.Context, userID uint, sessionID uint) error {
	// Get session
	session, err := s.repo.FindSessionByID(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to find session for registration",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return err
	}
	if session == nil {
		return ErrSessionNotFound
	}

	// Check if session is cancelled
	if session.IsCancelled {
		logger.Error("Cannot register for cancelled session",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return ErrSessionCancelled
	}

	// Check if session is in the past
	if session.ScheduledAt.Before(time.Now()) {
		logger.Error("Cannot register for past session",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
			zap.Time("scheduled_at", session.ScheduledAt),
		)
		return ErrSessionInPast
	}

	// Check if user is already registered
	isRegistered, err := s.repo.IsUserRegistered(ctx, sessionID, userID)
	if err != nil {
		logger.Error("Failed to check user registration",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return err
	}
	if isRegistered {
		logger.Error("User already registered for session",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return ErrAlreadyRegistered
	}

	// Check if session is full
	participantCount, err := s.repo.CountParticipants(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to count participants for session",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return err
	}
	if participantCount >= session.MaxParticipants {
		logger.Error("Session is full",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
			zap.Int("current_participants", participantCount),
			zap.Int("max_participants", session.MaxParticipants),
		)
		return ErrSessionFull
	}

	// Register participant
	err = s.repo.RegisterParticipant(ctx, sessionID, userID)
	if err != nil {
		logger.Error("Failed to register participant for session",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return err
	}

	return nil
}

func (s *service) UnregisterFromSession(ctx context.Context, userID uint, sessionID uint) error {
	// Get session
	session, err := s.repo.FindSessionByID(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to find session for unregistration",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return err
	}
	if session == nil {
		return ErrSessionNotFound
	}

	// Check if user is registered
	isRegistered, err := s.repo.IsUserRegistered(ctx, sessionID, userID)
	if err != nil {
		logger.Error("Failed to check user registration for unregistration",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return err
	}
	if !isRegistered {
		logger.Error("User not registered for session",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return ErrNotRegistered
	}

	// Unregister participant
	err = s.repo.UnregisterParticipant(ctx, sessionID, userID)
	if err != nil {
		logger.Error("Failed to unregister participant from session",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return err
	}

	return nil
}

func (s *service) GetSessionParticipants(ctx context.Context, userID uint, sessionID uint) ([]*ParticipantResponse, error) {
	// Get session
	session, err := s.repo.FindSessionByID(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to find session for getting participants",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return nil, err
	}
	if session == nil {
		return nil, ErrSessionNotFound
	}

	// Check if user is the instructor
	if session.InstructorID != userID {
		logger.Error("User is not authorized to view participants",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
			zap.Uint("instructor_id", session.InstructorID),
		)
		return nil, ErrUnauthorized
	}

	participants, err := s.repo.FindSessionParticipants(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to find session participants",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
		)
		return nil, err
	}

	// Convert to response format
	response := make([]*ParticipantResponse, len(participants))
	for i, participant := range participants {
		response[i] = &ParticipantResponse{
			UserID:       participant.UserID,
			UserName:     participant.User.Name,
			UserEmail:    participant.User.Email,
			RegisteredAt: participant.RegisteredAt,
			AttendedAt:   participant.AttendedAt,
		}
	}

	return response, nil
}

func (s *service) MarkAttendance(ctx context.Context, userID uint, sessionID uint, participantID uint) error {
	// Get session
	session, err := s.repo.FindSessionByID(ctx, sessionID)
	if err != nil {
		logger.Error("Failed to find session for marking attendance",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
			zap.Uint("participant_id", participantID),
		)
		return err
	}
	if session == nil {
		return ErrSessionNotFound
	}

	// Check if user is the instructor
	if session.InstructorID != userID {
		logger.Error("User is not authorized to mark attendance",
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
			zap.Uint("participant_id", participantID),
			zap.Uint("instructor_id", session.InstructorID),
		)
		return ErrUnauthorized
	}

	// Check if session is in the past (allow marking attendance for past sessions)
	err = s.repo.MarkAttendance(ctx, sessionID, participantID)
	if err != nil {
		logger.Error("Failed to mark attendance in database",
			zap.Error(err),
			zap.Uint("user_id", userID),
			zap.Uint("session_id", sessionID),
			zap.Uint("participant_id", participantID),
		)
		return err
	}

	return nil
}

// Response types
type SessionListResponse struct {
	Sessions   []*SessionResponse `json:"sessions"`
	Pagination PaginationMeta     `json:"pagination"`
}

type PaginationMeta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}