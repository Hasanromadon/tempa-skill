package user

import (
	"context"
	"errors"
	"testing"

	"github.com/Hasanromadon/tempa-skill/tempaskill-be/internal/auth"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"golang.org/x/crypto/bcrypt"
)

// MockRepository is a mock implementation of Repository
type MockRepository struct {
	mock.Mock
}

func (m *MockRepository) FindByID(ctx context.Context, id uint) (*auth.User, error) {
	args := m.Called(ctx, id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*auth.User), args.Error(1)
}

func (m *MockRepository) Update(ctx context.Context, user *auth.User) error {
	args := m.Called(ctx, user)
	return args.Error(0)
}

func (m *MockRepository) UpdatePassword(ctx context.Context, id uint, hashedPassword string) error {
	args := m.Called(ctx, id, hashedPassword)
	return args.Error(0)
}

func TestService_GetUserByID(t *testing.T) {
	tests := []struct {
		name        string
		userID      uint
		mockReturn  *auth.User
		mockError   error
		expectError error
	}{
		{
			name:   "Success - User Found",
			userID: 1,
			mockReturn: &auth.User{
				Name:  "John Doe",
				Email: "john@example.com",
			},
			mockError:   nil,
			expectError: nil,
		},
		{
			name:        "Error - User Not Found",
			userID:      999,
			mockReturn:  nil,
			mockError:   errors.New("record not found"),
			expectError: ErrUserNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(MockRepository)
			mockRepo.On("FindByID", mock.Anything, tt.userID).Return(tt.mockReturn, tt.mockError)

			service := NewService(mockRepo)
			user, err := service.GetUserByID(context.Background(), tt.userID)

			if tt.expectError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectError, err)
				assert.Nil(t, user)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				assert.Equal(t, tt.mockReturn.Email, user.Email)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_UpdateProfile(t *testing.T) {
	name := "Updated Name"
	bio := "Updated Bio"
	avatarURL := "https://example.com/avatar.jpg"

	tests := []struct {
		name        string
		userID      uint
		request     *UpdateProfileRequest
		mockUser    *auth.User
		findError   error
		updateError error
		expectError error
	}{
		{
			name:   "Success - Update All Fields",
			userID: 1,
			request: &UpdateProfileRequest{
				Name:      &name,
				Bio:       &bio,
				AvatarURL: &avatarURL,
			},
			mockUser: &auth.User{
				Name:  "Old Name",
				Email: "user@example.com",
			},
			findError:   nil,
			updateError: nil,
			expectError: nil,
		},
		{
			name:   "Success - Update Name Only",
			userID: 1,
			request: &UpdateProfileRequest{
				Name: &name,
			},
			mockUser: &auth.User{
				Name:  "Old Name",
				Email: "user@example.com",
			},
			findError:   nil,
			updateError: nil,
			expectError: nil,
		},
		{
			name:   "Error - User Not Found",
			userID: 999,
			request: &UpdateProfileRequest{
				Name: &name,
			},
			mockUser:    nil,
			findError:   errors.New("record not found"),
			updateError: nil,
			expectError: ErrUserNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(MockRepository)
			mockRepo.On("FindByID", mock.Anything, tt.userID).Return(tt.mockUser, tt.findError)
			
			if tt.findError == nil {
				mockRepo.On("Update", mock.Anything, mock.AnythingOfType("*auth.User")).Return(tt.updateError)
			}

			service := NewService(mockRepo)
			user, err := service.UpdateProfile(context.Background(), tt.userID, tt.request)

			if tt.expectError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectError, err)
				assert.Nil(t, user)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, user)
				
				if tt.request.Name != nil {
					assert.Equal(t, *tt.request.Name, user.Name)
				}
				if tt.request.Bio != nil {
					assert.Equal(t, *tt.request.Bio, user.Bio)
				}
				if tt.request.AvatarURL != nil {
					assert.Equal(t, *tt.request.AvatarURL, user.AvatarURL)
				}
			}

			mockRepo.AssertExpectations(t)
		})
	}
}

func TestService_ChangePassword(t *testing.T) {
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("oldPassword123"), bcrypt.DefaultCost)

	tests := []struct {
		name           string
		userID         uint
		request        *ChangePasswordRequest
		mockUser       *auth.User
		findError      error
		updateError    error
		expectError    error
	}{
		{
			name:   "Success - Password Changed",
			userID: 1,
			request: &ChangePasswordRequest{
				CurrentPassword: "oldPassword123",
				NewPassword:     "newPassword456",
			},
			mockUser: &auth.User{
				Name:     "John Doe",
				Email:    "john@example.com",
				Password: string(hashedPassword),
			},
			findError:   nil,
			updateError: nil,
			expectError: nil,
		},
		{
			name:   "Error - Invalid Current Password",
			userID: 1,
			request: &ChangePasswordRequest{
				CurrentPassword: "wrongPassword",
				NewPassword:     "newPassword456",
			},
			mockUser: &auth.User{
				Name:     "John Doe",
				Email:    "john@example.com",
				Password: string(hashedPassword),
			},
			findError:   nil,
			updateError: nil,
			expectError: ErrInvalidPassword,
		},
		{
			name:   "Error - User Not Found",
			userID: 999,
			request: &ChangePasswordRequest{
				CurrentPassword: "oldPassword123",
				NewPassword:     "newPassword456",
			},
			mockUser:    nil,
			findError:   errors.New("record not found"),
			updateError: nil,
			expectError: ErrUserNotFound,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockRepo := new(MockRepository)
			mockRepo.On("FindByID", mock.Anything, tt.userID).Return(tt.mockUser, tt.findError)
			
			if tt.findError == nil && tt.expectError != ErrInvalidPassword {
				mockRepo.On("UpdatePassword", mock.Anything, tt.userID, mock.AnythingOfType("string")).Return(tt.updateError)
			}

			service := NewService(mockRepo)
			err := service.ChangePassword(context.Background(), tt.userID, tt.request)

			if tt.expectError != nil {
				assert.Error(t, err)
				assert.Equal(t, tt.expectError, err)
			} else {
				assert.NoError(t, err)
			}

			mockRepo.AssertExpectations(t)
		})
	}
}
