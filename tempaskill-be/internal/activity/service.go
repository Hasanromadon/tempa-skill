package activity

import (
	"time"
)

// Service defines the interface for activity log business logic
type Service interface {
	Log(userID uint, action string, entityType *string, entityID *uint, description *string, ipAddress *string, userAgent *string) error
	GetUserActivities(userID uint, limit int) ([]ActivityLogResponse, error)
	GetRecentActivities(limit int) ([]ActivityLogResponse, error)
}

type service struct {
	repo Repository
}

// NewService creates a new activity service
func NewService(repo Repository) Service {
	return &service{repo: repo}
}

// ActivityLogResponse represents the API response for activity logs
type ActivityLogResponse struct {
	ID          uint      `json:"id"`
	UserID      uint      `json:"user_id"`
	Action      string    `json:"action"`
	EntityType  *string   `json:"entity_type,omitempty"`
	EntityID    *uint     `json:"entity_id,omitempty"`
	Description *string   `json:"description,omitempty"`
	IPAddress   *string   `json:"ip_address,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

// Log creates a new activity log entry
func (s *service) Log(userID uint, action string, entityType *string, entityID *uint, description *string, ipAddress *string, userAgent *string) error {
	log := &ActivityLog{
		UserID:      userID,
		Action:      action,
		EntityType:  entityType,
		EntityID:    entityID,
		Description: description,
		IPAddress:   ipAddress,
		UserAgent:   userAgent,
	}
	return s.repo.Create(log)
}

// GetUserActivities retrieves activities for a specific user
func (s *service) GetUserActivities(userID uint, limit int) ([]ActivityLogResponse, error) {
	if limit <= 0 {
		limit = 20 // Default limit
	}

	logs, err := s.repo.GetByUserID(userID, limit)
	if err != nil {
		return nil, err
	}

	var response []ActivityLogResponse
	for _, log := range logs {
		response = append(response, ActivityLogResponse{
			ID:          log.ID,
			UserID:      log.UserID,
			Action:      log.Action,
			EntityType:  log.EntityType,
			EntityID:    log.EntityID,
			Description: log.Description,
			IPAddress:   log.IPAddress,
			CreatedAt:   log.CreatedAt,
		})
	}

	return response, nil
}

// GetRecentActivities retrieves recent activities across all users
func (s *service) GetRecentActivities(limit int) ([]ActivityLogResponse, error) {
	if limit <= 0 {
		limit = 50 // Default limit
	}

	logs, err := s.repo.GetRecent(limit)
	if err != nil {
		return nil, err
	}

	var response []ActivityLogResponse
	for _, log := range logs {
		response = append(response, ActivityLogResponse{
			ID:          log.ID,
			UserID:      log.UserID,
			Action:      log.Action,
			EntityType:  log.EntityType,
			EntityID:    log.EntityID,
			Description: log.Description,
			IPAddress:   log.IPAddress,
			CreatedAt:   log.CreatedAt,
		})
	}

	return response, nil
}
