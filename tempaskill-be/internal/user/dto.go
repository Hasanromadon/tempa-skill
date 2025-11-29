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

// UserListQuery represents query parameters for listing users
type UserListQuery struct {
	Page   int    `form:"page" binding:"omitempty,min=1"`
	Limit  int    `form:"limit" binding:"omitempty,min=1,max=100"`
	Role   string `form:"role" binding:"omitempty,oneof=student instructor admin"`
	Search string `form:"search"`
}

// UserListResult represents paginated user list result
type UserListResult struct {
	Users      []UserResponse `json:"users"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	Limit      int            `json:"limit"`
	TotalPages int            `json:"total_pages"`
}

// UserResponse represents public user data
type UserResponse struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	Bio       string `json:"bio"`
	AvatarURL string `json:"avatar_url"`
	CreatedAt string `json:"created_at"`
}
