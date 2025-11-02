package user

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/config"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/auth"
	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/middleware"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Integration tests using mocks instead of real database
func TestHandler_GetUserByID_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockService)
	handler := NewHandler(mockService)

	testUser := &auth.User{
		ID:    1,
		Name:  "Test User",
		Email: "test@example.com",
		Role:  "student",
	}

	mockService.On("GetUserByID", mock.Anything, uint(1)).Return(testUser, nil)

	router := gin.New()
	router.GET("/users/:id", handler.GetUserByID)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/users/1", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.True(t, response["success"].(bool))
	assert.NotNil(t, response["data"])

	mockService.AssertExpectations(t)
}

func TestHandler_GetUserByID_NotFound(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockService)
	handler := NewHandler(mockService)

	mockService.On("GetUserByID", mock.Anything, uint(999)).Return(nil, ErrUserNotFound)

	router := gin.New()
	router.GET("/users/:id", handler.GetUserByID)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/users/999", nil)
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusNotFound, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.False(t, response["success"].(bool))

	mockService.AssertExpectations(t)
}

func TestHandler_UpdateProfile_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockService)
	handler := NewHandler(mockService)

	cfg := &config.Config{
		JWT: config.JWTConfig{
			Secret:          "test-secret",
			ExpirationHours: 24,
		},
	}
	authMiddleware := middleware.NewAuthMiddleware(cfg)

	name := "Updated Name"
	updateReq := &UpdateProfileRequest{
		Name: &name,
	}

	updatedUser := &auth.User{
		ID:    1,
		Name:  "Updated Name",
		Email: "test@example.com",
		Role:  "student",
	}

	mockService.On("UpdateProfile", mock.Anything, uint(1), mock.AnythingOfType("*user.UpdateProfileRequest")).
		Return(updatedUser, nil)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("userID", uint(1))
		c.Next()
	})
	router.PATCH("/users/me", handler.UpdateProfile)

	payload, _ := json.Marshal(updateReq)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PATCH", "/users/me", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	
	// Generate test token
	token, _ := authMiddleware.GenerateToken(1, "test@example.com", "student")
	req.Header.Set("Authorization", "Bearer "+token)
	
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.True(t, response["success"].(bool))

	mockService.AssertExpectations(t)
}

func TestHandler_ChangePassword_Success(t *testing.T) {
	gin.SetMode(gin.TestMode)

	mockService := new(MockService)
	handler := NewHandler(mockService)

	changeReq := &ChangePasswordRequest{
		CurrentPassword: "oldPassword",
		NewPassword:     "newPassword",
	}

	mockService.On("ChangePassword", mock.Anything, uint(1), mock.AnythingOfType("*user.ChangePasswordRequest")).
		Return(nil)

	router := gin.New()
	router.Use(func(c *gin.Context) {
		c.Set("userID", uint(1))
		c.Next()
	})
	router.PATCH("/users/me/password", handler.ChangePassword)

	payload, _ := json.Marshal(changeReq)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PATCH", "/users/me/password", bytes.NewBuffer(payload))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.True(t, response["success"].(bool))

	mockService.AssertExpectations(t)
}

// Mock Service
type MockService struct {
	mock.Mock
}

func (m *MockService) GetUserByID(ctx context.Context, id uint) (*auth.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*auth.User), args.Error(1)
}

func (m *MockService) UpdateProfile(ctx context.Context, userID uint, req *UpdateProfileRequest) (*auth.User, error) {
	args := m.Called(ctx, userID, req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*auth.User), args.Error(1)
}

func (m *MockService) ChangePassword(ctx context.Context, userID uint, req *ChangePasswordRequest) error {
	args := m.Called(ctx, userID, req)
	return args.Error(0)
}

// Helper function
func stringPtr(s string) *string {
	return &s
}
