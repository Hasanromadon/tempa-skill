package auth

import (
	"errors"
	"strings"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/config"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/logger"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"
)

// Service handles authentication business logic
type Service interface {
	Register(c *gin.Context, req *RegisterRequest) (*User, string, error)
	Login(c *gin.Context, req *LoginRequest) (*User, string, error)
	GetUserByID(id uint) (*User, error)
}

type service struct {
	repo Repository
	cfg  *config.Config
}

// NewService creates a new auth service
func NewService(repo Repository, cfg *config.Config) Service {
	return &service{
		repo: repo,
		cfg:  cfg,
	}
}

// Register creates a new user account
func (s *service) Register(c *gin.Context, req *RegisterRequest) (*User, string, error) {
	requestID := middleware.GetRequestID(c)
	
	// Normalize email to lowercase
	email := strings.ToLower(strings.TrimSpace(req.Email))

	// Check if user already exists
	existingUser, _ := s.repo.FindByEmail(email)
	if existingUser != nil {
		logger.Warn("Registration failed - email already exists",
			zap.String("request_id", requestID),
			zap.String("email", email),
		)
		return nil, "", errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		logger.Error("Failed to hash password",
			zap.String("request_id", requestID),
			zap.Error(err),
		)
		return nil, "", errors.New("failed to hash password")
	}

	// Set default role if not provided
	role := req.Role
	if role == "" {
		role = "student"
	}

	// Create user
	user := &User{
		Name:     strings.TrimSpace(req.Name),
		Email:    email,
		Password: string(hashedPassword),
		Role:     role,
	}

	if err := s.repo.Create(user); err != nil {
		logger.Error("Failed to create user",
			zap.String("request_id", requestID),
			zap.String("email", email),
			zap.Error(err),
		)
		return nil, "", errors.New("failed to create user")
	}

	// Generate JWT token for auto-login after registration
	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role, s.cfg)
	if err != nil {
		logger.Error("Failed to generate token after registration",
			zap.String("request_id", requestID),
			zap.Uint("user_id", user.ID),
			zap.Error(err),
		)
		return nil, "", errors.New("failed to generate token")
	}

	logger.Info("User registered successfully",
		zap.String("request_id", requestID),
		zap.String("email", email),
		zap.Uint("user_id", user.ID),
		zap.String("role", user.Role),
	)

	return user, token, nil
}

// Login authenticates a user and returns token
func (s *service) Login(c *gin.Context, req *LoginRequest) (*User, string, error) {
	requestID := middleware.GetRequestID(c)
	
	// Normalize email
	email := strings.ToLower(strings.TrimSpace(req.Email))

	// Find user by email
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		logger.Warn("Login failed - user not found",
			zap.String("request_id", requestID),
			zap.String("email", email),
		)
		return nil, "", errors.New("invalid email or password")
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		logger.Warn("Login failed - invalid password",
			zap.String("request_id", requestID),
			zap.String("email", email),
			zap.Uint("user_id", user.ID),
		)
		return nil, "", errors.New("invalid email or password")
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role, s.cfg)
	if err != nil {
		logger.Error("Failed to generate token",
			zap.String("request_id", requestID),
			zap.Uint("user_id", user.ID),
			zap.Error(err),
		)
		return nil, "", errors.New("failed to generate token")
	}

	logger.Info("User logged in successfully",
		zap.String("request_id", requestID),
		zap.String("email", email),
		zap.Uint("user_id", user.ID),
		zap.String("role", user.Role),
	)

	return user, token, nil
}

// GetUserByID retrieves user by ID
func (s *service) GetUserByID(id uint) (*User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		return nil, errors.New("user not found")
	}
	return user, nil
}
