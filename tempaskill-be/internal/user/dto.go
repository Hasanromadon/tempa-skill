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

// ChangeRoleRequest represents role change payload (admin only)
type ChangeRoleRequest struct {
	Role string `json:"role" binding:"required,oneof=student instructor admin"`
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
	ID             uint   `json:"id"`
	Name           string `json:"name"`
	Email          string `json:"email"`
	Role           string `json:"role"`
	Status         string `json:"status"`
	Bio            string `json:"bio"`
	AvatarURL      string `json:"avatar_url"`
	CreatedAt      string `json:"created_at"`
	EnrolledCount  int    `json:"enrolled_count,omitempty"`
	CompletedCount int    `json:"completed_count,omitempty"`
}

// UserEnrollment represents a user's course enrollment
type UserEnrollment struct {
	ID                 uint    `json:"id"`
	Title              string  `json:"title"`
	Slug               string  `json:"slug"`
	ThumbnailURL       string  `json:"thumbnail_url"`
	ProgressPercentage float64 `json:"progress_percentage"`
	EnrolledAt         string  `json:"enrolled_at"`
	LastAccessedAt     *string `json:"last_accessed_at"`
	CompletedAt        *string `json:"completed_at"`
}

// ToggleStatusRequest represents status toggle payload (admin only)
type ToggleStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=active suspended"`
}

// UserCertificate represents a user's earned certificate
type UserCertificate struct {
	ID            uint   `json:"id"`
	CourseID      uint   `json:"course_id"`
	CourseTitle   string `json:"course_title"`
	CourseSlug    string `json:"course_slug"`
	CertificateID string `json:"certificate_id"`
	IssuedAt      string `json:"issued_at"`
}

// UserStats represents enrollment statistics for a user
type UserStats struct {
	EnrolledCount  int `json:"enrolled_count"`
	CompletedCount int `json:"completed_count"`
}
