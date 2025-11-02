package auth

import (
	"errors"
	"strings"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/config"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"
	"golang.org/x/crypto/bcrypt"
)

// Service handles authentication business logic
type Service interface {
	Register(req *RegisterRequest) (*User, error)
	Login(req *LoginRequest) (*User, string, error)
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
func (s *service) Register(req *RegisterRequest) (*User, error) {
	// Normalize email to lowercase
	email := strings.ToLower(strings.TrimSpace(req.Email))

	// Check if user already exists
	existingUser, _ := s.repo.FindByEmail(email)
	if existingUser != nil {
		return nil, errors.New("email already registered")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
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
		return nil, errors.New("failed to create user")
	}

	return user, nil
}

// Login authenticates a user and returns token
func (s *service) Login(req *LoginRequest) (*User, string, error) {
	// Normalize email
	email := strings.ToLower(strings.TrimSpace(req.Email))

	// Find user by email
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	// Compare password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return nil, "", errors.New("invalid email or password")
	}

	// Generate JWT token
	token, err := middleware.GenerateToken(user.ID, user.Email, user.Role, s.cfg)
	if err != nil {
		return nil, "", errors.New("failed to generate token")
	}

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
