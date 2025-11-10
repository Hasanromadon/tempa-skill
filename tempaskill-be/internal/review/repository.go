package review

import (
	"gorm.io/gorm"
)

type ReviewRepository interface {
	Create(review *CourseReview) error
	Update(review *CourseReview) error
	Delete(id uint, userID uint) error
	FindByID(id uint) (*CourseReview, error)
	FindByUserAndCourse(userID, courseID uint) (*CourseReview, error)
	FindByCourseID(courseID uint, page, limit int) ([]CourseReview, int, error)
	FindByUserID(userID uint, page, limit int) ([]CourseReview, int, error)
	GetCourseReviewSummary(courseID uint) (*CourseReviewSummary, error)
	Exists(userID, courseID uint) (bool, error)
}

type reviewRepository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) ReviewRepository {
	return &reviewRepository{db: db}
}

func (r *reviewRepository) Create(review *CourseReview) error {
	return r.db.Create(review).Error
}

func (r *reviewRepository) Update(review *CourseReview) error {
	return r.db.Save(review).Error
}

func (r *reviewRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&CourseReview{}).Error
}

func (r *reviewRepository) FindByID(id uint) (*CourseReview, error) {
	var review CourseReview
	err := r.db.Preload("User").Preload("Course").First(&review, id).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *reviewRepository) FindByUserAndCourse(userID, courseID uint) (*CourseReview, error) {
	var review CourseReview
	err := r.db.Where("user_id = ? AND course_id = ?", userID, courseID).
		Preload("User").Preload("Course").First(&review).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *reviewRepository) FindByCourseID(courseID uint, page, limit int) ([]CourseReview, int, error) {
	var reviews []CourseReview
	var total int64

	offset := (page - 1) * limit

	// Get total count
	if err := r.db.Model(&CourseReview{}).Where("course_id = ?", courseID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := r.db.Where("course_id = ?", courseID).
		Preload("User").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&reviews).Error

	return reviews, int(total), err
}

func (r *reviewRepository) FindByUserID(userID uint, page, limit int) ([]CourseReview, int, error) {
	var reviews []CourseReview
	var total int64

	offset := (page - 1) * limit

	// Get total count
	if err := r.db.Model(&CourseReview{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := r.db.Where("user_id = ?", userID).
		Preload("Course").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&reviews).Error

	return reviews, int(total), err
}

func (r *reviewRepository) GetCourseReviewSummary(courseID uint) (*CourseReviewSummary, error) {
	var result struct {
		TotalReviews  int     `json:"total_reviews"`
		AverageRating float64 `json:"average_rating"`
		Rating1       int     `json:"rating_1"`
		Rating2       int     `json:"rating_2"`
		Rating3       int     `json:"rating_3"`
		Rating4       int     `json:"rating_4"`
		Rating5       int     `json:"rating_5"`
	}

	query := `
		SELECT
			COUNT(*) as total_reviews,
			COALESCE(AVG(rating), 0) as average_rating,
			SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as rating_1,
			SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as rating_2,
			SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as rating_3,
			SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as rating_4,
			SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as rating_5
		FROM course_reviews
		WHERE course_id = ?
	`

	if err := r.db.Raw(query, courseID).Scan(&result).Error; err != nil {
		return nil, err
	}

	ratingCounts := map[uint]int{
		1: result.Rating1,
		2: result.Rating2,
		3: result.Rating3,
		4: result.Rating4,
		5: result.Rating5,
	}

	return &CourseReviewSummary{
		CourseID:      courseID,
		TotalReviews:  result.TotalReviews,
		AverageRating: result.AverageRating,
		RatingCounts:  ratingCounts,
	}, nil
}

func (r *reviewRepository) Exists(userID, courseID uint) (bool, error) {
	var count int64
	err := r.db.Model(&CourseReview{}).
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Count(&count).Error
	return count > 0, err
}