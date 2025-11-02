package auth

import (
	"net/http"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/pkg/response"
	"github.com/gin-gonic/gin"
)

// Handler handles authentication HTTP requests
type Handler struct {
	service Service
}

// NewHandler creates a new auth handler
func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

// Register godoc
// @Summary Register a new user
// @Description Create a new user account with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body RegisterRequest true "Registration data"
// @Success 201 {object} response.APIResponse{data=AuthResponse}
// @Failure 400 {object} response.APIResponse
// @Failure 500 {object} response.APIResponse
// @Router /auth/register [post]
func (h *Handler) Register(c *gin.Context) {
	var req RegisterRequest
	
	// Validate request body
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	// Call service
	user, err := h.service.Register(c, &req)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	// Return success response
	response.Success(c, http.StatusCreated, "User registered successfully", user.ToResponse())
}

// Login godoc
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body LoginRequest true "Login credentials"
// @Success 200 {object} response.APIResponse{data=AuthResponse}
// @Failure 400 {object} response.APIResponse
// @Failure 401 {object} response.APIResponse
// @Router /auth/login [post]
func (h *Handler) Login(c *gin.Context) {
	var req LoginRequest

	// Validate request body
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ValidationError(c, err.Error())
		return
	}

	// Call service
	user, token, err := h.service.Login(c, &req)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	// Return success response with token
	authResp := &AuthResponse{
		Token: token,
		User:  user.ToResponse(),
	}

	response.Success(c, http.StatusOK, "Login successful", authResp)
}

// GetMe godoc
// @Summary Get current user
// @Description Get authenticated user profile
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=UserResponse}
// @Failure 401 {object} response.APIResponse
// @Failure 404 {object} response.APIResponse
// @Router /auth/me [get]
func (h *Handler) GetMe(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("userID")
	if !exists {
		response.Unauthorized(c, "User not authenticated")
		return
	}

	// Get user from service
	user, err := h.service.GetUserByID(userID.(uint))
	if err != nil {
		response.NotFound(c, "User not found")
		return
	}

	response.Success(c, http.StatusOK, "User profile retrieved", user.ToResponse())
}
