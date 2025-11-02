package user

// UpdateProfileRequest represents profile update payload
type UpdateProfileRequest struct {
	Name      *string `json:"name" binding:"omitempty,min=2,max=100"`
	Bio       *string `json:"bio" binding:"omitempty,max=500"`
	AvatarURL *string `json:"avatar_url" binding:"omitempty,url,max=255"`
}

// ChangePasswordRequest represents password change payload
type ChangePasswordRequest struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required,min=6,max=100"`
}
