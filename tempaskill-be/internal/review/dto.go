package review

import "time"

// CreateReviewRequest represents the request to create a new review
type CreateReviewRequest struct {
	CourseID   uint   `json:"course_id" binding:"required"`
	Rating     uint   `json:"rating" binding:"required,min=1,max=5"`
	ReviewText string `json:"review_text" binding:"max=1000"`
}

// UpdateReviewRequest represents the request to update an existing review
type UpdateReviewRequest struct {
	Rating     uint   `json:"rating" binding:"required,min=1,max=5"`
	ReviewText string `json:"review_text" binding:"max=1000"`
}

// ReviewResponse represents the review data returned to clients
type ReviewResponse struct {
	ID         uint      `json:"id"`
	UserID     uint      `json:"user_id"`
	CourseID   uint      `json:"course_id"`
	UserName   string    `json:"user_name"`
	UserAvatar string    `json:"user_avatar,omitempty"`
	Rating     uint      `json:"rating"`
	ReviewText string    `json:"review_text"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

// CourseReviewSummary represents aggregated review data for a course
type CourseReviewSummary struct {
	CourseID       uint    `json:"course_id"`
	TotalReviews   int     `json:"total_reviews"`
	AverageRating  float64 `json:"average_rating"`
	RatingCounts   map[uint]int `json:"rating_counts"` // 1-5 star counts
}

// ReviewListResponse represents paginated review list
type ReviewListResponse struct {
	Reviews       []ReviewResponse      `json:"reviews"`
	Summary       CourseReviewSummary   `json:"summary"`
	Pagination    PaginationMeta        `json:"pagination"`
}

// PaginationMeta represents pagination information
type PaginationMeta struct {
	Page        int `json:"page"`
	Limit       int `json:"limit"`
	Total       int `json:"total"`
	TotalPages  int `json:"total_pages"`
}