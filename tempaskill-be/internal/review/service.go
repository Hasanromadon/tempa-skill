package review

import (
	"errors"
	"fmt"
)

type ReviewService interface {
	CreateReview(userID uint, req CreateReviewRequest) (*ReviewResponse, error)
	UpdateReview(userID uint, reviewID uint, req UpdateReviewRequest) (*ReviewResponse, error)
	DeleteReview(userID uint, reviewID uint) error
	GetReview(reviewID uint) (*ReviewResponse, error)
	GetCourseReviews(courseID uint, page, limit int) (*ReviewListResponse, error)
	GetUserReviews(userID uint, page, limit int) ([]ReviewResponse, int, error)
	GetCourseReviewSummary(courseID uint) (*CourseReviewSummary, error)
	CanUserReviewCourse(userID, courseID uint) (bool, error)
}

type reviewService struct {
	repo ReviewRepository
}

func NewService(repo ReviewRepository) ReviewService {
	return &reviewService{repo: repo}
}

func (s *reviewService) CreateReview(userID uint, req CreateReviewRequest) (*ReviewResponse, error) {
	// Check if user can review this course (must be enrolled and completed)
	canReview, err := s.CanUserReviewCourse(userID, req.CourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to check review eligibility: %w", err)
	}
	if !canReview {
		return nil, errors.New("user is not eligible to review this course")
	}

	// Check if user already reviewed this course
	exists, err := s.repo.Exists(userID, req.CourseID)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing review: %w", err)
	}
	if exists {
		return nil, errors.New("user has already reviewed this course")
	}

	// Create the review
	review := &CourseReview{
		UserID:     userID,
		CourseID:   req.CourseID,
		Rating:     req.Rating,
		ReviewText: req.ReviewText,
	}

	if err := s.repo.Create(review); err != nil {
		return nil, fmt.Errorf("failed to create review: %w", err)
	}

	// Get the created review with relations
	createdReview, err := s.repo.FindByID(review.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve created review: %w", err)
	}

	return s.convertToResponse(createdReview), nil
}

func (s *reviewService) UpdateReview(userID uint, reviewID uint, req UpdateReviewRequest) (*ReviewResponse, error) {
	// Get the existing review
	review, err := s.repo.FindByID(reviewID)
	if err != nil {
		return nil, errors.New("review not found")
	}

	// Check if user owns this review
	if review.UserID != userID {
		return nil, errors.New("unauthorized to update this review")
	}

	// Update the review
	review.Rating = req.Rating
	review.ReviewText = req.ReviewText

	if err := s.repo.Update(review); err != nil {
		return nil, fmt.Errorf("failed to update review: %w", err)
	}

	// Get updated review with relations
	updatedReview, err := s.repo.FindByID(reviewID)
	if err != nil {
		return nil, fmt.Errorf("failed to retrieve updated review: %w", err)
	}

	return s.convertToResponse(updatedReview), nil
}

func (s *reviewService) DeleteReview(userID uint, reviewID uint) error {
	// Check if review exists and belongs to user
	review, err := s.repo.FindByID(reviewID)
	if err != nil {
		return errors.New("review not found")
	}

	if review.UserID != userID {
		return errors.New("unauthorized to delete this review")
	}

	return s.repo.Delete(reviewID, userID)
}

func (s *reviewService) GetReview(reviewID uint) (*ReviewResponse, error) {
	review, err := s.repo.FindByID(reviewID)
	if err != nil {
		return nil, errors.New("review not found")
	}

	return s.convertToResponse(review), nil
}

func (s *reviewService) GetCourseReviews(courseID uint, page, limit int) (*ReviewListResponse, error) {
	// Validate pagination parameters
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	// Get reviews
	reviews, total, err := s.repo.FindByCourseID(courseID, page, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get course reviews: %w", err)
	}

	// Get summary
	summary, err := s.repo.GetCourseReviewSummary(courseID)
	if err != nil {
		return nil, fmt.Errorf("failed to get review summary: %w", err)
	}

	// Convert reviews to responses
	reviewResponses := make([]ReviewResponse, len(reviews))
	for i, review := range reviews {
		reviewResponses[i] = *s.convertToResponse(&review)
	}

	// Calculate pagination info
	totalPages := (total + limit - 1) / limit

	return &ReviewListResponse{
		Reviews: reviewResponses,
		Summary: *summary,
		Pagination: PaginationMeta{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *reviewService) GetUserReviews(userID uint, page, limit int) ([]ReviewResponse, int, error) {
	// Validate pagination parameters
	if page < 1 {
			page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 10
	}

	reviews, total, err := s.repo.FindByUserID(userID, page, limit)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get user reviews: %w", err)
	}

	// Convert reviews to responses
	reviewResponses := make([]ReviewResponse, len(reviews))
	for i, review := range reviews {
		reviewResponses[i] = *s.convertToResponse(&review)
	}

	return reviewResponses, total, nil
}

func (s *reviewService) GetCourseReviewSummary(courseID uint) (*CourseReviewSummary, error) {
	return s.repo.GetCourseReviewSummary(courseID)
}

func (s *reviewService) CanUserReviewCourse(userID, courseID uint) (bool, error) {
	// This should check if user is enrolled in the course
	// For now, we'll allow reviews for any user-course combination
	// In a real implementation, you'd check enrollment and completion status
	return true, nil
}

func (s *reviewService) convertToResponse(review *CourseReview) *ReviewResponse {
	response := &ReviewResponse{
		ID:         review.ID,
		UserID:     review.UserID,
		CourseID:   review.CourseID,
		Rating:     review.Rating,
		ReviewText: review.ReviewText,
		CreatedAt:  review.CreatedAt,
		UpdatedAt:  review.UpdatedAt,
	}

	// Add user information if loaded
	if review.User.ID != 0 {
		response.UserName = review.User.Name
		// Add avatar if available in user model
	}

	return response
}