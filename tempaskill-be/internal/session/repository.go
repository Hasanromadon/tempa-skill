package session

import (
	"context"
	"time"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Repository interface {
	// Session operations
	CreateSession(ctx context.Context, session *Session) error
	FindSessionByID(ctx context.Context, id uint) (*Session, error)
	FindSessions(ctx context.Context, query *SessionListQuery) ([]*Session, int, error)
	UpdateSession(ctx context.Context, session *Session) error
	DeleteSession(ctx context.Context, id uint) error

	// Participant operations
	RegisterParticipant(ctx context.Context, sessionID, userID uint) error
	UnregisterParticipant(ctx context.Context, sessionID, userID uint) error
	IsUserRegistered(ctx context.Context, sessionID, userID uint) (bool, error)
	FindSessionParticipants(ctx context.Context, sessionID uint) ([]*SessionParticipant, error)
	MarkAttendance(ctx context.Context, sessionID, userID uint) error
	CountParticipants(ctx context.Context, sessionID uint) (int, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

// Session operations
func (r *repository) CreateSession(ctx context.Context, session *Session) error {
	err := r.db.WithContext(ctx).Create(session).Error
	if err != nil {
		logger.Error("Failed to create session in database",
			zap.Error(err),
			zap.String("title", session.Title),
			zap.Uint("course_id", session.CourseID),
		)
		return err
	}
	return nil
}

func (r *repository) FindSessionByID(ctx context.Context, id uint) (*Session, error) {
	var session Session
	if err := r.db.WithContext(ctx).
		Preload("Course").
		Preload("Instructor").
		Preload("Participants.User").
		First(&session, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		logger.Error("Failed to find session by ID",
			zap.Error(err),
			zap.Uint("session_id", id),
		)
		return nil, err
	}

	// Count participants
	participantCount, err := r.CountParticipants(ctx, id)
	if err != nil {
		logger.Error("Failed to count participants for session",
			zap.Error(err),
			zap.Uint("session_id", id),
		)
		return nil, err
	}
	session.ParticipantCount = participantCount

	return &session, nil
}

func (r *repository) FindSessions(ctx context.Context, query *SessionListQuery) ([]*Session, int, error) {
	var sessions []*Session
	var total int64

	db := r.db.WithContext(ctx).Model(&Session{})

	// Apply filters
	if query.CourseID > 0 {
		db = db.Where("course_id = ?", query.CourseID)
	}
	if query.UserID > 0 {
		// Find sessions where user is registered
		db = db.Joins("JOIN session_participants sp ON sessions.id = sp.session_id").
			Where("sp.user_id = ?", query.UserID)
	}
	if query.Upcoming != nil {
		now := time.Now()
		if *query.Upcoming {
			db = db.Where("scheduled_at > ? AND is_cancelled = ?", now, false)
		} else {
			db = db.Where("scheduled_at <= ?", now)
		}
	}
	if query.Published != nil {
		// Sessions are always "published" if not cancelled
		db = db.Where("is_cancelled = ?", !*query.Published)
	}

	// Count total
	if err := db.Count(&total).Error; err != nil {
		logger.Error("Failed to count sessions",
			zap.Error(err),
		)
		return nil, 0, err
	}

	// Apply pagination
	offset := (query.Page - 1) * query.Limit
	if err := db.Preload("Course").Preload("Instructor").
		Order("scheduled_at ASC").
		Offset(offset).Limit(query.Limit).
		Find(&sessions).Error; err != nil {
		logger.Error("Failed to find sessions",
			zap.Error(err),
		)
		return nil, 0, err
	}

	// Add participant counts
	for _, session := range sessions {
		count, err := r.CountParticipants(ctx, session.ID)
		if err != nil {
			logger.Error("Failed to count participants for session",
				zap.Error(err),
				zap.Uint("session_id", session.ID),
			)
			continue
		}
		session.ParticipantCount = count
	}

	return sessions, int(total), nil
}

func (r *repository) UpdateSession(ctx context.Context, session *Session) error {
	err := r.db.WithContext(ctx).Save(session).Error
	if err != nil {
		logger.Error("Failed to update session in database",
			zap.Error(err),
			zap.Uint("session_id", session.ID),
		)
		return err
	}
	return nil
}

func (r *repository) DeleteSession(ctx context.Context, id uint) error {
	err := r.db.WithContext(ctx).Delete(&Session{}, id).Error
	if err != nil {
		logger.Error("Failed to delete session from database",
			zap.Error(err),
			zap.Uint("session_id", id),
		)
		return err
	}
	return nil
}

// Participant operations
func (r *repository) RegisterParticipant(ctx context.Context, sessionID, userID uint) error {
	participant := &SessionParticipant{
		SessionID: sessionID,
		UserID:    userID,
	}

	err := r.db.WithContext(ctx).Create(participant).Error
	if err != nil {
		logger.Error("Failed to register participant for session",
			zap.Error(err),
			zap.Uint("session_id", sessionID),
			zap.Uint("user_id", userID),
		)
		return err
	}
	return nil
}

func (r *repository) UnregisterParticipant(ctx context.Context, sessionID, userID uint) error {
	err := r.db.WithContext(ctx).
		Where("session_id = ? AND user_id = ?", sessionID, userID).
		Delete(&SessionParticipant{}).Error
	if err != nil {
		logger.Error("Failed to unregister participant from session",
			zap.Error(err),
			zap.Uint("session_id", sessionID),
			zap.Uint("user_id", userID),
		)
		return err
	}
	return nil
}

func (r *repository) IsUserRegistered(ctx context.Context, sessionID, userID uint) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&SessionParticipant{}).
		Where("session_id = ? AND user_id = ?", sessionID, userID).
		Count(&count).Error
	if err != nil {
		logger.Error("Failed to check user registration for session",
			zap.Error(err),
			zap.Uint("session_id", sessionID),
			zap.Uint("user_id", userID),
		)
		return false, err
	}
	return count > 0, nil
}

func (r *repository) FindSessionParticipants(ctx context.Context, sessionID uint) ([]*SessionParticipant, error) {
	var participants []*SessionParticipant
	err := r.db.WithContext(ctx).
		Preload("User").
		Where("session_id = ?", sessionID).
		Order("registered_at ASC").
		Find(&participants).Error
	if err != nil {
		logger.Error("Failed to find session participants",
			zap.Error(err),
			zap.Uint("session_id", sessionID),
		)
		return nil, err
	}
	return participants, nil
}

func (r *repository) MarkAttendance(ctx context.Context, sessionID, userID uint) error {
	now := time.Now()
	err := r.db.WithContext(ctx).Model(&SessionParticipant{}).
		Where("session_id = ? AND user_id = ?", sessionID, userID).
		Update("attended_at", now).Error
	if err != nil {
		logger.Error("Failed to mark attendance for participant",
			zap.Error(err),
			zap.Uint("session_id", sessionID),
			zap.Uint("user_id", userID),
		)
		return err
	}
	return nil
}

func (r *repository) CountParticipants(ctx context.Context, sessionID uint) (int, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&SessionParticipant{}).
		Where("session_id = ?", sessionID).
		Count(&count).Error
	if err != nil {
		logger.Error("Failed to count session participants",
			zap.Error(err),
			zap.Uint("session_id", sessionID),
		)
		return 0, err
	}
	return int(count), nil
}