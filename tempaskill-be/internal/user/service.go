package user

import (
	"context"
	"errors"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/auth"

	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserNotFound    = errors.New("user not found")
	ErrInvalidPassword = errors.New("current password is incorrect")
)

type Service interface {
	GetUserByID(ctx context.Context, id uint) (*auth.User, error)
	ListUsers(ctx context.Context, userID uint, userRole string, query *UserListQuery) (*UserListResult, error)
	UpdateProfile(ctx context.Context, userID uint, req *UpdateProfileRequest) (*auth.User, error)
	ChangePassword(ctx context.Context, userID uint, req *ChangePasswordRequest) error
	ChangeUserRole(ctx context.Context, userID uint, req *ChangeRoleRequest) error
	ToggleUserStatus(ctx context.Context, userID uint, suspend bool) error
	DeleteUser(ctx context.Context, id uint) error
	GetUserEnrollments(ctx context.Context, userID uint) ([]UserEnrollment, error)
	GetUserCertificates(ctx context.Context, userID uint) ([]UserCertificate, error)
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetUserByID(ctx context.Context, id uint) (*auth.User, error) {
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (s *service) UpdateProfile(ctx context.Context, userID uint, req *UpdateProfileRequest) (*auth.User, error) {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	// Update fields if provided
	if req.Name != nil {
		user.Name = *req.Name
	}
	if req.Bio != nil {
		user.Bio = *req.Bio
	}
	if req.AvatarURL != nil {
		user.AvatarURL = *req.AvatarURL
	}

	if err := s.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *service) ChangePassword(ctx context.Context, userID uint, req *ChangePasswordRequest) error {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}

	// Verify current password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.CurrentPassword)); err != nil {
		return ErrInvalidPassword
	}

	// Hash new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.repo.UpdatePassword(ctx, userID, string(hashedPassword))
}

func (s *service) ListUsers(ctx context.Context, userID uint, userRole string, query *UserListQuery) (*UserListResult, error) {
	// Set defaults
	if query.Page == 0 {
		query.Page = 1
	}
	if query.Limit == 0 {
		query.Limit = 10
	}

	// INSTRUCTOR FILTER: Instructors only see students (not other instructors or admins)
	if userRole == "instructor" {
		query.Role = "student" // Force filter to students only
	}

	users, total, err := s.repo.List(ctx, query)
	if err != nil {
		return nil, err
	}

	// OPTIMIZATION: Batch fetch stats for all users in ONE query (N+1 fix)
	userIDs := make([]uint, len(users))
	for i, user := range users {
		userIDs[i] = user.ID
	}

	statsMap, err := s.repo.GetBatchUserStats(ctx, userIDs)
	if err != nil {
		// Log error but continue with empty stats
		statsMap = make(map[uint]UserStats)
	}

	// Convert to response with statistics
	userResponses := make([]UserResponse, len(users))
	for i, user := range users {
		stats := statsMap[user.ID] // O(1) lookup
		userResponses[i] = UserResponse{
			ID:             user.ID,
			Name:           user.Name,
			Email:          user.Email,
			Role:           user.Role,
			Status:         user.Status,
			Bio:            user.Bio,
			AvatarURL:      user.AvatarURL,
			CreatedAt:      user.CreatedAt.Format("2006-01-02 15:04:05"),
			EnrolledCount:  stats.EnrolledCount,
			CompletedCount: stats.CompletedCount,
		}
	}

	totalPages := int(total) / query.Limit
	if int(total)%query.Limit > 0 {
		totalPages++
	}

	return &UserListResult{
		Users:      userResponses,
		Total:      total,
		Page:       query.Page,
		Limit:      query.Limit,
		TotalPages: totalPages,
	}, nil
}

func (s *service) ChangeUserRole(ctx context.Context, userID uint, req *ChangeRoleRequest) error {
	// Check if user exists
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}

	// Prevent changing own role if they're the last admin
	if user.Role == "admin" && req.Role != "admin" {
		// Check if there are other admins
		users, _, err := s.repo.List(ctx, &UserListQuery{Role: "admin", Page: 1, Limit: 10})
		if err != nil {
			return err
		}
		if len(users) <= 1 {
			return errors.New("cannot change role of the last admin user")
		}
	}

	return s.repo.UpdateRole(ctx, userID, req.Role)
}

func (s *service) ToggleUserStatus(ctx context.Context, userID uint, suspend bool) error {
	// Check if user exists
	_, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return ErrUserNotFound
	}

	status := "active"
	if suspend {
		status = "suspended"
	}

	return s.repo.UpdateStatus(ctx, userID, status)
}

func (s *service) DeleteUser(ctx context.Context, id uint) error {
	// Check if user exists
	user, err := s.repo.FindByID(ctx, id)
	if err != nil {
		return ErrUserNotFound
	}

	// Prevent deleting admin users (optional safety check)
	if user.Role == "admin" {
		return errors.New("cannot delete admin users")
	}

	return s.repo.Delete(ctx, id)
}

func (s *service) GetUserEnrollments(ctx context.Context, userID uint) ([]UserEnrollment, error) {
	// Check if user exists
	_, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return s.repo.GetUserEnrollments(ctx, userID)
}

func (s *service) GetUserCertificates(ctx context.Context, userID uint) ([]UserCertificate, error) {
	// Check if user exists
	_, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return nil, ErrUserNotFound
	}

	return s.repo.GetUserCertificates(ctx, userID)
}
